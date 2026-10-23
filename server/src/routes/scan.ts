import { Router } from 'express';
import { z } from 'zod';
import type { Db } from '../db.js';
import { currentUser } from '../auth.js';
import { HttpError } from '../errors.js';
import { tagUid, toItem } from '../model.js';
import { loadSetWithItems } from './sets.js';

const scanInput = z.object({
  tagUid,
  /** Count this scan as a wash cycle. */
  wash: z.boolean().optional(),
});

export function scanRouter(db: Db): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    const userId = currentUser(res);
    const { tagUid: uid, wash = false } = scanInput.parse(req.body);

    const { rows } = await db.query(
      wash
        ? `UPDATE items SET wash_count = wash_count + 1, last_washed_at = now(), updated_at = now()
           WHERE tag_uid = $1 AND user_id = $2 RETURNING *`
        : 'SELECT * FROM items WHERE tag_uid = $1 AND user_id = $2',
      [uid, userId],
    );
    // Tags owned by other accounts look unregistered, so nothing leaks between users.
    if (!rows[0]) throw new HttpError(404, 'TAG_NOT_REGISTERED', 'This tag is not linked to any of your items');

    const item = toItem(rows[0]);
    await db.query('INSERT INTO scans (user_id, item_id, washed) VALUES ($1, $2, $3)', [userId, item.id, wash]);
    const set = item.setId ? await loadSetWithItems(db, userId, item.setId) : null;
    res.json({ item, set });
  });

  return router;
}
