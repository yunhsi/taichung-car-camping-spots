import { Flag } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useReviewReport } from "@/features/reviews/components/ReviewReport/ReviewReportProvider";
import type { AttractionReview } from "@/features/reviews/types";
import { useUserData } from "@/features/user/components/UserDataProvider";

interface ReviewReportButtonProps {
  review: AttractionReview;
}

export function ReviewReportButton({ review }: ReviewReportButtonProps) {
  const { user } = useUserData();
  const { openReport } = useReviewReport();

  if (!user || user.id === review.author.id) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      className="text-muted-foreground"
      aria-label={`檢舉 ${review.author.name ?? "匿名旅人"} 的評論`}
      onClick={(event) => openReport(review, event.currentTarget)}
    >
      <Flag aria-hidden="true" />
      檢舉
    </Button>
  );
}
