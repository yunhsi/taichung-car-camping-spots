import { type RefObject, useId } from "react";

import { buttonVariants } from "@/components/ui/Button";
import type { AttractionDetail } from "@/features/attractions/types";
import { ReviewSummaryPanel } from "@/features/reviews/components/ReviewSummaryPanel";
import type { ReviewSummary } from "@/features/reviews/types";

interface AttractionDialogContentProps {
  attraction: AttractionDetail | null;
  contentRef: RefObject<HTMLDivElement | null>;
  reviewSummary: ReviewSummary;
  onOpenReviews: (
    attractionId: string,
    attractionName: string,
    trigger: HTMLButtonElement,
  ) => void;
}

export function AttractionDialogContent({
  attraction,
  contentRef,
  reviewSummary,
  onOpenReviews,
}: AttractionDialogContentProps) {
  const linksTitleId = useId();

  return (
    <div
      ref={contentRef}
      className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-6"
    >
      {attraction ? (
        <>
          <DetailSection title="介紹內容" content={attraction.description} />
          <DetailSection
            title="停車資訊"
            content={attraction.parkingInformation}
          />

          <section aria-labelledby={linksTitleId}>
            <h3
              id={linksTitleId}
              className="mb-3 text-lg font-semibold text-foreground"
            >
              相關連結
            </h3>
            <div className="flex flex-wrap gap-3">
              <ExternalLink
                label="官方網站"
                url={attraction.officialWebsiteUrl}
              />
              <ExternalLink label="粉絲專頁" url={attraction.fanPageUrl} />
            </div>
          </section>

          <DetailSection title="旅遊叮嚀" content={attraction.travelTips} />
          <ReviewSummaryPanel
            attractionName={attraction.name}
            summary={reviewSummary}
            onOpenReviews={(trigger) =>
              onOpenReviews(attraction.id, attraction.name, trigger)
            }
          />
        </>
      ) : (
        <p role="status" className="py-10 text-center text-sm text-muted-foreground">
          正在載入景點詳細資訊…
        </p>
      )}
    </div>
  );
}

interface DetailSectionProps {
  title: string;
  content: string;
}

function DetailSection({ title, content }: DetailSectionProps) {
  return (
    <section>
      <h3 className="mb-3 text-lg font-semibold text-foreground">{title}</h3>
      <p className="whitespace-pre-line text-sm leading-7 text-foreground">
        {content || "未提供"}
      </p>
    </section>
  );
}

interface ExternalLinkProps {
  label: string;
  url: string;
}

function ExternalLink({ label, url }: ExternalLinkProps) {
  if (!url) {
    return (
      <p className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-muted-foreground">
        {label}：未提供
      </p>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={buttonVariants({ variant: "outline" })}
    >
      {label}
      <span aria-hidden="true" data-icon="inline-end">↗</span>
    </a>
  );
}
