import { Button } from "@/components/ui/Button";

interface ReviewDeleteConfirmationProps {
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ReviewDeleteConfirmation({
  isDeleting,
  onCancel,
  onConfirm,
}: ReviewDeleteConfirmationProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/40 bg-muted p-4"
    >
      <p className="text-sm font-semibold text-foreground">
        確定要刪除這則評論嗎？
      </p>
      <p className="mt-1 text-sm text-muted-foreground">刪除後無法復原。</p>
      <div className="mt-4 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isDeleting}
          onClick={onCancel}
        >
          保留評論
        </Button>
        <Button
          type="button"
          variant="destructive"
          aria-busy={isDeleting}
          disabled={isDeleting}
          onClick={onConfirm}
        >
          {isDeleting ? "刪除中…" : "確定刪除"}
        </Button>
      </div>
    </div>
  );
}
