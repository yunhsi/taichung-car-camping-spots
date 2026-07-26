const FAVORITES_STORAGE_KEY = "favoriteAttractionIds";
const FAVORITES_CHANGE_EVENT = "favorites-change";
const EMPTY_FAVORITES_SNAPSHOT = "[]";
let cachedSnapshot = "";
let cachedFavoriteIds: string[] = [];
let cachedFavoriteIdSet = new Set<string>();
const favoritesListeners = new Set<() => void>();
let unsubscribeFromBrowserEvents: (() => void) | null = null;

export function getFavoriteIdsSnapshot(): readonly string[] {
  updateFavoritesCache(getFavoritesSnapshot());

  return cachedFavoriteIds;
}

export function getFavoriteStatusSnapshot(attractionId: string): boolean {
  updateFavoritesCache(getFavoritesSnapshot());

  return cachedFavoriteIdSet.has(attractionId);
}

export function subscribeToFavorites(onStoreChange: () => void) {
  favoritesListeners.add(onStoreChange);

  if (!unsubscribeFromBrowserEvents) {
    unsubscribeFromBrowserEvents = subscribeToBrowserEvents();
  }

  return () => {
    favoritesListeners.delete(onStoreChange);

    if (favoritesListeners.size === 0) {
      unsubscribeFromBrowserEvents?.();
      unsubscribeFromBrowserEvents = null;
    }
  };
}

export function toggleFavoriteId(attractionId: string) {
  try {
    const favoriteIds = parseFavoriteIds(
      localStorage.getItem(FAVORITES_STORAGE_KEY),
    );
    const nextFavoriteIds = favoriteIds.includes(attractionId)
      ? favoriteIds.filter((id) => id !== attractionId)
      : [...favoriteIds, attractionId];

    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(nextFavoriteIds),
    );
    window.dispatchEvent(new Event(FAVORITES_CHANGE_EVENT));
  } catch (error) {
    // Browsers may deny storage access; unexpected failures should still surface.
    if (!(error instanceof DOMException)) {
      throw error;
    }
  }
}

export function parseFavoriteIds(value: string | null): string[] {
  try {
    const parsedValue: unknown = JSON.parse(value ?? "[]");

    return Array.isArray(parsedValue)
      ? [
          ...new Set(
            parsedValue
              .filter((item): item is string => typeof item === "string")
              .map((item) => item.trim())
              .filter(Boolean),
          ),
        ]
      : [];
  } catch (error) {
    if (error instanceof SyntaxError) {
      return [];
    }

    throw error;
  }
}

export function getFavoritesSnapshot(): string {
  try {
    return localStorage.getItem(FAVORITES_STORAGE_KEY) ?? EMPTY_FAVORITES_SNAPSHOT;
  } catch (error) {
    if (error instanceof DOMException) {
      return EMPTY_FAVORITES_SNAPSHOT;
    }

    throw error;
  }
}

function updateFavoritesCache(snapshot: string): void {
  if (snapshot === cachedSnapshot) {
    return;
  }

  cachedSnapshot = snapshot;
  cachedFavoriteIds = parseFavoriteIds(snapshot);
  cachedFavoriteIdSet = new Set(cachedFavoriteIds);
}

function subscribeToBrowserEvents() {
  function notifyListeners() {
    favoritesListeners.forEach((listener) => listener());
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === FAVORITES_STORAGE_KEY || event.key === null) {
      notifyListeners();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(FAVORITES_CHANGE_EVENT, notifyListeners);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(FAVORITES_CHANGE_EVENT, notifyListeners);
  };
}