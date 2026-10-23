import { createApp } from './app.js';
import { googleVerifier } from './auth.js';
import { config } from './config.js';
import { createPgDb } from './db.js';

const db = createPgDb(config.databaseUrl);
const app = createApp({
  db,
  jwtSecret: config.jwtSecret,
  verifyGoogleToken: googleVerifier(config.googleClientIds),
});

app.listen(config.port, () => {
  console.log(`LinenTag API listening on :${config.port}`);
});
