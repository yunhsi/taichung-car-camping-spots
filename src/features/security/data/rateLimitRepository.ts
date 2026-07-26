import "server-only";

import { sql } from "drizzle-orm";

import { getDatabase } from "@/lib/db";

interface ConsumeRateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  isAllowed: boolean;
  retryAfterSeconds: number;
}

interface RateLimitRow extends Record<string, unknown> {
  requestCount: number;
  windowStartedAt: Date | string;
}

export async function consumeRateLimit({
  key,
  limit,
  windowMs,
}: ConsumeRateLimitOptions): Promise<RateLimitResult> {
  const database = getDatabase();
  const now = new Date();
  const expiredBefore = new Date(now.getTime() - windowMs);
  const result = await database.execute<RateLimitRow>(sql`
    INSERT INTO api_rate_limits (key, request_count, window_started_at)
    VALUES (${key}, 1, ${now})
    ON CONFLICT (key) DO UPDATE SET
      request_count = CASE
        WHEN api_rate_limits.window_started_at <= ${expiredBefore} THEN 1
        ELSE api_rate_limits.request_count + 1
      END,
      window_started_at = CASE
        WHEN api_rate_limits.window_started_at <= ${expiredBefore} THEN ${now}
        ELSE api_rate_limits.window_started_at
      END
    RETURNING
      request_count AS "requestCount",
      window_started_at AS "windowStartedAt"
  `);
  const row = result.rows[0];

  if (!row) {
    throw new Error("Rate limit update returned no row.");
  }

  const windowStartedAt =
    row.windowStartedAt instanceof Date
      ? row.windowStartedAt
      : new Date(row.windowStartedAt);

  if (Number.isNaN(windowStartedAt.getTime())) {
    throw new Error("Rate limit update returned an invalid timestamp.");
  }

  const retryAfterMs = windowStartedAt.getTime() + windowMs - now.getTime();

  return {
    isAllowed: row.requestCount <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
  };
}
