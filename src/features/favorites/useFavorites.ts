"use client";

import { useMemo, useSyncExternalStore } from "react";

import {
  getFavoriteIdsSnapshot,
  getFavoritesLoadedSnapshot,
  getFavoriteStatusSnapshot,
  subscribeToFavorites,
} from "@/features/favorites/data/favoritesStore";
import { useUserData } from "@/features/user/components/UserDataProvider";

interface FavoritesValue {
  favoriteIdSet: ReadonlySet<string>;
  isLoaded: boolean;
}

interface FavoriteValue {
  isFavorite: boolean;
  isLoaded: boolean;
  toggleFavorite: () => Promise<void>;
}

const EMPTY_FAVORITE_IDS: readonly string[] = [];

export function useFavorites(): FavoritesValue {
  const favoriteIds = useSyncExternalStore(
    subscribeToFavorites,
    getFavoriteIdsSnapshot,
    () => EMPTY_FAVORITE_IDS,
  );
  const isLoaded = useSyncExternalStore(
    subscribeToFavorites,
    getFavoritesLoadedSnapshot,
    () => false,
  );
  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  return {
    favoriteIdSet,
    isLoaded,
  };
}

export function useFavorite(attractionId: string): FavoriteValue {
  const { setFavorite } = useUserData();
  const isFavorite = useSyncExternalStore(
    subscribeToFavorites,
    () => getFavoriteStatusSnapshot(attractionId),
    () => false,
  );
  const isLoaded = useSyncExternalStore(
    subscribeToFavorites,
    getFavoritesLoadedSnapshot,
    () => false,
  );

  return {
    isFavorite,
    isLoaded,
    toggleFavorite: () => setFavorite(attractionId, !isFavorite),
  };
}
