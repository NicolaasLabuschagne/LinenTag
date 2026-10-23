import { Router } from 'express';
import { z } from 'zod';
import type { Db } from '../db.js';
import { currentUser } from '../auth.js';
import { HttpError } from '../errors.js';
import { ITEM_TYPES, SIZES, tagUid, toItem } from '../model.js';
import { assertLocationOwned } from './locations.js';
import { leastUsedColor, loadSetWithItems } from './sets.js';

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((s) => s || null);

/** What a product label (QR on the packaging) describes. Parsed on the phone. */
const productInput = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.enum(ITEM_TYPES),
  size: z.enum(SIZES).nullish(),
  material: text(80),
  color: text(40),
  /** Unique per retail pack; every piece of the pack carries the same code. */
  packCode: z.string().trim().min(1).max(64).nullish(),
  setName: text(120),
  pieceCount: z.number().int().min(1).max(50).nullish(),
  /** Which piece of the pack this is (1-based). */
  pieceNo: z.number().int().min(1).max(50).nullish(),
});

const intakeInput = z.object({
  product: productInput,
  tagUid: tagUid.nullish(),
  /** Chosen once by the user for the whole batch. */
  room: text(80),
  locationId: z.uuid().nullish(),
  /** Put the item into this existing set instead of grouping by the label's pack code. */
  setId: z.uuid().nullish(),
  /** The phone's local date; defaults to the server's today. */
  purchaseDate: z.iso.date().nullish(),
});

/** Identifies one piece of one pack; null for labels without a pack code. */
const productRefFor = (p: { packCode?: string | null; pieceNo?: number | null; name: string }) =>
  p.packCode ? `${p.packCode}#${p.pieceNo ?? p.name}` : null;

const labelLookup = productInput.pick({ name: true, packCode: true, pieceNo: true });

export function intakeRouter(db: Db): Router {
  const router = Router();

  /** Find the item a product label was registered as, so scanning a label works like scanning its tag. */
  router.post('/lookup', async (req, res) => {
    const productRef = productRefFor(labelLookup.parse(req.body));
    const { rows } = productRef
      ? await db.query('SELECT * FROM items WHERE user_id = $1 AND product_ref = $2', [currentUser(res), productRef])
      : { rows: [] };
    if (!rows[0]) throw new HttpError(404, 'LABEL_NOT_REGISTERED', 'This label hasn’t been added yet');
    res.json({ item: toItem(rows[0]) });
  });

  /**
   * Register one item from its product label: creates (or finds) the pack's set and the item,
   * and links its tag. Scanning the same label again returns the existing item.
   */
  router.post('/', async (req, res) => {
    const userId = currentUser(res);
    const input = intakeInput.parse(req.body);
    const { product, tagUid: uid, locationId, setId: targetSetId } = input;
    let room = input.room;
    await assertLocationOwned(db, userId, locationId);
    if (targetSetId) {
      const { rows } = await db.query('SELECT room FROM linen_sets WHERE id = $1 AND user_id = $2', [targetSetId, userId]);
      if (!rows[0]) throw new HttpError(400, 'INVALID_SET', 'Set does not exist');
      room ??= rows[0].room;
    }
    const productRef = productRefFor(product);

    if (productRef) {
      const { rows } = await db.query('SELECT * FROM items WHERE user_id = $1 AND product_ref = $2', [userId, productRef]);
      if (rows[0]) {
        let item = rows[0];
        if (uid && !item.tag_uid) {
          ({ rows: [item] } = await db
            .query('UPDATE items SET tag_uid = $2, updated_at = now() WHERE id = $1 RETURNING *', [item.id, uid])
            .catch(tagConflict));
        }
        if (targetSetId && item.set_id !== targetSetId) {
          ({ rows: [item] } = await db.query(
            'UPDATE items SET set_id = $2, updated_at = now() WHERE id = $1 RETURNING *',
            [item.id, targetSetId],
          ));
        }
        const set = item.set_id ? await loadSetWithItems(db, userId, item.set_id) : null;
        res.json({ item: toItem(item), set, itemCreated: false, setCreated: false });
        return;
      }
    }

    let setId: string | null = targetSetId ?? null;
    let setCreated = false;
    if (!setId && product.packCode) {
      const found = await db.query('SELECT id FROM linen_sets WHERE user_id = $1 AND pack_code = $2', [
        userId,
        product.packCode,
      ]);
      setId = found.rows[0]?.id ?? null;
      if (!setId) {
        const created = await db.query(
          `INSERT INTO linen_sets (user_id, name, room, color, location_id, pack_code, expected_pieces)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (user_id, pack_code) WHERE pack_code IS NOT NULL DO NOTHING
           RETURNING id`,
          [
            userId,
            product.setName ?? `${product.name} set`,
            room,
            await leastUsedColor(db, userId),
            locationId ?? null,
            product.packCode,
            product.pieceCount ?? null,
          ],
        );
        setCreated = !!created.rows[0];
        // Lost a race with a concurrent scan of the same pack: use its set.
        setId =
          created.rows[0]?.id ??
          (await db.query('SELECT id FROM linen_sets WHERE user_id = $1 AND pack_code = $2', [userId, product.packCode]))
            .rows[0].id;
      }
    }

    const { rows } = await db
      .query(
        `INSERT INTO items (user_id, set_id, tag_uid, name, type, size, material, color, room, product_ref, purchase_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11::date, CURRENT_DATE)) RETURNING *`,
        [
          userId,
          setId,
          uid ?? null,
          product.name,
          product.type,
          product.size ?? null,
          product.material,
          product.color,
          room,
          productRef,
          input.purchaseDate ?? null,
        ],
      )
      .catch(tagConflict);
    const set = setId ? await loadSetWithItems(db, userId, setId) : null;
    res.status(201).json({ item: toItem(rows[0]), set, itemCreated: true, setCreated });
  });

  return router;
}

function tagConflict(err: any): never {
  if (err?.code === '23505' && String(err?.constraint ?? err?.message).includes('tag_uid')) {
    throw new HttpError(409, 'TAG_IN_USE', 'This tag is already linked to another item');
  }
  throw err;
}
