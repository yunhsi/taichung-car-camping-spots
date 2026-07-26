import type {
  AttractionReview,
  ReviewDistribution,
  ReviewRating,
  ReviewSummary,
} from "@/features/reviews/types";

export const EMPTY_REVIEW_SUMMARY: ReviewSummary = {
  averageRating: null,
  totalReviews: 0,
};

export function summarizeReviews(
  reviews: readonly AttractionReview[],
): ReviewDistribution {
  const ratingCounts: Record<ReviewRating, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  let ratingTotal = 0;

  reviews.forEach((review) => {
    ratingCounts[review.rating] += 1;
    ratingTotal += review.rating;
  });

  return {
    averageRating:
      reviews.length > 0 ? ratingTotal / reviews.length : null,
    ratingCounts,
    totalReviews: reviews.length,
  };
}
