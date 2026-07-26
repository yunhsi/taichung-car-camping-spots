const FAVORITES_API_URL = "/api/favorites";

export async function fetchFavorites(): Promise<string[]> {
  const response = await fetch(FAVORITES_API_URL, { cache: "no-store" });

  ensureSuccessfulResponse(response);
  const value: unknown = await response.json();

  if (!value || typeof value !== "object" || !("favoriteAttractionIds" in value)) {
    throw new Error("伺服器回傳的收藏資料格式不正確。");
  }

  const favoriteAttractionIds = value.favoriteAttractionIds;

  if (!Array.isArray(favoriteAttractionIds)) {
    throw new Error("伺服器回傳的收藏資料格式不正確。");
  }

  return [...new Set(favoriteAttractionIds.filter(isNonEmptyString))];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && Boolean(value.trim());
}

export async function requestUpdateFavorite(
  attractionId: string,
  isFavorite: boolean,
): Promise<void> {
  const response = await fetch(FAVORITES_API_URL, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attractionId, isFavorite }),
  });

  ensureSuccessfulResponse(response);
}

function ensureSuccessfulResponse(response: Response): void {
  if (response.ok) {
    return;
  }

  if (response.status === 401) {
    throw new Error("請先登入再使用收藏功能。");
  }

  if (response.status === 429) {
    throw new Error("操作太頻繁，請稍後再試。");
  }

  throw new Error("收藏同步失敗，請稍後再試。");
}
