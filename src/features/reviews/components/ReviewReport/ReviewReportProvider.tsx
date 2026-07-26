"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { ReviewReportDialog } from "@/features/reviews/components/ReviewReport/ReviewReportDialog";
import type { AttractionReview } from "@/features/reviews/types";

interface ReviewReportContextValue {
  openReport: (review: AttractionReview, trigger: HTMLButtonElement) => void;
}

interface ReviewReportProviderProps {
  children: ReactNode;
}

const ReviewReportContext = createContext<ReviewReportContextValue | null>(null);

export function ReviewReportProvider({ children }: ReviewReportProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReview, setSelectedReview] =
    useState<AttractionReview | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const getTrigger = useCallback(() => triggerRef.current, []);
  const openReport = useCallback(
    (review: AttractionReview, trigger: HTMLButtonElement) => {
      triggerRef.current = trigger;
      setSelectedReview(review);
      setIsOpen(true);
    },
    [],
  );
  const contextValue = useMemo(() => ({ openReport }), [openReport]);

  return (
    <ReviewReportContext.Provider value={contextValue}>
      {children}
      {selectedReview ? (
        <ReviewReportDialog
          getTrigger={getTrigger}
          isOpen={isOpen}
          review={selectedReview}
          onOpenChange={setIsOpen}
        />
      ) : null}
    </ReviewReportContext.Provider>
  );
}

export function useReviewReport(): ReviewReportContextValue {
  const context = useContext(ReviewReportContext);

  if (!context) {
    throw new Error("ReviewReportButton 必須放在 ReviewReportProvider 內。");
  }

  return context;
}
