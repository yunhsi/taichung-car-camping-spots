export interface ReviewAuthor {
  id: string;
  image: string | null;
  name: string | null;
}

export type ReviewRating = 1 | 2 | 3 | 4 | 5;
export type ReviewSort = "latest" | "highest" | "lowest";
export type ReviewReportReason =
  | "spam"
  | "harassment"
  | "inappropriate"
  | "false_information"
  | "other";

export interface AttractionReview {
  author: ReviewAuthor;
  id: string;
  attractionId: string;
  rating: ReviewRating;
  comment: string;
  updatedAt: string;
}

export interface AuthorReview extends AttractionReview {
  attractionName: string;
}

export interface AuthorReviewsPage {
  hasMore: boolean;
  reviews: AuthorReview[];
}

export type AuthorReviewsStatus = "loading" | "loaded" | "error";

export interface ReviewSummary {
  averageRating: number | null;
  totalReviews: number;
}

export interface AttractionReviewSummary extends ReviewSummary {
  attractionId: string;
}

export interface ReviewDistribution extends ReviewSummary {
  ratingCounts: Record<ReviewRating, number>;
}

export interface ReviewInput {
  attractionId: string;
  rating: ReviewRating;
  comment: string;
}

export interface ReviewDeleteInput {
  attractionId: string;
}

export interface ReviewReportInput {
  reviewId: string;
  reason: ReviewReportReason;
  details: string | null;
}

export interface ReviewTarget {
  attractionId: string;
  attractionName: string;
}
