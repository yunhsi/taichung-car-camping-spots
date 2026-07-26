"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";

import { useToast } from "@/components/ui/Toast";
import {
  fetchFavorites,
  requestUpdateFavorite,
} from "@/features/favorites/data/favoritesApi";
import {
  replaceFavoriteIds,
  setFavoriteIdStatus,
  setFavoritesLoaded,
} from "@/features/favorites/data/favoritesStore";
import {
  fetchReviews,
  requestCreateReview,
  requestDeleteReview,
  requestUpdateReview,
} from "@/features/reviews/data/reviewsApi";
import {
  deletePublicReview,
  deleteOwnReview,
  getOwnAttractionReviewSnapshot,
  replaceOwnReviews,
  setOwnReviewsStatus,
  setOwnReview,
  setPublicReview,
} from "@/features/reviews/data/reviewsStore";
import type {
  AttractionReview,
  ReviewRating,
} from "@/features/reviews/types";
import type { AuthenticatedUser } from "@/features/user/types";
import { getErrorMessage } from "@/lib/errors";

interface UserDataContextValue {
  canEditUserData: boolean;
  createReview: (
    attractionId: string,
    rating: ReviewRating,
    comment: string,
  ) => Promise<void>;
  deleteReview: (attractionId: string) => Promise<void>;
  updateReview: (
    attractionId: string,
    rating: ReviewRating,
    comment: string,
  ) => Promise<void>;
  setFavorite: (attractionId: string, nextIsFavorite: boolean) => Promise<void>;
  user: AuthenticatedUser | null;
}

interface UserDataProviderProps {
  children: ReactNode;
  initialUser: AuthenticatedUser | null;
}

const UNAUTHENTICATED_CONTEXT: UserDataContextValue = {
  canEditUserData: false,
  createReview: () => Promise.reject(new Error("請先登入再撰寫評論。")),
  deleteReview: () => Promise.reject(new Error("請先登入再刪除評論。")),
  updateReview: () => Promise.reject(new Error("請先登入再更新評論。")),
  setFavorite: () => Promise.reject(new Error("請先登入再使用收藏功能。")),
  user: null,
};
const UserDataContext = createContext<UserDataContextValue>(
  UNAUTHENTICATED_CONTEXT,
);

export function UserDataProvider({
  children,
  initialUser,
}: UserDataProviderProps) {
  const { showToast } = useToast();
  const userId = initialUser?.id ?? null;

  useEffect(() => {
    let isCancelled = false;

    if (!userId) {
      replaceFavoriteIds([]);
      replaceOwnReviews([]);
      setFavoritesLoaded(true);
      setOwnReviewsStatus("loaded");
      return;
    }

    replaceFavoriteIds([]);
    replaceOwnReviews([]);
    setFavoritesLoaded(false);
    setOwnReviewsStatus("loading");

    void fetchFavorites()
      .then((favoriteIds) => {
        if (!isCancelled) {
          replaceFavoriteIds(favoriteIds);
          setFavoritesLoaded(true);
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          replaceFavoriteIds([]);
          setFavoritesLoaded(true);
          showLoadError(showToast, error, "收藏載入失敗");
        }
      });

    void fetchReviews({ mine: true })
      .then((reviews) => {
        if (!isCancelled) {
          replaceOwnReviews(reviews);
          setOwnReviewsStatus("loaded");
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          replaceOwnReviews([]);
          setOwnReviewsStatus("error");
          showLoadError(showToast, error, "我的評論載入失敗");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [showToast, userId]);

  const value = useMemo<UserDataContextValue>(
    () => ({
      canEditUserData: Boolean(userId),
      user: initialUser,
      async setFavorite(attractionId, nextIsFavorite) {
        requireSignedIn(userId, "請先登入再使用收藏功能。");
        await requestUpdateFavorite(attractionId, nextIsFavorite);
        setFavoriteIdStatus(attractionId, nextIsFavorite);
      },
      async createReview(attractionId, rating, comment) {
        requireSignedIn(userId, "請先登入再撰寫評論。");
        saveReview(
          await requestCreateReview(attractionId, rating, comment),
        );
      },
      async updateReview(attractionId, rating, comment) {
        requireSignedIn(userId, "請先登入再更新評論。");
        const previousReview = getOwnAttractionReviewSnapshot(attractionId);
        saveReview(
          await requestUpdateReview(attractionId, rating, comment),
          previousReview,
        );
      },
      async deleteReview(attractionId) {
        requireSignedIn(userId, "請先登入再刪除評論。");
        const ownReview = getOwnAttractionReviewSnapshot(attractionId);

        await requestDeleteReview(attractionId);
        deleteOwnReview(attractionId);

        if (ownReview) {
          deletePublicReview(attractionId, ownReview.id, ownReview);
        }
      },
    }),
    [initialUser, userId],
  );

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData(): UserDataContextValue {
  return useContext(UserDataContext);
}

function saveReview(
  review: AttractionReview,
  previousReview?: AttractionReview,
): void {
  setOwnReview(review);
  setPublicReview(review, previousReview);
}

function requireSignedIn(userId: string | null, message: string): asserts userId {
  if (!userId) {
    throw new Error(message);
  }
}

function showLoadError(
  showToast: ReturnType<typeof useToast>["showToast"],
  error: unknown,
  title: string,
): void {
  showToast({
    title,
    description: getErrorMessage(error, "請稍後再試。"),
    variant: "error",
  });
}
