"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import { fetchReviews } from "@/features/reviews/data/reviewsApi";
import {
  getAttractionReviewSummarySnapshot,
  getAttractionReviewsSnapshot,
  getAttractionReviewsStatusSnapshot,
  getOwnAttractionReviewSnapshot,
  getOwnReviewsStatusSnapshot,
  replaceAttractionReviews,
  setAttractionReviewsStatus,
  subscribeToReviews,
  type OwnReviewsLoadStatus,
  type ReviewsLoadStatus,
} from "@/features/reviews/data/reviewsStore";
import { EMPTY_REVIEW_SUMMARY } from "@/features/reviews/lib/reviewSummary";
import type {
  AttractionReview,
  ReviewSummary,
} from "@/features/reviews/types";

const EMPTY_REVIEWS: readonly AttractionReview[] = [];

interface AttractionReviewValue {
  review: AttractionReview | undefined;
  status: OwnReviewsLoadStatus;
}

interface AttractionReviewsValue {
  reload: () => void;
  reviews: readonly AttractionReview[];
  status: ReviewsLoadStatus;
}

interface AttractionReviewSummaryValue {
  summary: ReviewSummary;
}

export function useOwnAttractionReview(
  attractionId: string,
): AttractionReviewValue {
  const review = useSyncExternalStore(
    subscribeToReviews,
    () => getOwnAttractionReviewSnapshot(attractionId),
    (): AttractionReview | undefined => undefined,
  );
  const status = useSyncExternalStore(
    subscribeToReviews,
    getOwnReviewsStatusSnapshot,
    (): OwnReviewsLoadStatus => "idle",
  );

  return { review, status };
}

export function useAttractionReviewSummary(
  attractionId: string,
): AttractionReviewSummaryValue {
  const summary = useSyncExternalStore(
    subscribeToReviews,
    () => getAttractionReviewSummarySnapshot(attractionId),
    () => EMPTY_REVIEW_SUMMARY,
  );

  return { summary };
}

export function useAttractionReviews(
  attractionId: string,
  shouldLoad = false,
): AttractionReviewsValue {
  const reviews = useSyncExternalStore(
    subscribeToReviews,
    () => getAttractionReviewsSnapshot(attractionId),
    (): readonly AttractionReview[] => EMPTY_REVIEWS,
  );
  const status = useSyncExternalStore(
    subscribeToReviews,
    () => getAttractionReviewsStatusSnapshot(attractionId),
    (): ReviewsLoadStatus => "idle",
  );
  const load = useCallback(() => {
    if (!attractionId) {
      return;
    }

    setAttractionReviewsStatus(attractionId, "loading");
    void fetchReviews({ attractionId })
      .then((nextReviews) => {
        replaceAttractionReviews(attractionId, nextReviews);
      })
      .catch(() => {
        setAttractionReviewsStatus(attractionId, "error");
      });
  }, [attractionId]);

  useEffect(() => {
    if (shouldLoad) {
      load();
    }
  }, [load, shouldLoad]);

  return { reload: load, reviews, status };
}
