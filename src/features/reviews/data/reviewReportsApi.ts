import type {
  ReviewReportInput,
  ReviewReportReason,
} from "@/features/reviews/types";

const REVIEW_REPORTS_API_URL = "/api/review-reports";

export async function requestCreateReviewReport(
  reviewId: string,
  reason: ReviewReportReason,
  details: string,
): Promise<void> {
  const input: ReviewReportInput = {
    reviewId,
    reason,
    details: details.trim() || null,
  };
  const response = await fetch(REVIEW_REPORTS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (response.ok) {
    return;
  }

  if (response.status === 401) {
    throw new Error("請先登入再檢舉評論。");
  }

  if (response.status === 409) {
    throw new Error("你已檢舉過這則評論。");
  }

  if (response.status === 429) {
    throw new Error("檢舉操作太頻繁，請稍後再試。");
  }

  throw new Error("檢舉送出失敗，請稍後再試。");
}
