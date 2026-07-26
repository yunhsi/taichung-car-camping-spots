"use client";

import { useEffect, useRef, useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { fetchAttraction } from "@/features/attractions/data/attractionApi";
import type { AttractionDetail } from "@/features/attractions/types";
import { useAttractionReviewSummary } from "@/features/reviews/useAttractionReviews";
import { getErrorMessage } from "@/lib/errors";

import { AttractionDialogContent } from "./AttractionDialogContent";
import { AttractionDialogFooter } from "./AttractionDialogFooter";
import { AttractionDialogHeader } from "./AttractionDialogHeader";

interface AttractionDialogProps {
  attractionId: string | null;
  isOpen: boolean;
  currentPosition: number;
  totalAttractions: number;
  previousAttractionName: string | null;
  nextAttractionName: string | null;
  onPrevious: () => void;
  onNext: () => void;
  onCloseAutoFocus: () => void;
  onOpenChange: (isOpen: boolean) => void;
  onOpenReviews: (
    attractionId: string,
    attractionName: string,
    trigger: HTMLButtonElement,
  ) => void;
}

export function AttractionDialog({
  attractionId,
  isOpen,
  currentPosition,
  totalAttractions,
  previousAttractionName,
  nextAttractionName,
  onPrevious,
  onNext,
  onCloseAutoFocus,
  onOpenChange,
  onOpenReviews,
}: AttractionDialogProps) {
  const { showToast } = useToast();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [detail, setDetail] = useState<AttractionDetail | null>(null);

  const activeDetail = detail?.id === attractionId ? detail : null;
  const { summary } = useAttractionReviewSummary(attractionId ?? "");

  useEffect(function resetScrollWhenAttractionChanges() {
    if (attractionId && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [attractionId]);

  useEffect(function enableKeyboardNavigation() {
    if (!isOpen) {
      return;
    }

    function handleNavigationKeyDown(event: globalThis.KeyboardEvent) {
      if (
        event.target instanceof Element &&
        event.target.closest("[data-review-dialog]")
      ) {
        return;
      }

      if (event.key === "ArrowLeft" && previousAttractionName) {
        event.preventDefault();
        onPrevious();
      }

      if (event.key === "ArrowRight" && nextAttractionName) {
        event.preventDefault();
        onNext();
      }
    }

    document.addEventListener("keydown", handleNavigationKeyDown);

    return () => {
      document.removeEventListener("keydown", handleNavigationKeyDown);
    };
  }, [
    isOpen,
    nextAttractionName,
    onNext,
    onPrevious,
    previousAttractionName,
  ]);

  useEffect(function loadSelectedAttractionDetail() {
    if (!isOpen || !attractionId || detail?.id === attractionId) {
      return;
    }

    let isCurrentSelection = true;

    void fetchAttraction(attractionId)
      .then((attractionDetail) => {
        if (!isCurrentSelection) {
          return;
        }

        setDetail(attractionDetail);
      })
      .catch((error: unknown) => {
        if (!isCurrentSelection) {
          return;
        }

        showToast({
          title: "景點載入失敗",
          description: getErrorMessage(
            error,
            "暫時無法取得景點詳細資訊。",
          ),
          variant: "error",
        });
        onOpenChange(false);
      });

    return () => {
      isCurrentSelection = false;
    };
  }, [attractionId, detail?.id, isOpen, onOpenChange, showToast]);

  return (
    <Dialog open={isOpen && attractionId !== null} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        scrollable
        className="max-w-2xl"
        finalFocus={() => {
          onCloseAutoFocus();
          return false;
        }}
      >
        <AttractionDialogHeader
          attraction={activeDetail}
          currentPosition={currentPosition}
          totalAttractions={totalAttractions}
          previousAttractionName={previousAttractionName}
          nextAttractionName={nextAttractionName}
          onPrevious={onPrevious}
          onNext={onNext}
        />

        <AttractionDialogContent
          attraction={activeDetail}
          contentRef={contentRef}
          reviewSummary={summary}
          onOpenReviews={onOpenReviews}
        />

        <AttractionDialogFooter
          googleMapsUrl={activeDetail?.googleMapsUrl ?? ""}
        />
      </DialogContent>
    </Dialog>
  );
}
