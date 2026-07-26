"use client";

import type { ReactNode } from "react";

import { AttractionList } from "@/features/attractions/components/AttractionList/AttractionList";
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
  const { favoriteIdSet, isLoaded } = useFavorites();
  const favoriteAttractions = attractions.filter((attraction) =>
    favoriteIdSet.has(attraction.id),
  );

  if (!isLoaded) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground shadow-sm"
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
