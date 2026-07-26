import type {
  ReviewReportInput,
  ReviewReportReason,
} from "@/features/reviews/types";
import { isUuid } from "@/lib/validation";

export const MAX_REVIEW_REPORT_DETAILS_LENGTH = 200;

export const REVIEW_REPORT_REASON_OPTIONS: readonly {
  label: string;
  value: ReviewReportReason;
}[] = [
  { value: "spam", label: "垃圾內容或廣告" },
  { value: "harassment", label: "騷擾或仇恨內容" },
  { value: "inappropriate", label: "不當或冒犯內容" },
  { value: "false_information", label: "疑似不實資訊" },
  { value: "other", label: "其他原因" },
];

const REVIEW_REPORT_REASONS = new Set<ReviewReportReason>(
  REVIEW_REPORT_REASON_OPTIONS.map((option) => option.value),
);

export function parseReviewReportInput(
  value: unknown,
): ReviewReportInput | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const input = value as Record<string, unknown>;

  if (
    typeof input.reviewId !== "string" ||
    !isUuid(input.reviewId) ||
    !isReviewReportReason(input.reason) ||
    (input.details !== undefined &&
      input.details !== null &&
      typeof input.details !== "string")
  ) {
    return null;
  }

  const details = typeof input.details === "string" ? input.details.trim() : "";

  if (details.length > MAX_REVIEW_REPORT_DETAILS_LENGTH) {
    return null;
  }

  return {
    reviewId: input.reviewId,
    reason: input.reason,
    details: details || null,
  };
}

function isReviewReportReason(value: unknown): value is ReviewReportReason {
  return (
    typeof value === "string" &&
    REVIEW_REPORT_REASONS.has(value as ReviewReportReason)
  );
}
