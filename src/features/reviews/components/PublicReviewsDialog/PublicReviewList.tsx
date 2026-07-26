"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { MessageSquareText } from "lucide-react";

import { RatingStars } from "@/features/reviews/components/RatingStars";
import { ReviewSortControls } from "@/features/reviews/components/PublicReviewsDialog/ReviewSortControls";
import { AuthorReviewsDialog } from "@/features/reviews/components/ReviewAuthor/AuthorReviewsDialog";
import { ReviewAuthorAvatar } from "@/features/reviews/components/ReviewAuthor/ReviewAuthorAvatar";
import { ReviewReportButton } from "@/features/reviews/components/ReviewReport/ReviewReportButton";
import { ReviewReportProvider } from "@/features/reviews/components/ReviewReport/ReviewReportProvider";
import { formatRelativeReviewDate } from "@/features/reviews/lib/reviewDate";
import { sortReviews } from "@/features/reviews/lib/reviewSort";
import type {
  AttractionReview,
  ReviewAuthor,
  ReviewSort,
} from "@/features/reviews/types";

interface PublicReviewListProps {
  canReview: boolean;
  reviews: readonly AttractionReview[];
}

export function PublicReviewList({
  canReview,
  reviews,
}: PublicReviewListProps) {
  const [isAuthorDialogOpen, setIsAuthorDialogOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<ReviewAuthor | null>(
    null,
  );
  const [sort, setSort] = useState<ReviewSort>("latest");
  const sortedReviews = useMemo(
    () => sortReviews(reviews, sort),
    [reviews, sort],
  );
  const authorDialogTriggerRef = useRef<HTMLButtonElement | null>(null);
  const getAuthorDialogTrigger = useCallback(
    () => authorDialogTriggerRef.current,
    [],
  );

  if (reviews.length === 0) {
    return (
      <div className="mt-5 rounded-xl border border-dashed border-border bg-card px-5 py-8 text-center">
        <MessageSquareText
          aria-hidden="true"
          className="mx-auto size-8 text-muted-foreground"
        />
        <p className="mt-3 font-medium text-foreground">
          目前尚無公開評論
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {canReview
            ? "成為第一位分享體驗的旅人。"
            : "登入後即可留下評論。"}
        </p>
      </div>
    );
  }

  return (
    <ReviewReportProvider>
      <div className="mt-5">
        <ReviewSortControls sort={sort} onSortChange={setSort} />
      </div>
      <ol className="mt-5 space-y-3" aria-label="公開評論列表">
        {sortedReviews.map((review) => (
          <li
            key={review.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <ReviewAuthorAvatar
                  image={review.author.image}
                  name={review.author.name ?? "匿名旅人"}
                  onOpen={(trigger) => {
                    setSelectedAuthor(review.author);
                    authorDialogTriggerRef.current = trigger;
                    setIsAuthorDialogOpen(true);
                  }}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {review.author.name ?? "匿名旅人"}
                  </p>
                  <div className="mt-1">
                    <RatingStars
                      rating={review.rating}
                      label={`評分 ${review.rating} 顆星`}
                    />
                  </div>
                </div>
              </div>
              <time
                dateTime={review.updatedAt}
                className="shrink-0 text-xs text-muted-foreground"
              >
                {formatRelativeReviewDate(review.updatedAt)}
              </time>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
              {review.comment}
            </p>
            <div className="mt-2 flex justify-end">
              <ReviewReportButton review={review} />
            </div>
          </li>
        ))}
      </ol>
      <AuthorReviewsDialog
        author={selectedAuthor}
        getTrigger={getAuthorDialogTrigger}
        isOpen={isAuthorDialogOpen}
        onOpenChange={setIsAuthorDialogOpen}
      />
    </ReviewReportProvider>
  );
}
