import assert from "node:assert/strict";
import test from "node:test";

import { requestUpdateFavorite } from "@/features/favorites/data/favoritesApi";
import { requestCreateReview } from "@/features/reviews/data/reviewsApi";

test("收藏與評論 API 將 429 轉成可理解的操作提示", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    Response.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } },
    );

  try {
    await assert.rejects(
      () => requestUpdateFavorite("attraction-1", true),
      /操作太頻繁，請稍後再試/,
    );
    await assert.rejects(
      () => requestCreateReview("attraction-1", 5, "測試評論"),
      /操作太頻繁，請稍後再試/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
