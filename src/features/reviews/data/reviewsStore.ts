import { EMPTY_REVIEW_SUMMARY, summarizeReviews } from "@/features/reviews/lib/reviewSummary";
import type {
  AttractionReview,
  AttractionReviewSummary,
  ReviewSummary,
} from "@/features/reviews/types";

export type ReviewsLoadStatus = "error" | "idle" | "loaded" | "loading";
export type OwnReviewsLoadStatus = "error" | "idle" | "loaded" | "loading";

const LISTENERS = new Set<() => void>();
const EMPTY_REVIEWS: readonly AttractionReview[] = [];

let reviewSummariesByAttractionId = new Map<string, ReviewSummary>();
let publicReviewsByAttractionId = new Map<
  string,
  readonly AttractionReview[]
>();
let publicReviewStatuses = new Map<string, ReviewsLoadStatus>();
let ownReviewsByAttractionId = new Map<string, AttractionReview>();
let ownReviewsStatus: OwnReviewsLoadStatus = "idle";

export function getAttractionReviewSummarySnapshot(
  attractionId: string,
): ReviewSummary {
  return reviewSummariesByAttractionId.get(attractionId) ?? EMPTY_REVIEW_SUMMARY;
}

export function getAttractionReviewsSnapshot(
  attractionId: string,
): readonly AttractionReview[] {
  return publicReviewsByAttractionId.get(attractionId) ?? EMPTY_REVIEWS;
}

export function getAttractionReviewsStatusSnapshot(
  attractionId: string,
): ReviewsLoadStatus {
  return publicReviewStatuses.get(attractionId) ?? "idle";
}

export function getOwnAttractionReviewSnapshot(
  attractionId: string,
): AttractionReview | undefined {
  return ownReviewsByAttractionId.get(attractionId);
}

export function getOwnReviewsStatusSnapshot(): OwnReviewsLoadStatus {
  return ownReviewsStatus;
}

export function subscribeToReviews(listener: () => void): () => void {
  LISTENERS.add(listener);

  return () => LISTENERS.delete(listener);
}

export function replaceReviewSummaries(
  summaries: readonly AttractionReviewSummary[],
): void {
  reviewSummariesByAttractionId = new Map(
    summaries.map((summary) => [
      summary.attractionId,
      {
        averageRating: summary.averageRating,
        totalReviews: summary.totalReviews,
      },
    ]),
  );
  emitChange();
}

export function setAttractionReviewsStatus(
  attractionId: string,
  status: ReviewsLoadStatus,
): void {
  if (getAttractionReviewsStatusSnapshot(attractionId) === status) {
    return;
  }

  publicReviewStatuses = new Map(publicReviewStatuses).set(attractionId, status);
  emitChange();
}

export function replaceAttractionReviews(
  attractionId: string,
  reviews: readonly AttractionReview[],
): void {
  const sortedReviews = [...reviews].sort(compareReviewsByUpdatedAt);

  publicReviewsByAttractionId = new Map(publicReviewsByAttractionId).set(
    attractionId,
    sortedReviews,
  );
  publicReviewStatuses = new Map(publicReviewStatuses).set(attractionId, "loaded");
  setSummaryFromReviews(attractionId, sortedReviews);
  emitChange();
}

export function clearAttractionReviews(attractionId: string): void {
  publicReviewsByAttractionId = new Map(publicReviewsByAttractionId);
  publicReviewsByAttractionId.delete(attractionId);
  publicReviewStatuses = new Map(publicReviewStatuses);
  publicReviewStatuses.delete(attractionId);
  emitChange();
}

export function replaceOwnReviews(reviews: readonly AttractionReview[]): void {
  ownReviewsByAttractionId = createLatestReviewMap(reviews);
  emitChange();
}

export function setOwnReviewsStatus(status: OwnReviewsLoadStatus): void {
  if (ownReviewsStatus === status) {
    return;
  }

  ownReviewsStatus = status;
  emitChange();
}

export function setOwnReview(review: AttractionReview): void {
  ownReviewsByAttractionId = new Map(ownReviewsByAttractionId).set(
    review.attractionId,
    review,
  );
  emitChange();
}

export function setPublicReview(
  review: AttractionReview,
  previousReview?: AttractionReview,
): void {
  const currentReviews = publicReviewsByAttractionId.get(review.attractionId);

  if (currentReviews) {
    const nextReviews = currentReviews
      .filter((currentReview) => currentReview.id !== review.id)
      .concat(review)
      .sort(compareReviewsByUpdatedAt);

    publicReviewsByAttractionId = new Map(publicReviewsByAttractionId).set(
      review.attractionId,
      nextReviews,
    );
    setSummaryFromReviews(review.attractionId, nextReviews);
  } else {
    updateSummaryForSavedReview(review, previousReview);
  }

  emitChange();
}

export function deleteOwnReview(attractionId: string): void {
  if (!ownReviewsByAttractionId.has(attractionId)) {
    return;
  }

  ownReviewsByAttractionId = new Map(ownReviewsByAttractionId);
  ownReviewsByAttractionId.delete(attractionId);
  emitChange();
}

export function deletePublicReview(
  attractionId: string,
  reviewId: string,
  deletedReview?: AttractionReview,
): void {
  const currentReviews = publicReviewsByAttractionId.get(attractionId);

  if (currentReviews) {
    const nextReviews = currentReviews.filter((review) => review.id !== reviewId);
    publicReviewsByAttractionId = new Map(publicReviewsByAttractionId);

    if (nextReviews.length > 0) {
      publicReviewsByAttractionId.set(attractionId, nextReviews);
    } else {
      publicReviewsByAttractionId.delete(attractionId);
    }

    setSummaryFromReviews(attractionId, nextReviews);
  } else if (deletedReview) {
    updateSummaryForDeletedReview(deletedReview);
  } else {
    return;
  }

  emitChange();
}

function setSummaryFromReviews(
  attractionId: string,
  reviews: readonly AttractionReview[],
): void {
  const summary = summarizeReviews(reviews);

  reviewSummariesByAttractionId = new Map(reviewSummariesByAttractionId).set(
    attractionId,
    {
      averageRating: summary.averageRating,
      totalReviews: summary.totalReviews,
    },
  );
}

function updateSummaryForSavedReview(
  review: AttractionReview,
  previousReview?: AttractionReview,
): void {
  const current = getAttractionReviewSummarySnapshot(review.attractionId);
  const totalReviews = previousReview
    ? current.totalReviews
    : current.totalReviews + 1;
  const currentRatingTotal = (current.averageRating ?? 0) * current.totalReviews;
  const nextRatingTotal =
    currentRatingTotal - (previousReview?.rating ?? 0) + review.rating;

  reviewSummariesByAttractionId = new Map(reviewSummariesByAttractionId).set(
    review.attractionId,
    {
      averageRating: totalReviews > 0 ? nextRatingTotal / totalReviews : null,
      totalReviews,
    },
  );
}

function updateSummaryForDeletedReview(review: AttractionReview): void {
  const current = getAttractionReviewSummarySnapshot(review.attractionId);
  const totalReviews = Math.max(0, current.totalReviews - 1);
  const nextRatingTotal =
    (current.averageRating ?? 0) * current.totalReviews - review.rating;

  reviewSummariesByAttractionId = new Map(reviewSummariesByAttractionId).set(
    review.attractionId,
    {
      averageRating: totalReviews > 0 ? nextRatingTotal / totalReviews : null,
      totalReviews,
    },
  );
}

function createLatestReviewMap(
  reviews: readonly AttractionReview[],
): Map<string, AttractionReview> {
  const reviewsByAttractionId = new Map<string, AttractionReview>();

  reviews.forEach((review) => {
    const currentReview = reviewsByAttractionId.get(review.attractionId);

    if (!currentReview || review.updatedAt > currentReview.updatedAt) {
      reviewsByAttractionId.set(review.attractionId, review);
    }
  });

  return reviewsByAttractionId;
}

function compareReviewsByUpdatedAt(
  firstReview: AttractionReview,
  secondReview: AttractionReview,
): number {
  return secondReview.updatedAt.localeCompare(firstReview.updatedAt);
}

function emitChange(): void {
  [...LISTENERS].forEach((listener) => listener());
}
