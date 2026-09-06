import { readAttractions } from "@/features/attractions/data/attractions";

const ATTRACTION_IDS = new Set(
  readAttractions().map((attraction) => attraction.id),
);

export function isKnownAttractionId(value: unknown): value is string {
  return typeof value === "string" && ATTRACTION_IDS.has(value);
}
