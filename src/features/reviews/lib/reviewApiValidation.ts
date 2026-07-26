import { isKnownAttractionId } from "@/features/attractions/lib/attractionIds";
import {
  containsInappropriateReviewContent,
  isValidReviewRating,
  MAX_REVIEW_COMMENT_LENGTH,
  normalizeReviewComment,
} from "@/features/reviews/lib/reviewValidation";
import { parseAuthorReviewsOffset } from "@/features/reviews/lib/reviewPagination";
import type {
  ReviewDeleteInput,
  ReviewInput,
} from "@/features/reviews/types";
import { isUuid } from "@/lib/validation";

export type ReviewQuery =
  | { scope: "summaries" }
  | { scope: "mine" }
  | { scope: "author"; authorId: string; offset: number }
  | { scope: "attraction"; attractionId: string };

const REVIEW_QUERY_KEYS = [
  "attractionId",
  "authorId",
  "mine",
  "offset",
] as const;

export function parseReviewQuery(
  searchParams: URLSearchParams,
): ReviewQuery | null {
  if (
    [...searchParams.keys()].some(
      (key) => !REVIEW_QUERY_KEYS.includes(key as typeof REVIEW_QUERY_KEYS[number]),
    ) ||
    REVIEW_QUERY_KEYS.some((key) => searchParams.getAll(key).length > 1)
  ) {
    return null;
  }

  const attractionId = searchParams.get("attractionId");
  const authorId = searchParams.get("authorId");
  const mine = searchParams.get("mine");
  const offsetValue = searchParams.get("offset");
  const selectedScopes = [attractionId !== null, authorId !== null, mine !== null]
    .filter(Boolean).length;

  if (selectedScopes > 1) {
    return null;
  }

  if (mine !== null) {
    return mine === "true" && offsetValue === null ? { scope: "mine" } : null;
  }

  if (authorId !== null) {
    const offset = parseAuthorReviewsOffset(offsetValue);

    return isUuid(authorId) && offset !== null
      ? { scope: "author", authorId, offset }
      : null;
  }

  if (attractionId !== null) {
    return isKnownAttractionId(attractionId) && offsetValue === null
      ? { scope: "attraction", attractionId }
      : null;
  }

  return offsetValue === null ? { scope: "summaries" } : null;
}

export function parseReviewInput(
  value: unknown,
): ReviewInput | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const mutation = value as Record<string, unknown>;

  if (
    !isKnownAttractionId(mutation.attractionId) ||
    !isValidReviewRating(mutation.rating) ||
    typeof mutation.comment !== "string"
  ) {
    return null;
  }

  const comment = normalizeReviewComment(mutation.comment);

  if (
    !comment ||
    comment.length > MAX_REVIEW_COMMENT_LENGTH ||
    containsInappropriateReviewContent(comment)
  ) {
    return null;
  }

  return {
    attractionId: mutation.attractionId,
    rating: mutation.rating,
    comment,
  };
}

export function parseReviewDeleteInput(
  value: unknown,
): ReviewDeleteInput | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const mutation = value as Record<string, unknown>;

  return isKnownAttractionId(mutation.attractionId)
    ? { attractionId: mutation.attractionId }
    : null;
}
