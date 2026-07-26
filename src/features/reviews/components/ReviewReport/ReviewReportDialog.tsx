"use client";

import { type FormEvent, useId, useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/Field";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { requestCreateReviewReport } from "@/features/reviews/data/reviewReportsApi";
import {
  MAX_REVIEW_REPORT_DETAILS_LENGTH,
  REVIEW_REPORT_REASON_OPTIONS,
} from "@/features/reviews/lib/reviewReportValidation";
import type {
  AttractionReview,
  ReviewReportReason,
} from "@/features/reviews/types";
import { getErrorMessage } from "@/lib/errors";

interface ReviewReportDialogProps {
  getTrigger: () => HTMLButtonElement | null;
  isOpen: boolean;
  review: AttractionReview;
  onOpenChange: (isOpen: boolean) => void;
}

export function ReviewReportDialog({
  getTrigger,
  isOpen,
  review,
  onOpenChange,
}: ReviewReportDialogProps) {
  const formId = useId();
  const { showToast } = useToast();
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState<ReviewReportReason>("spam");

  function handleOpenChange(nextIsOpen: boolean) {
    if (!nextIsOpen && isSubmitting) {
      return;
    }

    if (!nextIsOpen) {
      setDetails("");
      setError(null);
      setReason("spam");
    }

    onOpenChange(nextIsOpen);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await requestCreateReviewReport(review.id, reason, details);
      setIsSubmitting(false);
      handleOpenChange(false);
      showToast({
        title: "檢舉已送出",
        description: "謝謝你的回報，我們會保留這筆檢舉供後續處理。",
        variant: "success",
      });
    } catch (submitError: unknown) {
      setError(getErrorMessage(submitError, "檢舉送出失敗，請稍後再試。"));
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        data-review-report-dialog
        layer="nested"
        className="max-w-md p-6"
        aria-describedby={`${formId}-description`}
        finalFocus={getTrigger}
      >
        <DialogTitle className="pr-8 text-xl">檢舉這則評論</DialogTitle>
        <DialogDescription id={`${formId}-description`} className="mt-2">
          請選擇最符合的原因。檢舉不會立即移除評論。
        </DialogDescription>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <Field>
            <FieldLabel htmlFor={`${formId}-reason`}>檢舉原因</FieldLabel>
            <NativeSelect
              id={`${formId}-reason`}
              value={reason}
              disabled={isSubmitting}
              wrapperClassName="w-full"
              onChange={(event) =>
                setReason(event.currentTarget.value as ReviewReportReason)
              }
            >
              {REVIEW_REPORT_REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor={`${formId}-details`}>
              補充說明（選填）
            </FieldLabel>
            <Textarea
              id={`${formId}-details`}
              value={details}
              maxLength={MAX_REVIEW_REPORT_DETAILS_LENGTH}
              disabled={isSubmitting}
              placeholder="請勿填寫個人敏感資訊"
              onChange={(event) => setDetails(event.currentTarget.value)}
            />
            <FieldDescription>
              最多 {MAX_REVIEW_REPORT_DETAILS_LENGTH} 字
            </FieldDescription>
          </Field>

          {error ? <FieldError>{error}</FieldError> : null}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              variant="destructive"
              aria-busy={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "送出中…" : "送出檢舉"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
