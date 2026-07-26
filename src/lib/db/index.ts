import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const GLOBAL_FOR_DATABASE = globalThis as typeof globalThis & {
  databasePool?: Pool;
};

let database: ReturnType<typeof drizzle> | undefined;

export function getDatabase(): ReturnType<typeof drizzle> {
  if (database) {
    return database;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const databasePool =
    GLOBAL_FOR_DATABASE.databasePool ??
    new Pool({ connectionString: databaseUrl });

  if (process.env.NODE_ENV !== "production") {
    GLOBAL_FOR_DATABASE.databasePool = databasePool;
  }

  database = drizzle(databasePool);

  return database;
}
