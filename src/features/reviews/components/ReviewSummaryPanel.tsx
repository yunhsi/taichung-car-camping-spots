import { ChevronRight, MessageSquareText } from "lucide-react";

import { RatingStars } from "@/features/reviews/components/RatingStars";
import type { ReviewSummary } from "@/features/reviews/types";

interface ReviewSummaryPanelProps {
  attractionName: string;
  onOpenReviews: (trigger: HTMLButtonElement) => void;
  summary: ReviewSummary;
}

export function ReviewSummaryPanel({
  attractionName,
  onOpenReviews,
  summary,
}: ReviewSummaryPanelProps) {
  const averageLabel = summary.averageRating?.toFixed(1) ?? "—";

  return (
    <section className="group/review pointer-events-auto relative overflow-hidden rounded-xl border border-border bg-muted px-4 py-3 text-left shadow-sm transition-[background-color,border-color,box-shadow] duration-200 hover:border-primary/60 hover:bg-secondary/50 hover:shadow-md">
      <button
        type="button"
        aria-label={`查看「${attractionName}」的評分與評論`}
        className="absolute inset-0 z-10 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
        onClick={(event) => onOpenReviews(event.currentTarget)}
      />

      <div className="pointer-events-none relative z-20 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-highlight-soft text-highlight transition-transform duration-200 group-hover/review:scale-105"
        >
          <MessageSquareText className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">旅人評分</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <strong className="text-xl leading-none text-foreground">
              {averageLabel}
            </strong>
            <RatingStars
              rating={summary.averageRating ?? 0}
              size="sm"
              label={
                summary.averageRating === null
                  ? "尚無評分"
                  : `平均評分 ${averageLabel} 顆星`
              }
            />
            <span className="text-xs text-muted-foreground">
              {summary.totalReviews} 則評論
            </span>
          </div>
        </div>

        <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-primary">
          查看
          <ChevronRight
            aria-hidden="true"
            className="size-3.5 transition-transform duration-200 group-hover/review:translate-x-0.5"
          />
        </span>
      </div>
    </section>
  );
}
