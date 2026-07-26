import { LoaderCircle } from "lucide-react";

import { NativeSelect } from "@/components/ui/NativeSelect";
import type { AttractionSortMode } from "@/features/attractions/types";

import { AttractionSelectionCriteriaDialog } from "./AttractionSelectionCriteriaDialog";

interface AttractionListToolbarProps {
  attractionCount: number;
  isLocating: boolean;
  sortMode: AttractionSortMode;
  onSortChange: (sortMode: AttractionSortMode) => void;
}

export function AttractionListToolbar({
  attractionCount,
  isLocating,
  sortMode,
  onSortChange,
}: AttractionListToolbarProps) {
  return (
    <div className="mb-6 flex flex-nowrap items-center justify-between gap-2">
      <AttractionSelectionCriteriaDialog />

      <div className="flex shrink-0 flex-nowrap items-center justify-end gap-2">
        <div>
          <label htmlFor="attraction-sort" className="sr-only">
            排序方式
          </label>
          <NativeSelect
            id="attraction-sort"
            value={sortMode}
            disabled={isLocating}
            onChange={(event) => {
              onSortChange(event.target.value as AttractionSortMode);
            }}
            className={isLocating ? "cursor-wait" : undefined}
            icon={
              isLocating ? (
                <LoaderCircle className="animate-spin" />
              ) : undefined
            }
          >
            <option value="distance">依距離</option>
            <option value="township">依行政區</option>
          </NativeSelect>
        </div>
        <p className="rounded-full bg-highlight-soft px-3 py-1 text-sm font-medium text-highlight-strong">
          共 {attractionCount} 筆
        </p>
      </div>
    </div>
  );
}
