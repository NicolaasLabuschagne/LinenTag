import { Router } from 'express';
import { z } from 'zod';
import type { Db } from '../db.js';
import { currentUser } from '../auth.js';
import { HttpError, notFound } from '../errors.js';
import { toLocation } from '../model.js';

const locationInput = z.object({ name: z.string().trim().min(1).max(60) });

export async function assertLocationOwned(db: Db, userId: string, locationId: string | null | undefined) {
  if (!locationId) return;
  const { rows } = await db.query('SELECT 1 FROM locations WHERE id = $1 AND user_id = $2', [locationId, userId]);
  if (!rows[0]) throw new HttpError(400, 'INVALID_LOCATION', 'Storage place does not exist');
}

export function locationsRouter(db: Db): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    const { rows } = await db.query('SELECT * FROM locations WHERE user_id = $1 ORDER BY created_at, name', [
      currentUser(res),
    ]);
    res.json({ locations: rows.map(toLocation) });
  });

  router.post('/', async (req, res) => {
    const { name } = locationInput.parse(req.body);
    const { rows } = await db.query('INSERT INTO locations (user_id, name) VALUES ($1, $2) RETURNING *', [
      currentUser(res),
      name,
    ]);
    res.status(201).json({ location: toLocation(rows[0]) });
  });

  router.patch('/:id', async (req, res) => {
    const { name } = locationInput.parse(req.body);
    const { rows } = await db.query('UPDATE locations SET name = $3 WHERE id = $1 AND user_id = $2 RETURNING *', [
      req.params.id,
      currentUser(res),
      name,
    ]);
    if (!rows[0]) throw notFound('Storage place');
    res.json({ location: toLocation(rows[0]) });
  });

  /** Sets stored here simply lose their place (ON DELETE SET NULL). */
  router.delete('/:id', async (req, res) => {
    const { rows } = await db.query('DELETE FROM locations WHERE id = $1 AND user_id = $2 RETURNING id', [
      req.params.id,
      currentUser(res),
    ]);
    if (!rows[0]) throw notFound('Storage place');
    res.status(204).end();
  });

  return router;
}
