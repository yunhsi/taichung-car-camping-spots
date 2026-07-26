"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { fetchAuthorReviews } from "@/features/reviews/data/reviewsApi";
import type {
  AuthorReview,
  AuthorReviewsStatus,
} from "@/features/reviews/types";

interface AuthorReviewsState {
  authorId: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMoreFailed: boolean;
  reviews: readonly AuthorReview[];
  status: AuthorReviewsStatus;
}

interface AuthorReviewsValue extends Omit<AuthorReviewsState, "authorId"> {
  loadMore: () => void;
  retry: () => void;
}

const INITIAL_STATE: AuthorReviewsState = {
  authorId: "",
  hasMore: false,
  isLoadingMore: false,
  loadMoreFailed: false,
  reviews: [],
  status: "loading",
};

export function useAuthorReviews(
  authorId: string,
  shouldLoad: boolean,
): AuthorReviewsValue {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<AuthorReviewsState>(INITIAL_STATE);
  const requestGenerationRef = useRef(0);
  const loadMoreControllerRef = useRef<AbortController | null>(null);
  const currentState = useMemo(
    () =>
      state.authorId === authorId
        ? state
        : { ...INITIAL_STATE, authorId },
    [authorId, state],
  );

  useEffect(function loadInitialAuthorReviews() {
    if (!shouldLoad || !authorId) {
      return;
    }

    const generation = requestGenerationRef.current + 1;
    const controller = new AbortController();
    requestGenerationRef.current = generation;
    loadMoreControllerRef.current?.abort();

    void fetchAuthorReviews(authorId, 0, controller.signal)
      .then((page) => {
        if (requestGenerationRef.current !== generation) {
          return;
        }

        setState({
          authorId,
          hasMore: page.hasMore,
          isLoadingMore: false,
          loadMoreFailed: false,
          reviews: page.reviews,
          status: "loaded",
        });
      })
      .catch((error: unknown) => {
        if (
          requestGenerationRef.current === generation &&
          !isAbortError(error)
        ) {
          setState({
            ...INITIAL_STATE,
            authorId,
            status: "error",
          });
        }
      });

    return () => {
      controller.abort();
      loadMoreControllerRef.current?.abort();

      if (requestGenerationRef.current === generation) {
        requestGenerationRef.current += 1;
      }
    };
  }, [authorId, reloadKey, shouldLoad]);

  const retry = useCallback(() => {
    setState({ ...INITIAL_STATE, authorId });
    setReloadKey((key) => key + 1);
  }, [authorId]);

  const loadMore = useCallback(() => {
    if (
      !authorId ||
      currentState.status !== "loaded" ||
      !currentState.hasMore ||
      currentState.isLoadingMore
    ) {
      return;
    }

    const generation = requestGenerationRef.current;
    const controller = new AbortController();
    loadMoreControllerRef.current?.abort();
    loadMoreControllerRef.current = controller;
    setState((previous) => ({
      ...previous,
      isLoadingMore: true,
      loadMoreFailed: false,
    }));
    void fetchAuthorReviews(
      authorId,
      currentState.reviews.length,
      controller.signal,
    )
      .then((page) => {
        setState((previous) => {
          if (
            requestGenerationRef.current !== generation ||
            previous.authorId !== authorId
          ) {
            return previous;
          }

          return {
            ...previous,
            hasMore: page.hasMore,
            isLoadingMore: false,
            reviews: [...previous.reviews, ...page.reviews],
          };
        });
      })
      .catch((error: unknown) => {
        if (
          requestGenerationRef.current !== generation ||
          isAbortError(error)
        ) {
          return;
        }

        setState((previous) =>
          previous.authorId === authorId
            ? {
                ...previous,
                isLoadingMore: false,
                loadMoreFailed: true,
              }
            : previous,
        );
      });
  }, [authorId, currentState]);

  return { ...currentState, loadMore, retry };
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
