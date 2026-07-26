import { NextResponse } from "next/server";

import { readUser } from "@/features/auth/lib/authenticatedUser";
import {
  createReviewReport,
  DuplicateReviewReportError,
  OwnReviewReportError,
  ReportedReviewNotFoundError,
} from "@/features/reviews/data/reviewReportsRepository";
import { parseReviewReportInput } from "@/features/reviews/lib/reviewReportValidation";
import { enforceUserRateLimit } from "@/features/security/lib/userRateLimit";
import { readJsonRequest } from "@/lib/apiRequest";

const RATE_LIMIT_WINDOW_MS = 60_000;
const REVIEW_REPORT_LIMIT = 10;

export async function POST(request: Request) {
  const user = await readUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimitResponse = await enforceUserRateLimit({
    action: "review-report",
    userId: user.id,
    limit: REVIEW_REPORT_LIMIT,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const input = parseReviewReportInput(await readJsonRequest(request));

  if (!input) {
    return NextResponse.json({ error: "Invalid report" }, { status: 400 });
  }

  try {
    await createReviewReport(user.id, input);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof DuplicateReviewReportError) {
      return NextResponse.json(
        { error: "Review already reported" },
        { status: 409 },
      );
    }

    if (error instanceof OwnReviewReportError) {
      return NextResponse.json(
        { error: "Cannot report own review" },
        { status: 403 },
      );
    }

    if (error instanceof ReportedReviewNotFoundError) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    throw error;
  }
}
