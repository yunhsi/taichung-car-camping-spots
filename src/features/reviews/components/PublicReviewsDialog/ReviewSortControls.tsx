import { Button } from "@/components/ui/Button";
import type { ReviewSort } from "@/features/reviews/types";

interface ReviewSortControlsProps {
  onSortChange: (sort: ReviewSort) => void;
  sort: ReviewSort;
}

const SORT_OPTIONS: readonly { label: string; value: ReviewSort }[] = [
  { label: "最新", value: "latest" },
  { label: "最高", value: "highest" },
  { label: "最低", value: "lowest" },
];

export function ReviewSortControls({
  onSortChange,
  sort,
}: ReviewSortControlsProps) {
  return (
    <div
      role="group"
      aria-label="評論排序"
      className="flex items-center justify-end gap-1"
    >
      <span className="mr-1 text-xs text-muted-foreground">排序</span>
      {SORT_OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="xs"
          variant={sort === option.value ? "secondary" : "ghost"}
          aria-pressed={sort === option.value}
          onClick={() => onSortChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
