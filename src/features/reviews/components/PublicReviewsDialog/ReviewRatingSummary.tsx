import { Star } from "lucide-react";

import { RatingStars } from "@/features/reviews/components/RatingStars";
import { summarizeReviews } from "@/features/reviews/lib/reviewSummary";
import { REVIEW_RATING_VALUES } from "@/features/reviews/lib/reviewValidation";
import type { AttractionReview } from "@/features/reviews/types";

interface ReviewRatingSummaryProps {
  reviews: readonly AttractionReview[];
}

export function ReviewRatingSummary({
  reviews,
}: ReviewRatingSummaryProps) {
  const summary = summarizeReviews(reviews);
  const averageLabel = summary.averageRating?.toFixed(1) ?? "—";
  const descendingRatingValues = [...REVIEW_RATING_VALUES].reverse();

  return (
    <div className="mt-4 grid gap-5 rounded-2xl border border-border bg-muted p-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center">
      <div className="text-center sm:border-r sm:border-border sm:pr-5">
        <p className="text-4xl font-bold tracking-tight text-foreground">
          {averageLabel}
        </p>
        <div className="mt-2 flex justify-center">
          <RatingStars
            rating={summary.averageRating ?? 0}
            label={
              summary.averageRating === null
                ? "尚無評分"
                : `平均評分 ${averageLabel} 顆星`
            }
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          共 {summary.totalReviews} 則公開評論
        </p>
      </div>

      <div className="space-y-2" aria-label="評分分布">
        {descendingRatingValues.map((rating) => (
          <div
            key={rating}
            className="grid grid-cols-[2.5rem_minmax(0,1fr)_2rem] items-center gap-2 text-xs"
          >
            <span className="flex items-center gap-1 font-medium text-foreground">
              {rating}
              <Star
                aria-hidden="true"
                className="size-3 fill-current text-highlight"
              />
            </span>
            <progress
              aria-label={`${rating} 顆星 ${summary.ratingCounts[rating]} 則`}
              className="h-2 w-full overflow-hidden rounded-full bg-border [appearance:none] [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-highlight [&::-webkit-progress-bar]:bg-border [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-highlight"
              max={Math.max(summary.totalReviews, 1)}
              value={summary.ratingCounts[rating]}
            />
            <span className="text-right text-muted-foreground">
              {summary.ratingCounts[rating]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
