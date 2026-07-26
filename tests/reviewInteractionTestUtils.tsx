import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui/Toast";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { readAttractions } from "@/features/attractions/data/attractions";
import {
  replaceFavoriteIds,
  setFavoritesLoaded,
} from "@/features/favorites/data/favoritesStore";
import {
  clearAttractionReviews,
  replaceOwnReviews,
  replaceReviewSummaries,
  setOwnReviewsStatus,
} from "@/features/reviews/data/reviewsStore";
import type { AttractionReview } from "@/features/reviews/types";
import { UserDataProvider } from "@/features/user/components/UserDataProvider";

const ORIGINAL_FETCH = globalThis.fetch;

export const TEST_REVIEW_AUTHOR = {
  id: "25e3af15-8024-427c-8840-4e4f2d2b2149",
  image: null,
  name: "測試旅人",
};

export const AUTHENTICATED_USER = {
  id: "user-1",
  email: "traveler@example.com",
  image: null,
  name: "測試旅人",
};

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}

interface FetchMockOptions {
  initialOwnReviews?: AttractionReview[];
  initialPublicReviews?: AttractionReview[];
  ownReviewsLoad?: Deferred<Response>;
  reviewSave?: Deferred<Response>;
}

export function createDeferred<T>(): Deferred<T> {
  let resolvePromise: ((value: T) => void) | undefined;
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });

  return {
    promise,
    resolve(value) {
      resolvePromise?.(value);
    },
  };
}

export function installAuthenticatedFetchMock(
  options: FetchMockOptions = {},
) {
  const requests: Array<{ method: string; url: string }> = [];
  globalThis.fetch = async (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const method = init?.method ?? "GET";
    const requestUrl = new URL(url, "http://localhost");
    requests.push({ method, url: `${requestUrl.pathname}${requestUrl.search}` });

    if (requestUrl.pathname === "/api/favorites" && method === "GET") {
      return Response.json({ favoriteAttractionIds: [] });
    }

    if (
      requestUrl.pathname === "/api/reviews" &&
      requestUrl.searchParams.get("mine") === "true"
    ) {
      return options.ownReviewsLoad?.promise ??
        Response.json({ reviews: options.initialOwnReviews ?? [] });
    }

    if (requestUrl.pathname === "/api/reviews" && method === "GET") {
      return Response.json({ reviews: options.initialPublicReviews ?? [] });
    }

    if (
      requestUrl.pathname === "/api/reviews" &&
      (method === "POST" || method === "PATCH")
    ) {
      return options.reviewSave?.promise ?? Response.json({ success: true });
    }

    if (requestUrl.pathname === "/api/reviews" && method === "DELETE") {
      return Response.json({ success: true });
    }

    if (requestUrl.pathname === "/api/review-reports" && method === "POST") {
      return Response.json({ success: true });
    }

    throw new Error(`未處理的測試請求：${method} ${requestUrl.pathname}`);
  };

  return requests;
}

export function TestProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <ToastProvider>
        <UserDataProvider initialUser={AUTHENTICATED_USER}>
          {children}
        </UserDataProvider>
      </ToastProvider>
    </TooltipProvider>
  );
}

export function resetReviewInteractionEnvironment(): void {
  globalThis.fetch = ORIGINAL_FETCH;
  replaceFavoriteIds([]);
  setFavoritesLoaded(false);
  replaceOwnReviews([]);
  setOwnReviewsStatus("idle");
  replaceReviewSummaries([]);

  const attraction = readAttractions()[0];

  if (attraction) {
    clearAttractionReviews(attraction.id);
  }
}
