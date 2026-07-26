"use client";

import type { ReactNode } from "react";

import { AttractionList } from "@/features/attractions/components/AttractionList";
import type { AttractionListItem } from "@/features/attractions/types";
import { useFavorites } from "@/features/favorites/useFavorites";

interface FavoriteAttractionListProps {
  attractions: AttractionListItem[];
  emptyState: ReactNode;
}

export function FavoriteAttractionList({
  attractions,
  emptyState,
}: FavoriteAttractionListProps) {
  const { favoriteIdSet, isHydrated } = useFavorites();
  const favoriteAttractions = attractions.filter((attraction) =>
    favoriteIdSet.has(attraction.id),
  );

  if (!isHydrated) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-border bg-surface px-6 py-16 text-center text-sm text-muted shadow-sm"
      >
        正在載入收藏景點…
      </div>
    );
  }

  if (favoriteAttractions.length === 0) {
    return emptyState;
  }

  return <AttractionList attractions={favoriteAttractions} />;
}
