import { NextResponse } from "next/server";

import { consumeRateLimit } from "@/features/security/data/rateLimitRepository";

interface EnforceUserRateLimitOptions {
  action: "favorite-write" | "review-report" | "review-write";
  limit: number;
  userId: string;
  windowMs: number;
}

export async function enforceUserRateLimit({
  action,
  limit,
  userId,
  windowMs,
}: EnforceUserRateLimitOptions): Promise<NextResponse | null> {
  const result = await consumeRateLimit({
    key: `${action}:${userId}`,
    limit,
    windowMs,
  });

  if (result.isAllowed) {
    return null;
  }

  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: { "Retry-After": String(result.retryAfterSeconds) },
    },
  );
}
