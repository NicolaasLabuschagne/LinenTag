// Vercel entry point. The server is compiled by `npm run build` (tsc → dist/); this plain-JS file
// hands the built Express app to Vercel as a function, so Vercel never compiles the TypeScript itself.
// All paths are routed here by vercel.json. Locally and on other hosts, `npm start` runs dist/index.js.
import { createApp } from '../dist/app.js';
import { googleVerifier } from '../dist/auth.js';
import { config } from '../dist/config.js';
import { createPgDb } from '../dist/db.js';

const app = createApp({
  db: createPgDb(config.databaseUrl),
  jwtSecret: config.jwtSecret,
  verifyGoogleToken: googleVerifier(config.googleClientIds),
});

export default app;
