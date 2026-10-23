import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Db } from './db.js';

const MIGRATIONS_DIR = path.join(import.meta.dirname, '..', 'migrations');

export async function migrate(db: Db, log: (msg: string) => void = () => {}): Promise<void> {
  await db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const { rows } = await db.query<{ name: string }>('SELECT name FROM schema_migrations');
  const applied = new Set(rows.map((r) => r.name));
  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
    await db.exec(`BEGIN;\n${sql}\nINSERT INTO schema_migrations (name) VALUES ('${file}');\nCOMMIT;`);
    log(`applied ${file}`);
  }
}

// `npm run migrate`
if (process.argv[1] && import.meta.filename === path.resolve(process.argv[1])) {
  const { config } = await import('./config.js');
  const { createPgDb } = await import('./db.js');
  const db = createPgDb(config.databaseUrl);
  try {
    await migrate(db, console.log);
    console.log('migrations up to date');
  } finally {
    await db.end();
  }
}
