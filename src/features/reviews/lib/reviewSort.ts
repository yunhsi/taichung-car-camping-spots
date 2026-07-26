import type {
  AttractionReview,
  ReviewSort,
} from "@/features/reviews/types";

export function sortReviews(
  reviews: readonly AttractionReview[],
  sort: ReviewSort,
): AttractionReview[] {
  return [...reviews].sort((firstReview, secondReview) => {
    const ratingDifference = secondReview.rating - firstReview.rating;

    if (sort === "highest" && ratingDifference !== 0) {
      return ratingDifference;
    }

    if (sort === "lowest" && ratingDifference !== 0) {
      return -ratingDifference;
    }

    const dateDifference = secondReview.updatedAt.localeCompare(
      firstReview.updatedAt,
    );

    return dateDifference || secondReview.id.localeCompare(firstReview.id);
  });
}
