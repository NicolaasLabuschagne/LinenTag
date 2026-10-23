import { Router } from 'express';
import { z } from 'zod';
import type { Db } from '../db.js';
import { currentUser } from '../auth.js';
import { HttpError, notFound } from '../errors.js';
import { ITEM_COLUMNS, ITEM_TYPES, SIZES, STATUSES, itemInput, tagUid, toItem, type ItemInput } from '../model.js';

const listQuery = z.object({
  size: z.enum(SIZES).optional(),
  type: z.enum(ITEM_TYPES).optional(),
  status: z.enum(STATUSES).optional(),
  room: z.string().optional(),
  material: z.string().optional(),
  setId: z.uuid().optional(),
  q: z.string().optional(),
});

export async function assertSetOwned(db: Db, userId: string, setId: string | null | undefined) {
  if (!setId) return;
  const { rows } = await db.query('SELECT 1 FROM linen_sets WHERE id = $1 AND user_id = $2', [setId, userId]);
  if (!rows[0]) throw new HttpError(400, 'INVALID_SET', 'Set does not exist');
}

function columnsFor(input: Partial<ItemInput>) {
  const entries = Object.entries(input).filter(([, v]) => v !== undefined) as [keyof ItemInput, unknown][];
  return { cols: entries.map(([k]) => ITEM_COLUMNS[k]), values: entries.map(([, v]) => v ?? null) };
}

function tagConflict(err: any): never {
  if (err?.code === '23505') throw new HttpError(409, 'TAG_IN_USE', 'This tag is already linked to another item');
  throw err;
}

export function itemsRouter(db: Db): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    const f = listQuery.parse(req.query);
    const where = ['user_id = $1'];
    const params: unknown[] = [currentUser(res)];
    const add = (sql: string, value: unknown) => {
      params.push(value);
      where.push(sql.replace('?', `$${params.length}`));
    };
    if (f.size) add('size = ?', f.size);
    if (f.type) add('type = ?', f.type);
    if (f.status) add('status = ?', f.status);
    if (f.setId) add('set_id = ?', f.setId);
    if (f.room) add('lower(room) = lower(?)', f.room);
    if (f.material) add('lower(material) = lower(?)', f.material);
    if (f.q) add(`name ILIKE '%' || ? || '%'`, f.q);

    const { rows } = await db.query(
      `SELECT * FROM items WHERE ${where.join(' AND ')} ORDER BY lower(name), created_at`,
      params,
    );
    res.json({ items: rows.map(toItem) });
  });

  router.post('/', async (req, res) => {
    const userId = currentUser(res);
    const input = itemInput.parse(req.body);
    await assertSetOwned(db, userId, input.setId);
    // No purchase date: leave the column out so it defaults to today.
    if (input.purchaseDate == null) delete input.purchaseDate;
    const { cols, values } = columnsFor(input);
    const placeholders = values.map((_, i) => `$${i + 2}`);
    const { rows } = await db
      .query(
        `INSERT INTO items (user_id, ${cols.join(', ')}) VALUES ($1, ${placeholders.join(', ')}) RETURNING *`,
        [userId, ...values],
      )
      .catch(tagConflict);
    res.status(201).json({ item: toItem(rows[0]) });
  });

  router.get('/:id', async (req, res) => {
    const { rows } = await db.query('SELECT * FROM items WHERE id = $1 AND user_id = $2', [
      req.params.id,
      currentUser(res),
    ]);
    if (!rows[0]) throw notFound('Item');
    res.json({ item: toItem(rows[0]) });
  });

  router.patch('/:id', async (req, res) => {
    const userId = currentUser(res);
    const input = itemInput.partial().parse(req.body);
    await assertSetOwned(db, userId, input.setId);
    const { cols, values } = columnsFor(input);
    if (cols.length === 0) throw new HttpError(400, 'VALIDATION', 'Nothing to update');
    const assignments = cols.map((c, i) => `${c} = $${i + 3}`);
    const { rows } = await db
      .query(
        `UPDATE items SET ${assignments.join(', ')}, updated_at = now()
         WHERE id = $1 AND user_id = $2 RETURNING *`,
        [req.params.id, userId, ...values],
      )
      .catch(tagConflict);
    if (!rows[0]) throw notFound('Item');
    res.json({ item: toItem(rows[0]) });
  });

  router.delete('/:id', async (req, res) => {
    const { rows } = await db.query('DELETE FROM items WHERE id = $1 AND user_id = $2 RETURNING id', [
      req.params.id,
      currentUser(res),
    ]);
    if (!rows[0]) throw notFound('Item');
    res.status(204).end();
  });

  /** Link (or re-link) a physical tag to an item. */
  router.put('/:id/tag', async (req, res) => {
    const { tagUid: uid } = z.object({ tagUid }).parse(req.body);
    const { rows } = await db
      .query('UPDATE items SET tag_uid = $3, updated_at = now() WHERE id = $1 AND user_id = $2 RETURNING *', [
        req.params.id,
        currentUser(res),
        uid,
      ])
      .catch(tagConflict);
    if (!rows[0]) throw notFound('Item');
    res.json({ item: toItem(rows[0]) });
  });

  router.delete('/:id/tag', async (req, res) => {
    const { rows } = await db.query(
      'UPDATE items SET tag_uid = NULL, updated_at = now() WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, currentUser(res)],
    );
    if (!rows[0]) throw notFound('Item');
    res.json({ item: toItem(rows[0]) });
  });

  return router;
}
