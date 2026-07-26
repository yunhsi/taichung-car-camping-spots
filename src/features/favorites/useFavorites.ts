"use client";

import { useMemo, useSyncExternalStore } from "react";

import {
  getFavoriteIdsSnapshot,
  getFavoriteStatusSnapshot,
  subscribeToFavorites,
  toggleFavoriteId,
} from "@/features/favorites/favoritesStorage";

interface FavoritesValue {
  favoriteIdSet: ReadonlySet<string>;
  isHydrated: boolean;
}

interface FavoriteValue {
  isFavorite: boolean;
  toggleFavorite: (attractionId: string) => void;
}

const EMPTY_FAVORITE_IDS: readonly string[] = [];

function subscribeToHydration() {
  return () => undefined;
}

export function useFavorites(): FavoritesValue {
  const favoriteIds = useSyncExternalStore(
    subscribeToFavorites,
    getFavoriteIdsSnapshot,
    () => EMPTY_FAVORITE_IDS,
  );
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,   // 瀏覽器執行時
    () => false,  // 伺服器渲染時
  );
  // 轉換後可使用 .has 快速判斷某個景點是否已收藏
  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  return {
    favoriteIdSet,
    isHydrated,
  };
}

export function useFavorite(attractionId: string): FavoriteValue {
  const isFavorite = useSyncExternalStore(
    subscribeToFavorites,
    () => getFavoriteStatusSnapshot(attractionId),
    () => false,
  );

  return { isFavorite, toggleFavorite: toggleFavoriteId };
}
