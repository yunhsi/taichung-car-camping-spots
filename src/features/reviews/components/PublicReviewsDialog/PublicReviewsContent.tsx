import { useId } from "react";

import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { AttractionReview } from "@/features/reviews/types";

import { PublicReviewList } from "./PublicReviewList";
import { ReviewRatingSummary } from "./ReviewRatingSummary";

interface PublicReviewsContentProps {
  attractionName: string;
  canReview: boolean;
  hasOwnReview: boolean;
  isOwnReviewLoaded: boolean;
  onOpenReview: (trigger: HTMLButtonElement) => void;
  reviews: readonly AttractionReview[];
}

export function PublicReviewsContent({
  attractionName,
  canReview,
  hasOwnReview,
  isOwnReviewLoaded,
  onOpenReview,
  reviews,
}: PublicReviewsContentProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id={titleId} className="text-lg font-semibold text-foreground">
            旅人評分與評論
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            看看其他旅人的實際體驗
          </p>
        </div>

        {canReview ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-busy={!isOwnReviewLoaded}
            aria-label={
              !isOwnReviewLoaded
                ? `正在載入「${attractionName}」的評論狀態`
                : hasOwnReview
                ? `修改「${attractionName}」的評分與評論`
                : `為「${attractionName}」評分`
            }
            disabled={!isOwnReviewLoaded}
            onClick={(event) => onOpenReview(event.currentTarget)}
          >
            <Pencil aria-hidden="true" />
            {!isOwnReviewLoaded
              ? "載入我的評論…"
              : hasOwnReview
                ? "編輯我的評論"
                : "留下評論"}
          </Button>
        ) : null}
      </div>

      <ReviewRatingSummary reviews={reviews} />
      <PublicReviewList canReview={canReview} reviews={reviews} />
    </section>
  );
}
