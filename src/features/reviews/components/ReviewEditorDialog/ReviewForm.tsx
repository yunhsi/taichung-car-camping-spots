"use client";

import { type SubmitEvent, useRef, useState } from "react";

import { Star } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { DialogClose } from "@/components/ui/Dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { useUserData } from "@/features/user/components/UserDataProvider";
import {
  containsInappropriateReviewContent,
  INAPPROPRIATE_REVIEW_COMMENT_MESSAGE,
  MAX_REVIEW_COMMENT_LENGTH,
  REVIEW_RATING_VALUES,
} from "@/features/reviews/lib/reviewValidation";
import type {
  AttractionReview,
  ReviewRating,
} from "@/features/reviews/types";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

import { ReviewDeleteConfirmation } from "./ReviewDeleteConfirmation";

interface ReviewFormProps {
  formId: string;
  attractionId: string;
  existingReview: AttractionReview | undefined;
  onSuccess: (message: string) => void;
}

interface ReviewFormError {
  field: "rating" | "comment";
  message: string;
}

type ReviewMutation = "delete" | "save" | null;

export function ReviewForm({
  formId,
  attractionId,
  existingReview,
  onSuccess,
}: ReviewFormProps) {
  const { showToast } = useToast();
  const { createReview, deleteReview, updateReview } = useUserData();
  const mutationLockRef = useRef(false);
  const [rating, setRating] = useState<ReviewRating | 0>(
    existingReview?.rating ?? 0,
  );
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [formError, setFormError] = useState<ReviewFormError | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [pendingMutation, setPendingMutation] =
    useState<ReviewMutation>(null);
  const submitLabel =
    pendingMutation === "save"
      ? existingReview
        ? "更新中…"
        : "送出中…"
      : existingReview
        ? "更新評論"
        : "送出評論";

  async function handleDelete() {
    if (mutationLockRef.current) {
      return;
    }

    mutationLockRef.current = true;
    setPendingMutation("delete");

    try {
      await deleteReview(attractionId);
      onSuccess("已成功刪除。");
    } catch (error) {
      const message = getErrorMessage(
        error,
        "評論刪除失敗，請稍後再試。",
      );
      showToast({
        title: "刪除失敗",
        description: message,
        variant: "error",
      });
      setIsConfirmingDelete(false);
    } finally {
      mutationLockRef.current = false;
      setPendingMutation(null);
    }
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (rating === 0) {
      const message = "請先選擇 1 到 5 顆星。";
      setFormError({ field: "rating", message });
      return;
    }

    if (!comment.trim()) {
      const message = "請填寫評論內容。";
      setFormError({ field: "comment", message });
      return;
    }

    if (containsInappropriateReviewContent(comment)) {
      setFormError({
        field: "comment",
        message: INAPPROPRIATE_REVIEW_COMMENT_MESSAGE,
      });
      return;
    }

    if (mutationLockRef.current) {
      return;
    }

    mutationLockRef.current = true;
    setPendingMutation("save");

    try {
      if (existingReview) {
        await updateReview(attractionId, rating, comment);
      } else {
        await createReview(attractionId, rating, comment);
      }
      onSuccess(existingReview ? "已成功更新。" : "已成功送出。");
    } catch (error) {
      const message = getErrorMessage(
        error,
        "評論送出失敗，請稍後再試。",
      );
      showToast({
        title: existingReview ? "更新失敗" : "新增失敗",
        description: message,
        variant: "error",
      });
    } finally {
      mutationLockRef.current = false;
      setPendingMutation(null);
    }
  }

  function handleRatingChange(nextRating: ReviewRating) {
    setRating(nextRating);
    setFormError(null);
  }

  function handleCommentChange(nextComment: string) {
    setComment(nextComment);
    setFormError(null);
  }

  function startDeleteConfirmation() {
    setIsConfirmingDelete(true);
  }

  function cancelDeleteConfirmation() {
    setIsConfirmingDelete(false);
  }

  return (
    <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
      <FieldSet
        disabled={pendingMutation !== null}
        aria-describedby={
          formError?.field === "rating"
            ? `${formId}-rating-error`
            : undefined
        }
      >
        <FieldLegend>星等</FieldLegend>
        <div className="flex gap-1">
          {REVIEW_RATING_VALUES.map((starValue) => (
            <label
              key={starValue}
              className="rounded-md p-1 text-highlight outline-none hover:bg-highlight-soft has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/30"
            >
              <input
                type="radio"
                name={`${formId}-rating`}
                value={starValue}
                checked={rating === starValue}
                aria-label={`${starValue} 顆星`}
                className="sr-only"
                onChange={() => handleRatingChange(starValue)}
              />
              <Star
                aria-hidden="true"
                className={cn(
                  "pointer-events-none size-8",
                  starValue <= rating && "fill-current",
                )}
              />
            </label>
          ))}
        </div>
        {formError?.field === "rating" && (
          <FieldError id={`${formId}-rating-error`}>
            {formError.message}
          </FieldError>
        )}
      </FieldSet>

      <Field>
        <FieldLabel htmlFor={`${formId}-comment`}>
          留言評論
        </FieldLabel>
        <Textarea
          id={`${formId}-comment`}
          value={comment}
          rows={5}
          maxLength={MAX_REVIEW_COMMENT_LENGTH}
          placeholder="留下停車、環境或過夜體驗…"
          aria-invalid={formError?.field === "comment" || undefined}
          aria-describedby={`${formId}-comment-count${
            formError?.field === "comment" ? ` ${formId}-comment-error` : ""
          }`}
          disabled={pendingMutation !== null}
          onChange={(event) => handleCommentChange(event.target.value)}
        />
        <FieldDescription id={`${formId}-comment-count`} className="text-right">
          {comment.length} / {MAX_REVIEW_COMMENT_LENGTH}
        </FieldDescription>
        {formError?.field === "comment" && (
          <FieldError id={`${formId}-comment-error`}>
            {formError.message}
          </FieldError>
        )}
      </Field>

      {isConfirmingDelete ? (
        <ReviewDeleteConfirmation
          isDeleting={pendingMutation === "delete"}
          onCancel={cancelDeleteConfirmation}
          onConfirm={handleDelete}
        />
      ) : (
        <div className="flex flex-wrap justify-between gap-3">
          {existingReview ? (
            <Button
              type="button"
              variant="destructive"
              disabled={pendingMutation !== null}
              onClick={startDeleteConfirmation}
            >
              刪除評論
            </Button>
          ) : null}
          <div className="ml-auto flex gap-3">
            <DialogClose
              render={
                <Button
                  variant="outline"
                  disabled={pendingMutation !== null}
                />
              }
            >
              取消
            </DialogClose>
            <Button
              type="submit"
              aria-busy={pendingMutation === "save"}
              disabled={pendingMutation !== null}
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
