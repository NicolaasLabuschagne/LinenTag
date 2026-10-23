import bcrypt from 'bcryptjs';
import { Router, type RequestHandler, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import type { AppDeps } from './app.js';
import { HttpError } from './errors.js';
import { toUser, userSettingsPatch } from './model.js';

const TOKEN_TTL = '30d';

export type GoogleIdentity = { sub: string; email: string; emailVerified: boolean; name?: string };
export type VerifyGoogleToken = (idToken: string) => Promise<GoogleIdentity>;

export function signToken(userId: string, secret: string): string {
  return jwt.sign({}, secret, { subject: userId, expiresIn: TOKEN_TTL });
}

export function requireAuth(secret: string): RequestHandler {
  return (req, res, next) => {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    try {
      const payload = jwt.verify(token, secret);
      if (typeof payload === 'string' || !payload.sub) throw new Error('bad payload');
      res.locals.userId = payload.sub;
      next();
    } catch {
      next(new HttpError(401, 'UNAUTHENTICATED', 'Sign in required'));
    }
  };
}

export const currentUser = (res: Response): string => res.locals.userId;

const credentials = z.object({
  email: z.email().transform((e) => e.toLowerCase()),
  password: z.string().min(8).max(200),
  name: z.string().trim().max(80).optional(),
});

const mePatch = z.object({
  name: z.string().trim().max(80).nullish(),
  settings: userSettingsPatch.optional(),
  /** Setup can only be completed, never undone. */
  onboarded: z.literal(true).optional(),
});

export function authRouter({ db, jwtSecret, verifyGoogleToken }: AppDeps): Router {
  const router = Router();
  const session = (row: any) => ({ token: signToken(row.id, jwtSecret), user: toUser(row) });

  router.post('/register', async (req, res) => {
    const { email, password, name } = credentials.parse(req.body);
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING RETURNING *`,
      [email, hash, name || null],
    );
    if (!rows[0]) throw new HttpError(409, 'EMAIL_TAKEN', 'An account with that email already exists');
    res.status(201).json(session(rows[0]));
  });

  router.post('/login', async (req, res) => {
    const { email, password } = credentials.pick({ email: true, password: true }).parse(req.body);
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user?.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
      throw new HttpError(401, 'BAD_CREDENTIALS', 'Incorrect email or password');
    }
    res.json(session(user));
  });

  router.post('/google', async (req, res) => {
    const { idToken } = z.object({ idToken: z.string().min(1) }).parse(req.body);
    let identity: GoogleIdentity;
    try {
      identity = await verifyGoogleToken(idToken);
    } catch {
      throw new HttpError(401, 'BAD_GOOGLE_TOKEN', 'Google sign-in could not be verified');
    }
    const email = identity.email.toLowerCase();

    let { rows } = await db.query('SELECT * FROM users WHERE google_sub = $1', [identity.sub]);
    if (!rows[0]) {
      if (!identity.emailVerified) {
        throw new HttpError(401, 'BAD_GOOGLE_TOKEN', 'Google account email is not verified');
      }
      // Link Google to an existing email/password account with the same verified address.
      ({ rows } = await db.query(
        'UPDATE users SET google_sub = $1 WHERE email = $2 AND google_sub IS NULL RETURNING *',
        [identity.sub, email],
      ));
    }
    if (!rows[0]) {
      ({ rows } = await db.query(
        `INSERT INTO users (email, google_sub, name) VALUES ($1, $2, $3)
         ON CONFLICT (email) DO NOTHING RETURNING *`,
        [email, identity.sub, identity.name ?? null],
      ));
      // Email belongs to an account already linked to a different Google identity.
      if (!rows[0]) throw new HttpError(409, 'EMAIL_TAKEN', 'An account with that email already exists');
    }
    res.json(session(rows[0]));
  });

  router.get('/me', requireAuth(jwtSecret), async (_req, res) => {
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [currentUser(res)]);
    if (!rows[0]) throw new HttpError(401, 'UNAUTHENTICATED', 'Account no longer exists');
    res.json({ user: toUser(rows[0]) });
  });

  router.patch('/me', requireAuth(jwtSecret), async (req, res) => {
    const patch = mePatch.parse(req.body);
    const { rows } = await db.query(
      `UPDATE users SET
         name         = CASE WHEN $2::boolean THEN $3 ELSE name END,
         settings     = settings || $4::jsonb,
         onboarded_at = COALESCE(onboarded_at, CASE WHEN $5::boolean THEN now() END)
       WHERE id = $1 RETURNING *`,
      [
        currentUser(res),
        patch.name !== undefined,
        patch.name || null,
        JSON.stringify(patch.settings ?? {}),
        patch.onboarded === true,
      ],
    );
    if (!rows[0]) throw new HttpError(401, 'UNAUTHENTICATED', 'Account no longer exists');
    res.json({ user: toUser(rows[0]) });
  });

  return router;
}

export function googleVerifier(clientIds: string[]): VerifyGoogleToken {
  return async (idToken) => {
    if (clientIds.length === 0) throw new Error('GOOGLE_CLIENT_IDS not configured');
    const { OAuth2Client } = await import('google-auth-library');
    const ticket = await new OAuth2Client().verifyIdToken({ idToken, audience: clientIds });
    const p = ticket.getPayload();
    if (!p?.sub || !p.email) throw new Error('Token missing subject or email');
    return { sub: p.sub, email: p.email, emailVerified: p.email_verified === true, name: p.name };
  };
}
