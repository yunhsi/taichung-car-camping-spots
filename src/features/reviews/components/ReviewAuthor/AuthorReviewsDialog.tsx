import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/Dialog";
import { AuthorReviewList } from "@/features/reviews/components/ReviewAuthor/AuthorReviewList";
import { ReviewAuthorImage } from "@/features/reviews/components/ReviewAuthor/ReviewAuthorAvatar";
import type { ReviewAuthor } from "@/features/reviews/types";
import { useAuthorReviews } from "@/features/reviews/useAuthorReviews";

interface AuthorReviewsDialogProps {
  author: ReviewAuthor | null;
  getTrigger: () => HTMLButtonElement | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AuthorReviewsDialog({
  author,
  getTrigger,
  isOpen,
  onOpenChange,
}: AuthorReviewsDialogProps) {
  const authorReviews = useAuthorReviews(author?.id ?? "", isOpen);

  if (!author) {
    return null;
  }

  const name = author.name ?? "匿名旅人";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        data-author-reviews-dialog
        layer="nested"
        scrollable
        showCloseButton
        finalFocus={getTrigger}
      >
        <header className="flex min-w-0 items-center gap-3 border-b border-border bg-secondary/50 p-5 pr-14">
          <ReviewAuthorImage
            image={author.image}
            name={name}
            size="large"
          />
          <div className="min-w-0">
            <DialogTitle className="truncate text-lg text-foreground">
              {name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              查看{name}在所有景點留下的公開評論。
            </DialogDescription>
            <p className="mt-0.5 text-xs text-muted-foreground" aria-live="polite">
              {authorReviews.status === "loaded"
                ? authorReviews.hasMore
                  ? `已載入 ${authorReviews.reviews.length} 則公開評論`
                  : `共 ${authorReviews.reviews.length} 則公開評論`
                : "旅人的公開評論"}
            </p>
          </div>
        </header>
        <div className="min-h-0 overflow-y-auto">
          <AuthorReviewList
            hasMore={authorReviews.hasMore}
            isLoadingMore={authorReviews.isLoadingMore}
            loadMoreFailed={authorReviews.loadMoreFailed}
            name={name}
            reviews={authorReviews.reviews}
            status={authorReviews.status}
            onLoadMore={authorReviews.loadMore}
            onRetry={authorReviews.retry}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
