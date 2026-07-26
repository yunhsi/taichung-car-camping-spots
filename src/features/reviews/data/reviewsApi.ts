import {
  isValidReviewComment,
  isValidReviewRating,
} from "@/features/reviews/lib/reviewValidation";
import type {
  AttractionReview,
  AttractionReviewSummary,
  AuthorReview,
  AuthorReviewsPage,
  ReviewRating,
} from "@/features/reviews/types";
import { isNullableString, isRecord } from "@/lib/validation";

const REVIEWS_API_URL = "/api/reviews";

type ReviewsScope =
  | { attractionId: string; mine?: never }
  | { attractionId?: never; mine: true };

export async function fetchReviews(
  scope: ReviewsScope,
): Promise<AttractionReview[]> {
  const searchParams = new URLSearchParams();

  if (scope.mine) {
    searchParams.set("mine", "true");
  } else {
    searchParams.set("attractionId", scope.attractionId);
  }

  return requestReviews(`${REVIEWS_API_URL}?${searchParams}`);
}

export async function fetchAuthorReviews(
  authorId: string,
  offset = 0,
  signal?: AbortSignal,
): Promise<AuthorReviewsPage> {
  const searchParams = new URLSearchParams({ authorId });

  if (offset > 0) {
    searchParams.set("offset", String(offset));
  }

  const response = await fetch(`${REVIEWS_API_URL}?${searchParams}`, {
    cache: "no-store",
    signal,
  });

  ensureSuccessfulResponse(response);
  const value: unknown = await response.json();

  if (
    !isRecord(value) ||
    typeof value.hasMore !== "boolean" ||
    !Array.isArray(value.reviews)
  ) {
    throw new Error("伺服器回傳的作者評論格式不正確。");
  }

  return {
    hasMore: value.hasMore,
    reviews: parseArray(value.reviews, parseAuthorReview, "作者評論"),
  };
}

export async function fetchReviewSummaries(): Promise<AttractionReviewSummary[]> {
  const response = await fetch(REVIEWS_API_URL, { cache: "no-store" });

  ensureSuccessfulResponse(response);
  const value: unknown = await response.json();

  if (!isRecord(value) || !Array.isArray(value.summaries)) {
    throw new Error("伺服器回傳的評論摘要格式不正確。");
  }

  return parseArray(value.summaries, parseReviewSummary, "評論摘要");
}

export async function requestUpdateReview(
  attractionId: string,
  rating: ReviewRating,
  comment: string,
): Promise<AttractionReview> {
  return writeReview("PATCH", attractionId, rating, comment);
}

export async function requestCreateReview(
  attractionId: string,
  rating: ReviewRating,
  comment: string,
): Promise<AttractionReview> {
  return writeReview("POST", attractionId, rating, comment);
}

async function writeReview(
  method: "POST" | "PATCH",
  attractionId: string,
  rating: ReviewRating,
  comment: string,
): Promise<AttractionReview> {
  const response = await fetch(REVIEWS_API_URL, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attractionId, rating, comment }),
  });

  ensureSuccessfulResponse(response);
  const value: unknown = await response.json();

  if (!isRecord(value) || !("review" in value)) {
    throw new Error("伺服器回傳的評論資料格式不正確。");
  }

  const review = parseReview(value.review);

  if (!review) {
    throw new Error("伺服器回傳的評論資料格式不正確。");
  }

  return review;
}

export async function requestDeleteReview(attractionId: string): Promise<void> {
  const response = await fetch(REVIEWS_API_URL, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attractionId }),
  });

  ensureSuccessfulResponse(response);
}

async function requestReviews(url: string): Promise<AttractionReview[]> {
  const response = await fetch(url, { cache: "no-store" });

  ensureSuccessfulResponse(response);
  const value: unknown = await response.json();

  if (!isRecord(value) || !Array.isArray(value.reviews)) {
    throw new Error("伺服器回傳的評論資料格式不正確。");
  }

  return parseArray(value.reviews, parseReview, "評論資料");
}

function parseReview(value: unknown): AttractionReview | null {
  if (!isRecord(value)) {
    return null;
  }

  const author = parseReviewAuthor(value.author);

  if (
    !author ||
    typeof value.id !== "string" ||
    !value.id.trim() ||
    typeof value.attractionId !== "string" ||
    !value.attractionId.trim() ||
    !isValidReviewRating(value.rating) ||
    !isValidReviewComment(value.comment) ||
    typeof value.updatedAt !== "string" ||
    Number.isNaN(Date.parse(value.updatedAt))
  ) {
    return null;
  }

  return {
    author,
    id: value.id,
    attractionId: value.attractionId,
    rating: value.rating,
    comment: value.comment,
    updatedAt: value.updatedAt,
  };
}

function parseAuthorReview(value: unknown): AuthorReview | null {
  const review = parseReview(value);

  if (
    !review ||
    !isRecord(value) ||
    typeof value.attractionName !== "string" ||
    !value.attractionName.trim()
  ) {
    return null;
  }

  return { ...review, attractionName: value.attractionName };
}

function parseReviewAuthor(
  value: unknown,
): AttractionReview["author"] | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    !value.id.trim() ||
    !isNullableString(value.name) ||
    !isNullableString(value.image) ||
    !isSupportedAuthorImage(value.image)
  ) {
    return null;
  }

  return { id: value.id, name: value.name, image: value.image };
}

function parseReviewSummary(value: unknown): AttractionReviewSummary | null {
  if (
    !isRecord(value) ||
    typeof value.attractionId !== "string" ||
    !value.attractionId.trim() ||
    (value.averageRating !== null &&
      (typeof value.averageRating !== "number" ||
        !Number.isFinite(value.averageRating) ||
        value.averageRating < 1 ||
        value.averageRating > 5)) ||
    typeof value.totalReviews !== "number" ||
    !Number.isInteger(value.totalReviews) ||
    value.totalReviews < 0
  ) {
    return null;
  }

  return {
    attractionId: value.attractionId,
    averageRating: value.averageRating,
    totalReviews: value.totalReviews,
  };
}

function parseArray<T>(
  values: readonly unknown[],
  parseValue: (value: unknown) => T | null,
  label: string,
): T[] {
  const parsedValues = values.map(parseValue);

  if (parsedValues.some((value) => value === null)) {
    throw new Error(`伺服器回傳的${label}格式不正確。`);
  }

  return parsedValues as T[];
}

function isSupportedAuthorImage(value: string | null): boolean {
  if (value === null) {
    return true;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname === "lh3.googleusercontent.com"
    );
  } catch {
    return false;
  }
}

function ensureSuccessfulResponse(response: Response): void {
  if (response.ok) {
    return;
  }

  if (response.status === 401) {
    throw new Error("請先登入再編輯評論。");
  }

  if (response.status === 429) {
    throw new Error("操作太頻繁，請稍後再試。");
  }

  throw new Error("評論同步失敗，請稍後再試。");
}
