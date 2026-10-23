import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { authRouter, requireAuth, type VerifyGoogleToken } from './auth.js';
import type { Db } from './db.js';
import { errorHandler } from './errors.js';
import { dashboardRouter } from './routes/dashboard.js';
import { intakeRouter } from './routes/intake.js';
import { itemsRouter } from './routes/items.js';
import { locationsRouter } from './routes/locations.js';
import { scanRouter } from './routes/scan.js';
import { setsRouter } from './routes/sets.js';
import { waitlistRouter } from './routes/waitlist.js';

// Same relative location from src/ (dev) and dist/ (build).
const WEB_DIR = path.join(import.meta.dirname, '..', '..', 'web');

export type AppDeps = {
  db: Db;
  jwtSecret: string;
  verifyGoogleToken: VerifyGoogleToken;
};

export function createApp(deps: AppDeps) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '100kb' }));

  // The LinenTag website (landing page, /labels for bedding without tags), served alongside the API.
  app.use(express.static(WEB_DIR, { extensions: ['html'] }));
  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });
  app.use('/auth', authRouter(deps));
  app.use('/waitlist', waitlistRouter(deps.db));

  const authed = requireAuth(deps.jwtSecret);
  app.use('/items', authed, itemsRouter(deps.db));
  app.use('/sets', authed, setsRouter(deps.db));
  app.use('/locations', authed, locationsRouter(deps.db));
  app.use('/intake', authed, intakeRouter(deps.db));
  app.use('/scan', authed, scanRouter(deps.db));
  app.use('/dashboard', authed, dashboardRouter(deps.db));

  app.use(errorHandler);
  return app;
}
