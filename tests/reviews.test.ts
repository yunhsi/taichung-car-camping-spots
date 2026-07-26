import assert from "node:assert/strict";
import test from "node:test";

import { readAttractions } from "@/features/attractions/data/attractions";
import {
  clearAttractionReviews,
  deletePublicReview,
  getAttractionReviewsSnapshot,
  getAttractionReviewSummarySnapshot,
  getOwnAttractionReviewSnapshot,
  replaceOwnReviews,
  replaceAttractionReviews,
  replaceReviewSummaries,
  setOwnReviewsStatus,
  setOwnReview,
  setPublicReview,
  subscribeToReviews,
} from "@/features/reviews/data/reviewsStore";
import {
  parseReviewDeleteInput,
  parseReviewInput,
  parseReviewQuery,
} from "@/features/reviews/lib/reviewApiValidation";
import {
  MAX_AUTHOR_REVIEWS_OFFSET,
  parseAuthorReviewsOffset,
} from "@/features/reviews/lib/reviewPagination";
import { formatRelativeReviewDate } from "@/features/reviews/lib/reviewDate";
import { sortReviews } from "@/features/reviews/lib/reviewSort";
import { summarizeReviews } from "@/features/reviews/lib/reviewSummary";
import { parseReviewReportInput } from "@/features/reviews/lib/reviewReportValidation";
import { containsInappropriateReviewContent } from "@/features/reviews/lib/reviewValidation";
import type { AttractionReview } from "@/features/reviews/types";

const ATTRACTION_ID = readAttractions()[0]?.id;
const REVIEW_AUTHOR = {
  id: "25e3af15-8024-427c-8840-4e4f2d2b2149",
  image: null,
  name: "測試旅人",
};

if (!ATTRACTION_ID) {
  throw new Error("測試需要至少一個景點。");
}

const OLDER_REVIEW: AttractionReview = {
  author: REVIEW_AUTHOR,
  id: "review-1",
  attractionId: ATTRACTION_ID,
  rating: 4,
  comment: "原始評論",
  updatedAt: "2026-08-01T08:00:00.000Z",
};
const NEWER_REVIEW: AttractionReview = {
  ...OLDER_REVIEW,
  id: "review-2",
  rating: 5,
  comment: "較新的公開評論",
  updatedAt: "2026-08-02T08:00:00.000Z",
};

test.beforeEach(() => {
  replaceReviewSummaries([]);
  replaceAttractionReviews(ATTRACTION_ID, []);
  replaceOwnReviews([]);
  setOwnReviewsStatus("idle");
});

test("作者評論分頁只接受安全的非負整數位移", () => {
  assert.equal(parseAuthorReviewsOffset(null), 0);
  assert.equal(parseAuthorReviewsOffset("10"), 10);
  assert.equal(parseAuthorReviewsOffset("-1"), null);
  assert.equal(parseAuthorReviewsOffset("1.5"), null);
  assert.equal(
    parseAuthorReviewsOffset(String(MAX_AUTHOR_REVIEWS_OFFSET + 1)),
    null,
  );
});

test("評論查詢只接受單一明確範圍", () => {
  assert.deepEqual(parseReviewQuery(new URLSearchParams()), {
    scope: "summaries",
  });
  assert.deepEqual(parseReviewQuery(new URLSearchParams({ mine: "true" })), {
    scope: "mine",
  });
  assert.deepEqual(
    parseReviewQuery(
      new URLSearchParams({
        authorId: REVIEW_AUTHOR.id,
        offset: "10",
      }),
    ),
    { scope: "author", authorId: REVIEW_AUTHOR.id, offset: 10 },
  );
  assert.deepEqual(
    parseReviewQuery(new URLSearchParams({ attractionId: ATTRACTION_ID })),
    { scope: "attraction", attractionId: ATTRACTION_ID },
  );

  assert.equal(
    parseReviewQuery(
      new URLSearchParams({ authorId: REVIEW_AUTHOR.id, mine: "true" }),
    ),
    null,
  );
  assert.equal(
    parseReviewQuery(new URLSearchParams({ attractionId: ATTRACTION_ID, offset: "1" })),
    null,
  );
  assert.equal(parseReviewQuery(new URLSearchParams({ mine: "false" })), null);
  assert.equal(parseReviewQuery(new URLSearchParams({ unknown: "value" })), null);

  const duplicatedScope = new URLSearchParams();
  duplicatedScope.append("authorId", REVIEW_AUTHOR.id);
  duplicatedScope.append("authorId", REVIEW_AUTHOR.id);
  assert.equal(parseReviewQuery(duplicatedScope), null);
});

test("保留景點的所有公開評論並與會員自己的評論分開保存", () => {
  replaceAttractionReviews(ATTRACTION_ID, [OLDER_REVIEW, NEWER_REVIEW]);
  setOwnReview(OLDER_REVIEW);

  assert.deepEqual(
    getAttractionReviewsSnapshot(ATTRACTION_ID),
    [NEWER_REVIEW, OLDER_REVIEW],
  );
  assert.deepEqual(getOwnAttractionReviewSnapshot(ATTRACTION_ID), OLDER_REVIEW);
});

test("公開評論新增、更新與刪除只影響指定評論", () => {
  replaceAttractionReviews(ATTRACTION_ID, [OLDER_REVIEW, NEWER_REVIEW]);
  const updatedOlderReview: AttractionReview = {
    ...OLDER_REVIEW,
    rating: 3,
    comment: "更新後的評論",
    updatedAt: "2026-08-03T08:00:00.000Z",
  };

  setPublicReview(updatedOlderReview);
  deletePublicReview(ATTRACTION_ID, NEWER_REVIEW.id);

  assert.deepEqual(
    getAttractionReviewsSnapshot(ATTRACTION_ID),
    [updatedOlderReview],
  );
});

test("尚未載入完整評論時可依本人評論增量更新摘要", () => {
  clearAttractionReviews(ATTRACTION_ID);
  replaceReviewSummaries([
    { attractionId: ATTRACTION_ID, averageRating: 4, totalReviews: 2 },
  ]);
  const createdReview: AttractionReview = {
    ...OLDER_REVIEW,
    id: "review-created",
    rating: 5,
  };

  setPublicReview(createdReview);
  assert.deepEqual(getAttractionReviewSummarySnapshot(ATTRACTION_ID), {
    averageRating: 13 / 3,
    totalReviews: 3,
  });

  const updatedReview: AttractionReview = { ...createdReview, rating: 2 };
  setPublicReview(updatedReview, createdReview);
  assert.deepEqual(getAttractionReviewSummarySnapshot(ATTRACTION_ID), {
    averageRating: 10 / 3,
    totalReviews: 3,
  });

  deletePublicReview(ATTRACTION_ID, updatedReview.id, updatedReview);
  assert.deepEqual(getAttractionReviewSummarySnapshot(ATTRACTION_ID), {
    averageRating: 4,
    totalReviews: 2,
  });
});

test("彙整平均評分、評論數與各星等數量", () => {
  const summary = summarizeReviews([OLDER_REVIEW, NEWER_REVIEW]);

  assert.equal(summary.averageRating, 4.5);
  assert.equal(summary.totalReviews, 2);
  assert.deepEqual(summary.ratingCounts, {
    1: 0,
    2: 0,
    3: 0,
    4: 1,
    5: 1,
  });
});

test("評論可依最新、最高與最低排序", () => {
  const lowestReview: AttractionReview = {
    ...NEWER_REVIEW,
    id: "lowest-review",
    rating: 2,
  };

  assert.deepEqual(
    sortReviews([OLDER_REVIEW, lowestReview, NEWER_REVIEW], "latest").map(
      (review) => review.id,
    ),
    ["review-2", "lowest-review", "review-1"],
  );
  assert.deepEqual(
    sortReviews([OLDER_REVIEW, lowestReview, NEWER_REVIEW], "highest").map(
      (review) => review.rating,
    ),
    [5, 4, 2],
  );
  assert.deepEqual(
    sortReviews([OLDER_REVIEW, lowestReview, NEWER_REVIEW], "lowest").map(
      (review) => review.rating,
    ),
    [2, 4, 5],
  );
});

test("評論日期顯示相對時間", () => {
  const now = Date.parse("2026-08-31T08:00:00.000Z");

  assert.equal(formatRelativeReviewDate("2026-08-31T07:59:30.000Z", now), "剛剛");
  assert.equal(
    formatRelativeReviewDate("2026-08-31T06:00:00.000Z", now),
    "2 小時前",
  );
  assert.equal(
    formatRelativeReviewDate("2026-08-28T08:00:00.000Z", now),
    "3 天前",
  );
});

test("評論通知只呼叫更新開始時已存在的訂閱者", () => {
  let addedListenerCalls = 0;
  let unsubscribeAddedListener: () => void = () => undefined;
  let unsubscribeInitialListener: () => void = () => undefined;

  unsubscribeInitialListener = subscribeToReviews(() => {
    unsubscribeInitialListener();
    unsubscribeAddedListener = subscribeToReviews(() => {
      addedListenerCalls += 1;
    });
  });

  replaceAttractionReviews(ATTRACTION_ID, [OLDER_REVIEW]);

  assert.equal(addedListenerCalls, 0);
  unsubscribeAddedListener();
});

test("評論新增更新會正規化內容並拒絕無效資料", () => {
  assert.deepEqual(
    parseReviewInput({
      attractionId: ATTRACTION_ID,
      rating: 4,
      comment: "  停車方便。  ",
    }),
    { attractionId: ATTRACTION_ID, rating: 4, comment: "停車方便。" },
  );
  assert.equal(
    parseReviewInput({
      attractionId: ATTRACTION_ID,
      rating: 6,
      comment: "無效",
    }),
    null,
  );
  assert.equal(
    parseReviewInput({
      attractionId: ATTRACTION_ID,
      rating: 4,
      comment: "評".repeat(101),
    }),
    null,
  );
  assert.equal(
    parseReviewInput({
      attractionId: ATTRACTION_ID,
      rating: 4,
      comment: "你這個白 痴",
    }),
    null,
  );
});

test("評論會阻擋明確不雅用語及以符號穿插的變形", () => {
  assert.equal(containsInappropriateReviewContent("你這個白癡"), true);
  assert.equal(containsInappropriateReviewContent("你這個白-癡"), true);
  assert.equal(containsInappropriateReviewContent("Ｆ Ｕ Ｃ Ｋ"), true);
  assert.equal(
    containsInappropriateReviewContent("停車場旁的垃圾有點多。"),
    false,
  );
  assert.equal(
    containsInappropriateReviewContent("主要幹道晚上車聲明顯。"),
    false,
  );
});

test("評論刪除只接受已知景點", () => {
  assert.deepEqual(parseReviewDeleteInput({ attractionId: ATTRACTION_ID }), {
    attractionId: ATTRACTION_ID,
  });
  assert.equal(parseReviewDeleteInput({ attractionId: "unknown" }), null);
});

test("評論檢舉會驗證原因、識別碼並正規化補充說明", () => {
  const reviewId = "4a10a3e4-f975-477f-b7a9-831661de9e0f";

  assert.deepEqual(
    parseReviewReportInput({
      reviewId,
      reason: "false_information",
      details: "  地點資訊與實際狀況不同。  ",
    }),
    {
      reviewId,
      reason: "false_information",
      details: "地點資訊與實際狀況不同。",
    },
  );
  assert.equal(
    parseReviewReportInput({ reviewId, reason: "unknown", details: "" }),
    null,
  );
  assert.equal(
    parseReviewReportInput({
      reviewId,
      reason: "other",
      details: "說".repeat(201),
    }),
    null,
  );
  assert.equal(
    parseReviewReportInput({ reviewId: "not-a-uuid", reason: "spam" }),
    null,
  );
});
