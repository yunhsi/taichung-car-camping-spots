import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

import { loadEnvConfig } from "@next/env";
import { eq, inArray } from "drizzle-orm";

import { readAttractions } from "@/features/attractions/data/attractions";

loadEnvConfig(process.cwd());

const ATTRACTION_IDS = readAttractions()
  .slice(0, 2)
  .map((attraction) => attraction.id);

if (ATTRACTION_IDS.length < 2) {
  throw new Error("資料庫整合測試需要至少兩個景點。");
}

const [ATTRACTION_ID, OTHER_ATTRACTION_ID] = ATTRACTION_IDS;
const USER_IDS = [randomUUID(), randomUUID(), randomUUID()];
const RATE_LIMIT_KEY = `integration-test:${randomUUID()}`;

test("PostgreSQL 完整保存收藏、評論、摘要、所有權與 rate limit", async (t) => {
  const [
    { getDatabase },
    schema,
    favoriteRepository,
    reviewRepository,
    reviewReportRepository,
    rateLimit,
  ] =
    await Promise.all([
      import("@/lib/db"),
      import("@/lib/db/schema"),
      import("@/features/favorites/data/favoritesRepository"),
      import("@/features/reviews/data/reviewsRepository"),
      import("@/features/reviews/data/reviewReportsRepository"),
      import("@/features/security/data/rateLimitRepository"),
    ]);
  const database = getDatabase();
  const [firstUserId, secondUserId, unrelatedUserId] = USER_IDS;

  t.after(async () => {
    await database
      .delete(schema.apiRateLimits)
      .where(eq(schema.apiRateLimits.key, RATE_LIMIT_KEY));
    await database
      .delete(schema.users)
      .where(inArray(schema.users.id, USER_IDS));
    await database.$client.end();
  });

  await database.insert(schema.users).values([
    { id: firstUserId, name: "整合測試旅人甲" },
    { id: secondUserId, name: "整合測試旅人乙" },
    { id: unrelatedUserId, name: "整合測試旅人丙" },
  ]);

  const baselineSummary = (await reviewRepository.readReviewSummaries()).find(
    (summary) => summary.attractionId === ATTRACTION_ID,
  ) ?? { averageRating: null, totalReviews: 0 };
  const baselineRatingTotal =
    (baselineSummary.averageRating ?? 0) * baselineSummary.totalReviews;

  await favoriteRepository.updateFavorite(firstUserId, ATTRACTION_ID, true);
  await favoriteRepository.updateFavorite(firstUserId, ATTRACTION_ID, true);
  await favoriteRepository.updateFavorite(
    secondUserId,
    OTHER_ATTRACTION_ID,
    true,
  );

  assert.deepEqual(await favoriteRepository.readFavorites(firstUserId), [
    ATTRACTION_ID,
  ]);
  assert.deepEqual(await favoriteRepository.readFavorites(secondUserId), [
    OTHER_ATTRACTION_ID,
  ]);

  const firstReview = await reviewRepository.createAttractionReview(
    firstUserId,
    ATTRACTION_ID,
    5,
    "整合測試評論甲",
    { id: firstUserId, image: null, name: "整合測試旅人甲" },
  );
  const secondReview = await reviewRepository.createAttractionReview(
    secondUserId,
    ATTRACTION_ID,
    3,
    "整合測試評論乙",
    { id: secondUserId, image: null, name: "整合測試旅人乙" },
  );
  const otherAttractionReview = await reviewRepository.createAttractionReview(
    firstUserId,
    OTHER_ATTRACTION_ID,
    4,
    "整合測試評論甲的另一個景點",
    { id: firstUserId, image: null, name: "整合測試旅人甲" },
  );

  const firstUserReviewPages = await Promise.all([
    reviewRepository.readReviews({ userId: firstUserId, limit: 1 }),
    reviewRepository.readReviews({ userId: firstUserId, limit: 1, offset: 1 }),
  ]);
  assert.deepEqual(
    new Set(firstUserReviewPages.flat().map((review) => review.id)),
    new Set([firstReview.id, otherAttractionReview.id]),
  );

  await assert.rejects(
    () =>
      reviewRepository.createAttractionReview(
        firstUserId,
        ATTRACTION_ID,
        4,
        "不應重複新增",
        { id: firstUserId, image: null, name: "整合測試旅人甲" },
      ),
    reviewRepository.ReviewAlreadyExistsError,
  );
  await assert.rejects(
    () =>
      reviewRepository.updateAttractionReview(
        unrelatedUserId,
        ATTRACTION_ID,
        1,
        "不能修改他人評論",
        { id: unrelatedUserId, image: null, name: "整合測試旅人丙" },
      ),
    reviewRepository.ReviewNotFoundError,
  );

  const publicReviews = await reviewRepository.readReviews({
    attractionId: ATTRACTION_ID,
  });
  const integrationReviews = publicReviews.filter((review) =>
    [firstReview.id, secondReview.id].includes(review.id),
  );
  assert.equal(integrationReviews.length, 2);
  assert.deepEqual(
    new Set(integrationReviews.map((review) => review.author.name)),
    new Set(["整合測試旅人甲", "整合測試旅人乙"]),
  );

  await reviewReportRepository.createReviewReport(unrelatedUserId, {
    reviewId: firstReview.id,
    reason: "false_information",
    details: "整合測試檢舉",
  });
  await assert.rejects(
    () =>
      reviewReportRepository.createReviewReport(unrelatedUserId, {
        reviewId: firstReview.id,
        reason: "spam",
        details: null,
      }),
    reviewReportRepository.DuplicateReviewReportError,
  );
  await assert.rejects(
    () =>
      reviewReportRepository.createReviewReport(firstUserId, {
        reviewId: firstReview.id,
        reason: "other",
        details: null,
      }),
    reviewReportRepository.OwnReviewReportError,
  );

  const reportsBeforeReviewDelete = await database
    .select()
    .from(schema.reviewReports)
    .where(eq(schema.reviewReports.reviewId, firstReview.id));
  assert.equal(reportsBeforeReviewDelete.length, 1);

  const initialSummary = (await reviewRepository.readReviewSummaries()).find(
    (summary) => summary.attractionId === ATTRACTION_ID,
  );
  assert.deepEqual(initialSummary, {
    attractionId: ATTRACTION_ID,
    averageRating:
      (baselineRatingTotal + 8) / (baselineSummary.totalReviews + 2),
    totalReviews: baselineSummary.totalReviews + 2,
  });

  await reviewRepository.updateAttractionReview(
    firstUserId,
    ATTRACTION_ID,
    1,
    "更新後的整合測試評論",
    { id: firstUserId, image: null, name: "整合測試旅人甲" },
  );
  const updatedSummary = (await reviewRepository.readReviewSummaries()).find(
    (summary) => summary.attractionId === ATTRACTION_ID,
  );
  assert.equal(
    updatedSummary?.averageRating,
    (baselineRatingTotal + 4) / (baselineSummary.totalReviews + 2),
  );

  await reviewRepository.deleteAttractionReview(firstUserId, ATTRACTION_ID);
  const reviewsAfterDelete = await reviewRepository.readReviews({
    attractionId: ATTRACTION_ID,
  });
  assert.equal(
    reviewsAfterDelete.some((review) => review.id === firstReview.id),
    false,
  );
  const reportsAfterReviewDelete = await database
    .select()
    .from(schema.reviewReports)
    .where(eq(schema.reviewReports.reviewId, firstReview.id));
  assert.equal(reportsAfterReviewDelete.length, 0);

  const firstRateLimit = await rateLimit.consumeRateLimit({
    key: RATE_LIMIT_KEY,
    limit: 2,
    windowMs: 60_000,
  });
  const secondRateLimit = await rateLimit.consumeRateLimit({
    key: RATE_LIMIT_KEY,
    limit: 2,
    windowMs: 60_000,
  });
  const blockedRateLimit = await rateLimit.consumeRateLimit({
    key: RATE_LIMIT_KEY,
    limit: 2,
    windowMs: 60_000,
  });

  assert.equal(firstRateLimit.isAllowed, true);
  assert.equal(secondRateLimit.isAllowed, true);
  assert.equal(blockedRateLimit.isAllowed, false);
  assert.ok(blockedRateLimit.retryAfterSeconds > 0);

  await favoriteRepository.updateFavorite(firstUserId, ATTRACTION_ID, false);
  assert.deepEqual(await favoriteRepository.readFavorites(firstUserId), []);
});
