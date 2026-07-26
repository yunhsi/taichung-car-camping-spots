import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { loadEnvConfig } from "@next/env";
import { Pool, type QueryResultRow } from "pg";

loadEnvConfig(process.cwd());

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured.");
}

interface DatabaseInfo extends QueryResultRow {
  databaseName: string;
  version: string;
}

interface MigrationInfo extends QueryResultRow {
  hash: string;
}

interface TableInfo extends QueryResultRow {
  tableName: string;
}

const REQUIRED_TABLES = [
  "accounts",
  "api_rate_limits",
  "favorites",
  "review_reports",
  "reviews",
  "sessions",
  "users",
] as const;

async function checkDatabase(): Promise<void> {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    const result = await pool.query<DatabaseInfo>(`
      SELECT
        current_database() AS "databaseName",
        current_setting('server_version') AS "version"
    `);
    const databaseInfo = result.rows[0];

    if (!databaseInfo) {
      throw new Error("Database check returned no rows.");
    }

    const tableResult = await pool.query<TableInfo>(
      `
        SELECT table_name AS "tableName"
        FROM information_schema.tables
        WHERE table_schema = current_schema()
          AND table_name = ANY($1::text[])
      `,
      [REQUIRED_TABLES],
    );
    const existingTables = new Set(
      tableResult.rows.map((row) => row.tableName),
    );
    const missingTables = REQUIRED_TABLES.filter(
      (tableName) => !existingTables.has(tableName),
    );

    if (missingTables.length > 0) {
      throw new Error(
        `Database is missing required tables: ${missingTables.join(", ")}.`,
      );
    }

    const migrationsDirectory = path.join(process.cwd(), "drizzle");
    const migrationFiles = (await readdir(migrationsDirectory))
      .filter((fileName) => fileName.endsWith(".sql"))
      .sort();
    const migrationResult = await pool.query<MigrationInfo>(`
      SELECT hash
      FROM drizzle.__drizzle_migrations
    `);
    const appliedMigrationHashes = new Set(
      migrationResult.rows.map((migration) => migration.hash),
    );
    const missingMigrationFiles: string[] = [];

    for (const migrationFile of migrationFiles) {
      const migrationSql = await readFile(
        path.join(migrationsDirectory, migrationFile),
        "utf8",
      );
      const migrationHash = createHash("sha256")
        .update(migrationSql)
        .digest("hex");

      if (!appliedMigrationHashes.has(migrationHash)) {
        missingMigrationFiles.push(migrationFile);
      }
    }

    if (missingMigrationFiles.length > 0) {
      throw new Error(
        `Database is missing migrations: ${missingMigrationFiles.join(", ")}.`,
      );
    }

    process.stdout.write(
      `Connected to ${databaseInfo.databaseName} (PostgreSQL ${databaseInfo.version}); ` +
        `${REQUIRED_TABLES.length} required tables and ${migrationFiles.length} local migrations verified.\n`,
    );
  } finally {
    await pool.end();
  }
}

checkDatabase().catch((error: unknown) => {
  console.error("Database check failed.", error);
  process.exitCode = 1;
});
