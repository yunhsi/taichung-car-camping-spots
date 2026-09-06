import type { AttractionListItem } from "@/features/attractions/types";

const ATTRACTION_SEARCH_PARAM = "attraction";

export function getValidAttractionIdFromUrl(
  attractions: readonly AttractionListItem[],
): string | null {
  const attractionId = new URL(window.location.href).searchParams.get(
    ATTRACTION_SEARCH_PARAM,
  );

  return attractions.some(({ id }) => id === attractionId)
    ? attractionId
    : null;
}

export function setAttractionUrlState(
  attractionId: string | null,
  mode: "push" | "replace",
): void {
  const url = new URL(window.location.href);

  if (attractionId) {
    url.searchParams.set(ATTRACTION_SEARCH_PARAM, attractionId);
  } else {
    url.searchParams.delete(ATTRACTION_SEARCH_PARAM);
  }

  if (mode === "push") {
    window.history.pushState(null, "", url);
    return;
  }

  window.history.replaceState(null, "", url);
}
