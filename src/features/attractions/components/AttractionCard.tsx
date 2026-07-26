"use client";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import type { AttractionListItem } from "@/features/attractions/types";
import { FavoriteButton } from "@/features/favorites/components/FavoriteButton";

interface AttractionCardProps extends AttractionListItem {
  onOpenDetails: (
    attractionId: string,
    trigger: HTMLButtonElement,
  ) => void;
}

export function AttractionCard(attraction: AttractionCardProps) {
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
  } = attraction;

  return (
    <Card className="group relative h-full border-t-4 border-t-primary transition-all duration-300 hover:-translate-y-1 hover:border-t-accent hover:shadow-lg">
      <button
        type="button"
        aria-label={`查看「${name}」詳細資訊`}
        className="absolute inset-0 z-10 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50 focus-visible:ring-inset"
        onClick={(event) => onOpenDetails(id, event.currentTarget)}
      />

      <CardHeader className="pointer-events-none relative z-20">
        <CardTitle className="flex items-start gap-3 pr-12">
          <span
            aria-hidden="true"
            className="mt-2 size-2.5 shrink-0 rounded-full bg-accent shadow-[0_0_0_4px_var(--accent-soft)]"
          />
          {name}
        </CardTitle>
        <div className="pointer-events-auto">
          <FavoriteButton
            attractionId={id}
            attractionName={name}
          />
        </div>
      </CardHeader>

      <CardContent className="pointer-events-none relative z-20 [&_a]:pointer-events-auto">
        <dl className="space-y-3">
          <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3">
            <dt className="text-sm font-semibold text-primary">開放時間</dt>
            <dd className="min-w-0 text-sm leading-6 text-foreground">
              {openingHours || "未提供"}
            </dd>
          </div>
          <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3">
            <dt className="text-sm font-semibold text-primary">地址</dt>
            <dd className="min-w-0 text-sm leading-6 text-foreground">
              {address || "未提供"}
            </dd>
          </div>
          <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3">
            <dt className="text-sm font-semibold text-primary">電話</dt>
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
            <dt className="text-sm font-semibold text-primary">停留時間</dt>
            <dd className="min-w-0 text-sm leading-6 text-foreground">
              {stayDuration || "未提供"}
            </dd>
          </div>
        </dl>

        <div className="mt-5">
          <p className="text-sm font-semibold text-primary">主題分類</p>
          {categories.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2" aria-label="主題分類">
              {categories.map((category) => (
                <li
                  key={category}
                  className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong"
                >
                  {category}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-foreground">未提供</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="pointer-events-none relative z-20 [&_a]:pointer-events-auto">
        {googleMapsUrl ? (
          <Button asChild className="w-full">
            <a href={googleMapsUrl} target="_blank" rel="noreferrer">
              在 Google 地圖查看
              <span aria-hidden="true">↗</span>
            </a>
          </Button>
        ) : (
          <p className="text-center text-sm text-muted">
            Google 網址未提供
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
