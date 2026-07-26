import "server-only";

import { eq } from "drizzle-orm";

import type { ReviewReportInput } from "@/features/reviews/types";
import { getDatabase } from "@/lib/db";
import { reviewReports, reviews } from "@/lib/db/schema";

export async function createReviewReport(
  reporterUserId: string,
  input: ReviewReportInput,
): Promise<void> {
  const database = getDatabase();
  const [review] = await database
    .select({ authorUserId: reviews.userId })
    .from(reviews)
    .where(eq(reviews.id, input.reviewId))
    .limit(1);

  if (!review) {
    throw new ReportedReviewNotFoundError();
  }

  if (review.authorUserId === reporterUserId) {
    throw new OwnReviewReportError();
  }

  const [createdReport] = await database
    .insert(reviewReports)
    .values({ reporterUserId, ...input })
    .onConflictDoNothing()
    .returning({ reviewId: reviewReports.reviewId });

  if (!createdReport) {
    throw new DuplicateReviewReportError();
  }
}

export class DuplicateReviewReportError extends Error {}
export class OwnReviewReportError extends Error {}
export class ReportedReviewNotFoundError extends Error {}
