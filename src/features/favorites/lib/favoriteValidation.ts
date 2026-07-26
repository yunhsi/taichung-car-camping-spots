import { isKnownAttractionId } from "@/features/attractions/lib/attractionIds";
import type { FavoriteUpdateInput } from "@/features/favorites/types";

export function parseFavoriteUpdateInput(value: unknown): FavoriteUpdateInput | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const mutation = value as Record<string, unknown>;

  if (
    !isKnownAttractionId(mutation.attractionId) ||
    typeof mutation.isFavorite !== "boolean"
  ) {
    return null;
  }

  return {
    attractionId: mutation.attractionId,
    isFavorite: mutation.isFavorite,
  };
}
