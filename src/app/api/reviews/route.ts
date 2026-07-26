import { NextResponse } from "next/server";

import { readUser } from "@/features/auth/lib/authenticatedUser";
import { readAttractions } from "@/features/attractions/data/attractions";
import {
  createAttractionReview,
  deleteAttractionReview,
  readReviews,
  readReviewSummaries,
  ReviewAlreadyExistsError,
  ReviewNotFoundError,
  updateAttractionReview,
} from "@/features/reviews/data/reviewsRepository";
import {
  parseReviewDeleteInput,
  parseReviewInput,
  parseReviewQuery,
} from "@/features/reviews/lib/reviewApiValidation";
import { AUTHOR_REVIEWS_PAGE_SIZE } from "@/features/reviews/lib/reviewPagination";
import { enforceUserRateLimit } from "@/features/security/lib/userRateLimit";
import { readJsonRequest } from "@/lib/apiRequest";

const RATE_LIMIT_WINDOW_MS = 60_000;
const REVIEW_WRITE_LIMIT = 20;
const ATTRACTION_NAMES = new Map(
  readAttractions().map((attraction) => [attraction.id, attraction.name]),
);

export async function GET(request: Request) {
  const query = parseReviewQuery(new URL(request.url).searchParams);

  if (!query) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  if (query.scope === "mine") {
    const user = await readUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      reviews: await readReviews({ userId: user.id }),
    });
  }

  if (query.scope === "author") {
    const reviews = await readReviews({
      userId: query.authorId,
      limit: AUTHOR_REVIEWS_PAGE_SIZE + 1,
      offset: query.offset,
    });

    return NextResponse.json({
      hasMore: reviews.length > AUTHOR_REVIEWS_PAGE_SIZE,
      reviews: reviews.slice(0, AUTHOR_REVIEWS_PAGE_SIZE).map((review) => ({
        ...review,
        attractionName: ATTRACTION_NAMES.get(review.attractionId) ?? "未知景點",
      })),
    });
  }

  if (query.scope === "attraction") {
    return NextResponse.json({
      reviews: await readReviews({ attractionId: query.attractionId }),
    });
  }

  return NextResponse.json({ summaries: await readReviewSummaries() });
}

export async function POST(request: Request) {
  const user = await readUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimitResponse = await limitReviewWrites(user.id);

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const reviewInput = parseReviewInput(await readJsonRequest(request));

  if (!reviewInput) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }

  try {
    const review = await createAttractionReview(
      user.id,
      reviewInput.attractionId,
      reviewInput.rating,
      reviewInput.comment,
      { id: user.id, image: user.image ?? null, name: user.name ?? null },
    );

    return NextResponse.json({ review });
  } catch (error) {
    if (error instanceof ReviewAlreadyExistsError) {
      return NextResponse.json(
        { error: "Review already exists" },
        { status: 409 },
      );
    }

    throw error;
  }
}

export async function PATCH(request: Request) {
  const user = await readUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimitResponse = await limitReviewWrites(user.id);

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const reviewInput = parseReviewInput(await readJsonRequest(request));

  if (!reviewInput) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }

  try {
    const review = await updateAttractionReview(
      user.id,
      reviewInput.attractionId,
      reviewInput.rating,
      reviewInput.comment,
      { id: user.id, image: user.image ?? null, name: user.name ?? null },
    );

    return NextResponse.json({ review });
  } catch (error) {
    if (error instanceof ReviewNotFoundError) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    throw error;
  }
}

export async function DELETE(request: Request) {
  const user = await readUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimitResponse = await limitReviewWrites(user.id);

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const reviewInput = parseReviewDeleteInput(await readJsonRequest(request));

  if (!reviewInput) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }

  await deleteAttractionReview(user.id, reviewInput.attractionId);

  return NextResponse.json({ success: true });
}

function limitReviewWrites(userId: string) {
  return enforceUserRateLimit({
    action: "review-write",
    userId,
    limit: REVIEW_WRITE_LIMIT,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
}
