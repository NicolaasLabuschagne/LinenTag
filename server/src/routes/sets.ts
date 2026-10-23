import { Router } from 'express';
import { z } from 'zod';
import type { Db } from '../db.js';
import { currentUser } from '../auth.js';
import { HttpError, notFound } from '../errors.js';
import { SET_COLORS, SET_STATUSES, toItem, toSet } from '../model.js';
import { assertLocationOwned } from './locations.js';

const setInput = z.object({
  name: z.string().trim().min(1).max(120),
  room: z.string().trim().max(80).nullish(),
  notes: z.string().trim().max(2000).nullish(),
  /** Omitted on create: the least-used colour is picked so sets stay distinguishable. */
  color: z.enum(SET_COLORS).nullish(),
  /** Manual status change. To start using a set, POST /sets/:id/use (it also retires the room's current set). */
  status: z.enum(SET_STATUSES).optional(),
  locationId: z.uuid().nullish(),
  /** Full membership list; items not listed are removed from the set. */
  itemIds: z.array(z.uuid()).max(100).optional(),
});

const SET_SELECT = `SELECT s.*, l.name AS location_name FROM linen_sets s LEFT JOIN locations l ON l.id = s.location_id`;

export async function loadSetWithItems(db: Db, userId: string, setId: string) {
  const { rows } = await db.query(`${SET_SELECT} WHERE s.id = $1 AND s.user_id = $2`, [setId, userId]);
  if (!rows[0]) return null;
  const items = await db.query('SELECT * FROM items WHERE set_id = $1 ORDER BY type, lower(name)', [setId]);
  return { ...toSet(rows[0]), itemCount: items.rows.length, items: items.rows.map(toItem) };
}

async function assertItemsOwned(db: Db, userId: string, itemIds: string[]) {
  if (itemIds.length === 0) return;
  const { rows } = await db.query('SELECT count(*)::int AS n FROM items WHERE id = ANY($1) AND user_id = $2', [
    itemIds,
    userId,
  ]);
  if (rows[0].n !== new Set(itemIds).size) throw new HttpError(400, 'INVALID_ITEMS', 'Unknown item ids');
}

async function replaceMembers(db: Db, userId: string, setId: string, itemIds: string[]) {
  await db.query('UPDATE items SET set_id = NULL, updated_at = now() WHERE set_id = $1 AND NOT (id = ANY($2))', [
    setId,
    itemIds,
  ]);
  await db.query('UPDATE items SET set_id = $1, updated_at = now() WHERE id = ANY($2) AND user_id = $3', [
    setId,
    itemIds,
    userId,
  ]);
}

export async function leastUsedColor(db: Db, userId: string) {
  const { rows } = await db.query<{ color: string; n: number }>(
    'SELECT color, count(*)::int AS n FROM linen_sets WHERE user_id = $1 AND color IS NOT NULL GROUP BY color',
    [userId],
  );
  const used = new Map(rows.map((r) => [r.color, r.n]));
  // Stable: ties go to the earliest colour in the palette.
  return [...SET_COLORS].sort((a, b) => (used.get(a) ?? 0) - (used.get(b) ?? 0))[0];
}

export function setsRouter(db: Db): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    const { rows } = await db.query(
      `SELECT s.*, l.name AS location_name,
              (SELECT count(*) FROM items i WHERE i.set_id = s.id) AS item_count
       FROM linen_sets s LEFT JOIN locations l ON l.id = s.location_id
       WHERE s.user_id = $1 ORDER BY lower(s.name)`,
      [currentUser(res)],
    );
    res.json({ sets: rows.map(toSet) });
  });

  router.post('/', async (req, res) => {
    const userId = currentUser(res);
    const { name, room, notes, color, locationId, itemIds } = setInput.parse(req.body);
    if (itemIds) await assertItemsOwned(db, userId, itemIds);
    await assertLocationOwned(db, userId, locationId);
    const { rows } = await db.query(
      `INSERT INTO linen_sets (user_id, name, room, notes, color, location_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [userId, name, room || null, notes || null, color ?? (await leastUsedColor(db, userId)), locationId ?? null],
    );
    const setId = rows[0].id;
    if (itemIds) await replaceMembers(db, userId, setId, itemIds);
    res.status(201).json({ set: await loadSetWithItems(db, userId, setId) });
  });

  router.get('/:id', async (req, res) => {
    const set = await loadSetWithItems(db, currentUser(res), req.params.id);
    if (!set) throw notFound('Set');
    res.json({ set });
  });

  router.patch('/:id', async (req, res) => {
    const userId = currentUser(res);
    const input = setInput.partial().parse(req.body);
    if (input.itemIds) await assertItemsOwned(db, userId, input.itemIds);
    await assertLocationOwned(db, userId, input.locationId);

    const fields: [string, unknown][] = [];
    if (input.name !== undefined) fields.push(['name', input.name]);
    if (input.room !== undefined) fields.push(['room', input.room || null]);
    if (input.notes !== undefined) fields.push(['notes', input.notes || null]);
    if (input.color !== undefined) fields.push(['color', input.color]);
    if (input.locationId !== undefined) fields.push(['location_id', input.locationId]);
    if (input.status !== undefined) fields.push(['status', input.status]);

    const assignments = fields.map(([col], i) => `${col} = $${i + 3}`);
    if (input.status !== undefined) assignments.push('status_changed_at = now()');
    const { rows } = fields.length
      ? await db.query(
          `UPDATE linen_sets SET ${assignments.join(', ')}
           WHERE id = $1 AND user_id = $2 RETURNING id`,
          [req.params.id, userId, ...fields.map(([, v]) => v)],
        )
      : await db.query('SELECT id FROM linen_sets WHERE id = $1 AND user_id = $2', [req.params.id, userId]);
    if (!rows[0]) throw notFound('Set');
    if (input.itemIds) await replaceMembers(db, userId, req.params.id, input.itemIds);
    // A set's pieces live where the set lives.
    if (input.room !== undefined) {
      await db.query('UPDATE items SET room = $2, updated_at = now() WHERE set_id = $1', [req.params.id, input.room || null]);
    }
    res.json({ set: await loadSetWithItems(db, userId, req.params.id) });
  });

  /**
   * Put a set on the bed. The set that was in use in the same room goes to the laundry,
   * since only one set per room is on the bed at a time.
   */
  router.post('/:id/use', async (req, res) => {
    const userId = currentUser(res);
    const { rows } = await db.query('SELECT id, room FROM linen_sets WHERE id = $1 AND user_id = $2', [
      req.params.id,
      userId,
    ]);
    if (!rows[0]) throw notFound('Set');
    const room: string | null = rows[0].room?.trim() || null;

    const replaced = room
      ? await db.query<{ id: string; name: string }>(
          `UPDATE linen_sets SET status = 'laundry', status_changed_at = now()
           WHERE user_id = $1 AND id <> $2 AND status = 'in_use' AND lower(trim(room)) = lower($3)
           RETURNING id, name`,
          [userId, req.params.id, room],
        )
      : { rows: [] };
    await db.query(`UPDATE linen_sets SET status = 'in_use', status_changed_at = now() WHERE id = $1`, [req.params.id]);
    res.json({ set: await loadSetWithItems(db, userId, req.params.id), sentToLaundry: replaced.rows });
  });

  router.delete('/:id', async (req, res) => {
    const { rows } = await db.query('DELETE FROM linen_sets WHERE id = $1 AND user_id = $2 RETURNING id', [
      req.params.id,
      currentUser(res),
    ]);
    if (!rows[0]) throw notFound('Set');
    res.status(204).end();
  });

  return router;
}
