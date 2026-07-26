import assert from "node:assert/strict";
import test from "node:test";

import {
  fetchAuthorReviews,
  fetchReviews,
  fetchReviewSummaries,
} from "@/features/reviews/data/reviewsApi";

const ORIGINAL_FETCH = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
});

test("評論 API 驗證並保留公開作者名稱與 Google 頭像", async () => {
  const review = {
    author: {
      id: "25e3af15-8024-427c-8840-4e4f2d2b2149",
      image: "https://lh3.googleusercontent.com/avatar/photo.jpg",
      name: "車泊旅人",
    },
    id: "review-1",
    attractionId: "spot-1",
    rating: 5,
    comment: "環境安靜。",
    updatedAt: "2026-08-30T08:00:00.000Z",
  };
  globalThis.fetch = async () => Response.json({ reviews: [review] });

  assert.deepEqual(await fetchReviews({ attractionId: "spot-1" }), [review]);
});

test("可依公開作者識別碼讀取該旅人的所有評論", async () => {
  let requestedUrl = "";
  const authorReview = {
    author: {
      id: "25e3af15-8024-427c-8840-4e4f2d2b2149",
      image: null,
      name: "車泊旅人",
    },
    id: "review-1",
    attractionId: "spot-1",
    attractionName: "測試景點",
    rating: 5,
    comment: "環境安靜。",
    updatedAt: "2026-08-30T08:00:00.000Z",
  };
  globalThis.fetch = async (input) => {
    requestedUrl = String(input);
    return Response.json({ hasMore: false, reviews: [authorReview] });
  };

  assert.deepEqual(
    await fetchAuthorReviews("25e3af15-8024-427c-8840-4e4f2d2b2149"),
    { hasMore: false, reviews: [authorReview] },
  );

  assert.equal(
    requestedUrl,
    "/api/reviews?authorId=25e3af15-8024-427c-8840-4e4f2d2b2149",
  );
});

test("作者評論 API 要求景點名稱", async () => {
  globalThis.fetch = async () =>
    Response.json({
      hasMore: false,
      reviews: [
        {
          author: {
            id: "25e3af15-8024-427c-8840-4e4f2d2b2149",
            image: null,
            name: "車泊旅人",
          },
          id: "review-1",
          attractionId: "spot-1",
          rating: 5,
          comment: "環境安靜。",
          updatedAt: "2026-08-30T08:00:00.000Z",
        },
      ],
    });

  await assert.rejects(
    fetchAuthorReviews("25e3af15-8024-427c-8840-4e4f2d2b2149"),
    /作者評論格式不正確/,
  );
});

test("評論摘要 API 驗證各景點的平均分數與評論數", async () => {
  const summary = {
    attractionId: "spot-1",
    averageRating: 4.5,
    totalReviews: 2,
  };
  globalThis.fetch = async () => Response.json({ summaries: [summary] });

  assert.deepEqual(await fetchReviewSummaries(), [summary]);
});

test("評論 API 不會悄悄忽略格式錯誤的資料列", async () => {
  globalThis.fetch = async () =>
    Response.json({ reviews: [{ attractionId: "spot-1" }] });

  await assert.rejects(
    fetchReviews({ attractionId: "spot-1" }),
    /評論資料格式不正確/,
  );
});
