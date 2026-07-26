"use client";

import { memo } from "react";

import { buttonVariants } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { preloadAttraction } from "@/features/attractions/data/attractionApi";
import type { AttractionListItem } from "@/features/attractions/types";
import { FavoriteToggleButton } from "@/features/favorites/components/FavoriteToggleButton";
import { ReviewSummaryPanel } from "@/features/reviews/components/ReviewSummaryPanel";
import { useAttractionReviewSummary } from "@/features/reviews/useAttractionReviews";

interface AttractionCardProps extends AttractionListItem {
  onOpenDetails: (
    attractionId: string,
    trigger: HTMLButtonElement,
  ) => void;
  onOpenReviews: (
    attractionId: string,
    attractionName: string,
    trigger: HTMLButtonElement,
  ) => void;
}

export const AttractionCard = memo(function AttractionCard(
  attraction: AttractionCardProps,
) {
  const {
    id,
    name,
    openingHours,
    address,
    phone,
    stayDuration,
    categories,
    googleMapsUrl,
    onOpenDetails,
    onOpenReviews,
  } = attraction;
  const { summary } = useAttractionReviewSummary(id);

  return (
    <Card className="group relative h-full border-t-4 border-t-primary transition-all duration-300 hover:-translate-y-1 hover:border-t-highlight hover:shadow-lg">
      <button
        type="button"
        aria-label={`查看「${name}」詳細資訊`}
        className="absolute inset-0 z-10 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
        onFocus={() => preloadAttraction(id)}
        onPointerEnter={() => preloadAttraction(id)}
        onClick={(event) => onOpenDetails(id, event.currentTarget)}
      />

      <CardHeader className="pointer-events-none relative z-20">
        <CardTitle className="flex items-start gap-3 pr-24">
          <span
            aria-hidden="true"
            className="mt-2 size-2.5 shrink-0 rounded-full bg-highlight shadow-[0_0_0_4px_var(--highlight-soft)]"
          />
          {name}
        </CardTitle>
        <div className="pointer-events-auto absolute top-3 right-4 flex gap-2">
          <FavoriteToggleButton
            attractionId={id}
            attractionName={name}
            className="static"
          />
        </div>
      </CardHeader>

      <CardContent className="pointer-events-none relative z-20 [&_a]:pointer-events-auto">
        <dl className="space-y-3">
          <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3">
            <dt className="text-sm font-semibold text-foreground">開放時間</dt>
            <dd className="min-w-0 text-sm leading-6 text-foreground">
              {openingHours || "未提供"}
            </dd>
          </div>
          <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3">
            <dt className="text-sm font-semibold text-foreground">地址</dt>
            <dd className="min-w-0 text-sm leading-6 text-foreground">
              {address || "未提供"}
            </dd>
          </div>
          <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3">
            <dt className="text-sm font-semibold text-foreground">電話</dt>
            <dd className="min-w-0 text-sm leading-6">
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="text-primary underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-primary-hover hover:decoration-primary-hover"
                >
                  {phone}
                </a>
              ) : (
                <span className="text-foreground">未提供</span>
              )}
            </dd>
          </div>
          <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3">
            <dt className="text-sm font-semibold text-foreground">停留時間</dt>
            <dd className="min-w-0 text-sm leading-6 text-foreground">
              {stayDuration || "未提供"}
            </dd>
          </div>
        </dl>

        <div className="mt-5">
          <p className="text-sm font-semibold text-foreground">主題分類</p>
          {categories.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2" aria-label="主題分類">
              {categories.map((category) => (
                <li
                  key={category}
                  className="rounded-full bg-highlight-soft px-3 py-1 text-xs font-semibold text-highlight-strong"
                >
                  {category}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-foreground">未提供</p>
          )}
        </div>

        <div className="mt-5">
          <ReviewSummaryPanel
            attractionName={name}
            summary={summary}
            onOpenReviews={(trigger) => onOpenReviews(id, name, trigger)}
          />
        </div>
      </CardContent>

      <CardFooter className="pointer-events-none relative z-20 [&_a]:pointer-events-auto">
        {googleMapsUrl ? (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ className: "w-full" })}
          >
            在 Google 地圖查看
            <span aria-hidden="true" data-icon="inline-end">↗</span>
          </a>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Google 網址未提供
          </p>
        )}
      </CardFooter>
    </Card>
  );
});
