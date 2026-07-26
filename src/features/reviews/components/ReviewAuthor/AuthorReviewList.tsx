import { Button } from "@/components/ui/Button";
import { RatingStars } from "@/features/reviews/components/RatingStars";
import { ReviewReportProvider } from "@/features/reviews/components/ReviewReport/ReviewReportProvider";
import { ReviewReportButton } from "@/features/reviews/components/ReviewReport/ReviewReportButton";
import { formatRelativeReviewDate } from "@/features/reviews/lib/reviewDate";
import type {
  AuthorReview,
  AuthorReviewsStatus,
} from "@/features/reviews/types";

interface AuthorReviewListProps {
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMoreFailed: boolean;
  name: string;
  onLoadMore: () => void;
  onRetry: () => void;
  reviews: readonly AuthorReview[];
  status: AuthorReviewsStatus;
}

export function AuthorReviewList({
  hasMore,
  isLoadingMore,
  loadMoreFailed,
  name,
  onLoadMore,
  onRetry,
  reviews,
  status,
}: AuthorReviewListProps) {
  if (status === "loading") {
    return (
      <p role="status" className="p-5 text-center text-sm text-muted-foreground">
        正在載入評論…
      </p>
    );
  }

  if (status === "error") {
    return (
      <div role="alert" className="p-5 text-center">
        <p className="text-sm text-muted-foreground">暫時無法取得評論。</p>
        <Button type="button" variant="link" size="sm" onClick={onRetry}>
          重新載入
        </Button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <p className="p-5 text-center text-sm text-muted-foreground">
        {name}目前沒有公開評論。
      </p>
    );
  }

  return (
    <ReviewReportProvider>
      <ol
        aria-label={`${name} 的公開評論列表`}
        className="divide-y divide-border"
      >
        {reviews.map((review) => (
          <li key={review.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-semibold text-foreground">
                {review.attractionName}
              </p>
              <time
                dateTime={review.updatedAt}
                className="shrink-0 text-xs text-muted-foreground"
              >
                {formatRelativeReviewDate(review.updatedAt)}
              </time>
            </div>
            <div className="mt-1">
              <RatingStars
                rating={review.rating}
                label={`評分 ${review.rating} 顆星`}
              />
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
              {review.comment}
            </p>
            <div className="mt-2 flex justify-end">
              <ReviewReportButton review={review} />
            </div>
          </li>
        ))}
      </ol>
      {hasMore ? (
        <div className="border-t border-border p-4 text-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoadingMore}
            onClick={onLoadMore}
          >
            {isLoadingMore ? "載入中…" : "載入更多評論"}
          </Button>
          {loadMoreFailed ? (
            <p role="alert" className="mt-2 text-xs text-destructive">
              載入失敗，請再試一次。
            </p>
          ) : null}
        </div>
      ) : null}
    </ReviewReportProvider>
  );
}
