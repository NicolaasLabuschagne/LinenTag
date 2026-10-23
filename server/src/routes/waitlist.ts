import { Router } from 'express';
import { z } from 'zod';
import type { Db } from '../db.js';

export const USAGE_TYPES = ['home', 'airbnb', 'vacation_rental', 'hotel', 'laundry', 'care_home', 'manufacturer', 'other'] as const;

const signup = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(200).transform((e) => e.toLowerCase()),
  company: z.string().trim().max(120).nullish(),
  usageType: z.enum(USAGE_TYPES),
  source: z.string().trim().max(60).nullish(),
});

/** Public (no sign-in): the website's "Join the waitlist" form. */
export function waitlistRouter(db: Db): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    const { name, email, company, usageType, source } = signup.parse(req.body);
    // Signing up twice updates the details instead of failing, and doesn't reveal who's on the list.
    await db.query(
      `INSERT INTO waitlist (name, email, company, usage_type, source) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, company = EXCLUDED.company, usage_type = EXCLUDED.usage_type`,
      [name, email, company || null, usageType, source || null],
    );
    res.status(201).json({ ok: true });
  });

  return router;
}
