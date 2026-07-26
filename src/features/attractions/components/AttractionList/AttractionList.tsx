"use client";

import { useCallback, useRef, useState } from "react";

import { useToast } from "@/components/ui/Toast";
import { AttractionDialog } from "@/features/attractions/components/AttractionDialog/AttractionDialog";
import type { AttractionListItem } from "@/features/attractions/types";
import { useAttractionDialogHistory } from "@/features/attractions/useAttractionDialogHistory";
import { useAttractionListSort } from "@/features/attractions/useAttractionListSort";
import { PublicReviewsDialog } from "@/features/reviews/components/PublicReviewsDialog/PublicReviewsDialog";
import { ReviewEditorDialog } from "@/features/reviews/components/ReviewEditorDialog/ReviewEditorDialog";
import type { ReviewTarget } from "@/features/reviews/types";

import { AttractionListToolbar } from "../AttractionListToolbar/AttractionListToolbar";
import { AttractionCard } from "./AttractionCard";

interface AttractionListProps {
  attractions: AttractionListItem[];
  initialAttractionId?: string | null;
}

export function AttractionList({
  attractions,
  initialAttractionId = null,
}: AttractionListProps) {
  const { showToast } = useToast();
  const {
    isLocating,
    sortedAttractions,
    sortMode,
    changeSortMode,
  } = useAttractionListSort(attractions);
  const {
    currentPosition,
    nextAttraction,
    previousAttraction,
    selectedAttractionId,
    closeDialog,
    openDialog,
    restoreTriggerFocus,
    showNextAttraction,
    showPreviousAttraction,
  } = useAttractionDialogHistory(
    sortedAttractions,
    initialAttractionId,
  );
  const [publicReviewsTarget, setPublicReviewsTarget] =
    useState<ReviewTarget | null>(null);
  const [isPublicReviewsOpen, setIsPublicReviewsOpen] = useState(false);
  const [reviewEditorTarget, setReviewEditorTarget] =
    useState<ReviewTarget | null>(null);
  const [isReviewEditorOpen, setIsReviewEditorOpen] = useState(false);
  const publicReviewsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const reviewEditorTriggerRef = useRef<HTMLButtonElement | null>(null);

  const openPublicReviews = useCallback(
    (
      attractionId: string,
      attractionName: string,
      trigger: HTMLButtonElement,
    ) => {
      publicReviewsTriggerRef.current = trigger;
      setPublicReviewsTarget({ attractionId, attractionName });
      setIsPublicReviewsOpen(true);
    },
    [],
  );

  const openReviewEditor = useCallback(
    (
      attractionId: string,
      attractionName: string,
      trigger: HTMLButtonElement,
    ) => {
      reviewEditorTriggerRef.current = trigger;
      setReviewEditorTarget({ attractionId, attractionName });
      setIsReviewEditorOpen(true);
    },
    [],
  );

  const restorePublicReviewsTriggerFocus = useCallback(() => {
    publicReviewsTriggerRef.current?.focus({ preventScroll: true });
    publicReviewsTriggerRef.current = null;
    setPublicReviewsTarget(null);
  }, []);

  const restoreReviewEditorTriggerFocus = useCallback(() => {
    reviewEditorTriggerRef.current?.focus({ preventScroll: true });
    reviewEditorTriggerRef.current = null;
    setReviewEditorTarget(null);
  }, []);

  const handleReviewEditorSuccess = useCallback((message: string) => {
    showToast({ title: message, variant: "success" });
    setIsReviewEditorOpen(false);
  }, [showToast]);

  const handleAttractionDialogOpenChange = useCallback(
    (nextIsOpen: boolean) => {
      if (!nextIsOpen) {
        closeDialog();
      }
    },
    [closeDialog],
  );

  return (
    <>
      <AttractionListToolbar
        attractionCount={sortedAttractions.length}
        isLocating={isLocating}
        sortMode={sortMode}
        onSortChange={changeSortMode}
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sortedAttractions.map((attraction) => (
          <AttractionCard
            key={attraction.id}
            {...attraction}
            onOpenDetails={openDialog}
            onOpenReviews={openPublicReviews}
          />
        ))}
      </div>

      <AttractionDialog
        attractionId={selectedAttractionId}
        isOpen={selectedAttractionId !== null}
        currentPosition={currentPosition}
        totalAttractions={sortedAttractions.length}
        previousAttractionName={previousAttraction?.name ?? null}
        nextAttractionName={nextAttraction?.name ?? null}
        onPrevious={showPreviousAttraction}
        onNext={showNextAttraction}
        onCloseAutoFocus={restoreTriggerFocus}
        onOpenChange={handleAttractionDialogOpenChange}
        onOpenReviews={openPublicReviews}
      />

      <PublicReviewsDialog
        isOpen={isPublicReviewsOpen}
        target={publicReviewsTarget}
        onCloseAutoFocus={restorePublicReviewsTriggerFocus}
        onOpenChange={setIsPublicReviewsOpen}
        onOpenEditor={openReviewEditor}
      />

      <ReviewEditorDialog
        isOpen={isReviewEditorOpen}
        target={reviewEditorTarget}
        onCloseAutoFocus={restoreReviewEditorTriggerFocus}
        onOpenChange={setIsReviewEditorOpen}
        onSuccess={handleReviewEditorSuccess}
      />
    </>
  );
}
