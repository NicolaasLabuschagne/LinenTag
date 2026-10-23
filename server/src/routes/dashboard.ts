import { Router } from 'express';
import type { Db } from '../db.js';
import { currentUser } from '../auth.js';
import { toItem } from '../model.js';

export function dashboardRouter(db: Db): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    const userId = currentUser(res);
    const [counts, recent] = await Promise.all([
      db.query(
        // Home-made labels from the website carry "FE…" tag IDs; those items could move to NFC tags.
        `SELECT (SELECT count(*) FROM items WHERE user_id = $1)::int AS items,
                (SELECT count(*) FROM linen_sets WHERE user_id = $1)::int AS sets,
                (SELECT count(*) FROM items WHERE user_id = $1 AND tag_uid LIKE 'FE%')::int AS printed`,
        [userId],
      ),
      db.query(
        `SELECT i.*, r.scanned_at AS last_scanned_at
         FROM (SELECT item_id, max(scanned_at) AS scanned_at FROM scans
               WHERE user_id = $1 GROUP BY item_id ORDER BY 2 DESC LIMIT 10) r
         JOIN items i ON i.id = r.item_id
         ORDER BY r.scanned_at DESC`,
        [userId],
      ),
    ]);
    res.json({
      totalItems: counts.rows[0].items,
      totalSets: counts.rows[0].sets,
      printedLabelItems: counts.rows[0].printed,
      recentlyScanned: recent.rows.map((r) => ({
        scannedAt: new Date(r.last_scanned_at).toISOString(),
        item: toItem(r),
      })),
    });
  });

  return router;
}
