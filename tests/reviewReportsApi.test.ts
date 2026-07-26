import assert from "node:assert/strict";
import test from "node:test";

import { requestCreateReviewReport } from "@/features/reviews/data/reviewReportsApi";

const ORIGINAL_FETCH = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
});

test("送出評論檢舉會正規化補充說明", async () => {
  let requestBody = "";
  globalThis.fetch = async (_input, init) => {
    requestBody = String(init?.body);
    return Response.json({ success: true });
  };

  await requestCreateReviewReport(
    "4a10a3e4-f975-477f-b7a9-831661de9e0f",
    "spam",
    "  重複張貼廣告  ",
  );

  assert.deepEqual(JSON.parse(requestBody), {
    reviewId: "4a10a3e4-f975-477f-b7a9-831661de9e0f",
    reason: "spam",
    details: "重複張貼廣告",
  });
});

test("重複檢舉會顯示可理解的訊息", async () => {
  globalThis.fetch = async () =>
    Response.json({ error: "duplicate" }, { status: 409 });

  await assert.rejects(
    requestCreateReviewReport(
      "4a10a3e4-f975-477f-b7a9-831661de9e0f",
      "spam",
      "",
    ),
    /已檢舉過這則評論/,
  );
});
