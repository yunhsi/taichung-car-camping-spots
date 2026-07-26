"use client";

import { useId } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/Dialog";
import type { ReviewTarget } from "@/features/reviews/types";
import { useOwnAttractionReview } from "@/features/reviews/useAttractionReviews";

import { ReviewForm } from "./ReviewForm";

interface ReviewEditorDialogProps {
  isOpen: boolean;
  target: ReviewTarget | null;
  onCloseAutoFocus: () => void;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: (message: string) => void;
}

export function ReviewEditorDialog({
  isOpen,
  target,
  onCloseAutoFocus,
  onOpenChange,
  onSuccess,
}: ReviewEditorDialogProps) {
  const formId = useId();
  const { review, status } = useOwnAttractionReview(
    target?.attractionId ?? "",
  );

  return (
    <Dialog open={isOpen && target !== null} onOpenChange={onOpenChange}>
      {target ? (
        <DialogContent
          data-review-dialog
          aria-describedby={`${formId}-description`}
          className="max-w-md p-6"
          finalFocus={() => {
            onCloseAutoFocus();
            return false;
          }}
        >
          <DialogTitle className="pr-8 text-xl">
            {status === "loaded"
              ? `${review ? "修改" : "新增"}「${target.attractionName}」的評分`
              : `載入「${target.attractionName}」的評論`}
          </DialogTitle>
          <DialogDescription id={`${formId}-description`} className="mt-2">
            {status === "loaded"
              ? "選擇星等並留下這次造訪的心得。"
              : "正在確認你是否已留下評論。"}
          </DialogDescription>

          {status === "loaded" ? (
            <ReviewForm
              formId={formId}
              attractionId={target.attractionId}
              existingReview={review}
              onSuccess={onSuccess}
            />
          ) : (
            <p
              role={status === "error" ? "alert" : "status"}
              className="mt-6 text-sm text-muted-foreground"
            >
              {status === "error"
                ? "暫時無法確認你的評論，請重新整理後再試。"
                : "正在載入我的評論…"}
            </p>
          )}
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
