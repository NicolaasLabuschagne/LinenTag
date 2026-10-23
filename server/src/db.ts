import pg from 'pg';

/** Minimal surface the app needs; satisfied by pg.Pool and by PGlite in tests. */
export interface Db {
  query<T = any>(text: string, params?: unknown[]): Promise<{ rows: T[] }>;
  /** Run a multi-statement SQL script (migrations). */
  exec(sql: string): Promise<unknown>;
}

// Return DATE columns as 'YYYY-MM-DD' instead of a local-midnight Date.
pg.types.setTypeParser(pg.types.builtins.DATE, (v) => v);

export function createPgDb(connectionString: string): Db & { end(): Promise<void> } {
  // Serverless (Vercel) runs many short-lived copies: keep each one's share of connections small.
  const pool = new pg.Pool({ connectionString, max: process.env.VERCEL ? 3 : 10 });
  return {
    query: (text, params) => pool.query(text, params as any[]) as Promise<{ rows: any[] }>,
    exec: (sql) => pool.query(sql),
    end: () => pool.end(),
  };
}
