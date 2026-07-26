import "server-only";

import { and, avg, count, desc, eq } from "drizzle-orm";

import type {
  AttractionReview,
  AttractionReviewSummary,
  ReviewAuthor,
  ReviewRating,
} from "@/features/reviews/types";
import { isValidReviewRating } from "@/features/reviews/lib/reviewValidation";
import { getDatabase } from "@/lib/db";
import { reviews, users } from "@/lib/db/schema";

interface ReadReviewsOptions {
  attractionId?: string;
  limit?: number;
  offset?: number;
  userId?: string;
}

export async function readReviews(
  options: ReadReviewsOptions = {},
): Promise<AttractionReview[]> {
  const database = getDatabase();
  const query = database
    .select({
      id: reviews.id,
      attractionId: reviews.attractionId,
      rating: reviews.rating,
      comment: reviews.comment,
      updatedAt: reviews.updatedAt,
      authorId: users.id,
      authorName: users.name,
      authorImage: users.image,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .orderBy(desc(reviews.updatedAt), desc(reviews.id));
  const filter = options.userId && options.attractionId
    ? and(
        eq(reviews.userId, options.userId),
        eq(reviews.attractionId, options.attractionId),
      )
    : options.userId
      ? eq(reviews.userId, options.userId)
      : options.attractionId
        ? eq(reviews.attractionId, options.attractionId)
        : undefined;
  const filteredQuery = filter ? query.where(filter) : query;
  const rows = options.limit === undefined
    ? await filteredQuery
    : await filteredQuery
        .limit(options.limit)
        .offset(options.offset ?? 0);

  return rows.map((review) => toAttractionReview(review));
}

export async function readReviewSummaries(): Promise<AttractionReviewSummary[]> {
  const database = getDatabase();
  const rows = await database
    .select({
      attractionId: reviews.attractionId,
      averageRating: avg(reviews.rating),
      totalReviews: count(),
    })
    .from(reviews)
    .groupBy(reviews.attractionId);

  return rows.map((row) => ({
    attractionId: row.attractionId,
    averageRating:
      row.averageRating === null ? null : Number(row.averageRating),
    totalReviews: row.totalReviews,
  }));
}

export async function createAttractionReview(
  userId: string,
  attractionId: string,
  rating: ReviewRating,
  comment: string,
  author: ReviewAuthor,
): Promise<AttractionReview> {
  const database = getDatabase();
  const savedAt = new Date();
  const [review] = await database
    .insert(reviews)
    .values({
      userId,
      attractionId,
      id: crypto.randomUUID(),
      rating,
      comment,
      updatedAt: savedAt,
    })
    .onConflictDoNothing()
    .returning({
      id: reviews.id,
      attractionId: reviews.attractionId,
      rating: reviews.rating,
      comment: reviews.comment,
      updatedAt: reviews.updatedAt,
    });

  if (!review) {
    throw new ReviewAlreadyExistsError();
  }

  return toAttractionReview(review, author);
}

export async function updateAttractionReview(
  userId: string,
  attractionId: string,
  rating: ReviewRating,
  comment: string,
  author: ReviewAuthor,
): Promise<AttractionReview> {
  const database = getDatabase();
  const [review] = await database
    .update(reviews)
    .set({ rating, comment, updatedAt: new Date() })
    .where(
      and(
        eq(reviews.userId, userId),
        eq(reviews.attractionId, attractionId),
      ),
    )
    .returning({
      id: reviews.id,
      attractionId: reviews.attractionId,
      rating: reviews.rating,
      comment: reviews.comment,
      updatedAt: reviews.updatedAt,
    });

  if (!review) {
    throw new ReviewNotFoundError();
  }

  return toAttractionReview(review, author);
}

export async function deleteAttractionReview(
  userId: string,
  attractionId: string,
): Promise<void> {
  const database = getDatabase();
  await database
    .delete(reviews)
    .where(
      and(
        eq(reviews.userId, userId),
        eq(reviews.attractionId, attractionId),
      ),
    );
}

export function toAttractionReview(review: {
  authorId?: string;
  authorImage?: string | null;
  authorName?: string | null;
  id: string;
  attractionId: string;
  rating: number;
  comment: string;
  updatedAt: Date;
}, author?: ReviewAuthor): AttractionReview {
  if (!isValidReviewRating(review.rating)) {
    throw new Error("評論查詢結果包含無效星等。");
  }

  const resolvedAuthor = author ?? toReviewAuthor(review);

  return {
    id: review.id,
    attractionId: review.attractionId,
    rating: review.rating,
    comment: review.comment,
    updatedAt: review.updatedAt.toISOString(),
    author: resolvedAuthor,
  };
}

function toReviewAuthor(review: {
  authorId?: string;
  authorImage?: string | null;
  authorName?: string | null;
}): ReviewAuthor {
  if (!review.authorId) {
    throw new Error("評論查詢結果缺少作者識別碼。");
  }

  return {
    id: review.authorId,
    image: review.authorImage ?? null,
    name: review.authorName ?? null,
  };
}

export class ReviewAlreadyExistsError extends Error {}

export class ReviewNotFoundError extends Error {}
