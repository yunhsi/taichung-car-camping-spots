"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import type { ReviewTarget } from "@/features/reviews/types";
import {
  useAttractionReviews,
  useOwnAttractionReview,
} from "@/features/reviews/useAttractionReviews";
import { useUserData } from "@/features/user/components/UserDataProvider";

import { PublicReviewsContent } from "./PublicReviewsContent";

interface PublicReviewsDialogProps {
  isOpen: boolean;
  target: ReviewTarget | null;
  onCloseAutoFocus: () => void;
  onOpenChange: (isOpen: boolean) => void;
  onOpenEditor: (
    attractionId: string,
    attractionName: string,
    trigger: HTMLButtonElement,
  ) => void;
}

export function PublicReviewsDialog({
  isOpen,
  target,
  onCloseAutoFocus,
  onOpenChange,
  onOpenEditor,
}: PublicReviewsDialogProps) {
  const { canEditUserData } = useUserData();
  const { reload, reviews, status } = useAttractionReviews(
    target?.attractionId ?? "",
    isOpen && target !== null,
  );
  const { review: ownReview, status: ownReviewsStatus } = useOwnAttractionReview(
    target?.attractionId ?? "",
  );

  return (
    <Dialog open={isOpen && target !== null} onOpenChange={onOpenChange}>
      {target ? (
        <DialogContent
          data-review-dialog
          aria-describedby={undefined}
          scrollable
          showCloseButton
          className="max-w-2xl"
          finalFocus={() => {
            onCloseAutoFocus();
            return false;
          }}
        >
          <header className="border-b border-border bg-secondary/50 px-6 py-5 pr-14">
            <DialogTitle className="text-xl">
              「{target.attractionName}」評分與評論
            </DialogTitle>
            <DialogDescription className="mt-1">
              查看旅人評分與所有公開評論。
            </DialogDescription>
          </header>

          <div className="min-h-0 overflow-y-auto px-6 py-5">
            {status === "loaded" ? (
              <PublicReviewsContent
                attractionName={target.attractionName}
                canReview={canEditUserData}
                hasOwnReview={Boolean(ownReview)}
                isOwnReviewLoaded={ownReviewsStatus === "loaded"}
                reviews={reviews}
                onOpenReview={(trigger) =>
                  onOpenEditor(
                    target.attractionId,
                    target.attractionName,
                    trigger,
                  )
                }
              />
            ) : status === "error" ? (
              <div role="alert" className="py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  暫時無法取得評論。
                </p>
                <Button
                  type="button"
                  variant="link"
                  className="mt-3"
                  onClick={reload}
                >
                  重新載入
                </Button>
              </div>
            ) : (
              <p role="status" className="py-10 text-center text-sm text-muted-foreground">
                正在載入評論…
              </p>
            )}
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
