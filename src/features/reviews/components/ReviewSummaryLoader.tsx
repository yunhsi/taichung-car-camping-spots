"use client";

import { type ReactNode, useEffect } from "react";

import { useToast } from "@/components/ui/Toast";
import { fetchReviewSummaries } from "@/features/reviews/data/reviewsApi";
import { replaceReviewSummaries } from "@/features/reviews/data/reviewsStore";
import { getErrorMessage } from "@/lib/errors";

export function ReviewSummaryLoader({ children }: { children: ReactNode }) {
  const { showToast } = useToast();

  useEffect(() => {
    let isCancelled = false;

    void fetchReviewSummaries()
      .then((summaries) => {
        if (!isCancelled) {
          replaceReviewSummaries(summaries);
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          showToast({
            title: "評論摘要載入失敗",
            description: getErrorMessage(error, "請稍後再試。"),
            variant: "error",
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [showToast]);

  return children;
}
