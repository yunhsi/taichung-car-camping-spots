import type { ReviewRating } from "@/features/reviews/types";

export const REVIEW_RATING_VALUES = [1, 2, 3, 4, 5] as const satisfies readonly ReviewRating[];
export const MAX_REVIEW_COMMENT_LENGTH = 100;
export const INAPPROPRIATE_REVIEW_COMMENT_MESSAGE =
  "評論包含不適當用語，請修改後再送出。";

const BLOCKED_REVIEW_TERMS = [
  "幹你娘",
  "幹你媽",
  "幹您娘",
  "操你媽",
  "草你媽",
  "他媽的",
  "媽的",
  "機掰",
  "雞掰",
  "靠北",
  "靠杯",
  "白癡",
  "白痴",
  "智障",
  "腦殘",
  "低能兒",
  "賤人",
  "婊子",
  "王八蛋",
  "去死",
  "死全家",
  "殺你全家",
  "草泥馬",
  "fuck",
  "fucker",
  "fucking",
  "shit",
  "bitch",
  "asshole",
  "cunt",
] as const;

export function isValidReviewRating(value: unknown): value is ReviewRating {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= REVIEW_RATING_VALUES[0] &&
    value <= REVIEW_RATING_VALUES.at(-1)!
  );
}

export function normalizeReviewComment(comment: string): string {
  return comment.trim();
}

export function containsInappropriateReviewContent(comment: string): boolean {
  const normalizedComment = comment
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\p{P}\p{S}\p{Cf}\s_]+/gu, "");

  return BLOCKED_REVIEW_TERMS.some((term) => normalizedComment.includes(term));
}

export function isValidReviewComment(value: unknown): value is string {
  return (
    typeof value === "string" &&
    Boolean(value.trim()) &&
    value.length <= MAX_REVIEW_COMMENT_LENGTH
  );
}
