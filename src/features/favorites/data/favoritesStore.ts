const LISTENERS = new Set<() => void>();

let favoriteIds: readonly string[] = [];
let favoriteIdSet = new Set<string>();
let favoritesLoaded = false;

export function getFavoriteIdsSnapshot(): readonly string[] {
  return favoriteIds;
}

export function getFavoriteStatusSnapshot(attractionId: string): boolean {
  return favoriteIdSet.has(attractionId);
}

export function getFavoritesLoadedSnapshot(): boolean {
  return favoritesLoaded;
}

export function subscribeToFavorites(listener: () => void): () => void {
  LISTENERS.add(listener);

  return () => LISTENERS.delete(listener);
}

export function replaceFavoriteIds(nextFavoriteIds: readonly string[]): void {
  const normalizedIds = [...new Set(nextFavoriteIds)];

  if (
    normalizedIds.length === favoriteIds.length &&
    normalizedIds.every((id, index) => id === favoriteIds[index])
  ) {
    return;
  }

  favoriteIds = normalizedIds;
  favoriteIdSet = new Set(normalizedIds);
  emitChange();
}

export function setFavoriteIdStatus(
  attractionId: string,
  isFavorite: boolean,
): void {
  replaceFavoriteIds(
    isFavorite
      ? [...favoriteIds, attractionId]
      : favoriteIds.filter((id) => id !== attractionId),
  );
}

export function setFavoritesLoaded(isLoaded: boolean): void {
  if (favoritesLoaded === isLoaded) {
    return;
  }

  favoritesLoaded = isLoaded;
  emitChange();
}

function emitChange(): void {
  [...LISTENERS].forEach((listener) => listener());
}
