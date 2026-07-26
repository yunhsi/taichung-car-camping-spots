import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { DialogTitle } from "@/components/ui/Dialog";
import type { AttractionDetail } from "@/features/attractions/types";
import { FavoriteToggleButton } from "@/features/favorites/components/FavoriteToggleButton";

interface AttractionDialogHeaderProps {
  attraction: AttractionDetail | null;
  currentPosition: number;
  totalAttractions: number;
  previousAttractionName: string | null;
  nextAttractionName: string | null;
  onPrevious: () => void;
  onNext: () => void;
}

export function AttractionDialogHeader({
  attraction,
  currentPosition,
  totalAttractions,
  previousAttractionName,
  nextAttractionName,
  onPrevious,
  onNext,
}: AttractionDialogHeaderProps) {
  return (
    <header className="relative shrink-0 rounded-t-2xl border-b border-border bg-linear-to-r from-secondary to-card px-6 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="mb-1 text-sm font-semibold tracking-wide text-highlight-strong">
            景點詳細資訊
            {currentPosition > 0 && totalAttractions > 0 && (
              <span className="ml-2 text-muted-foreground">
                {currentPosition} / {totalAttractions}
              </span>
            )}
          </p>
          <DialogTitle className="text-2xl">
            {attraction?.name ?? "載入中…"}
          </DialogTitle>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <nav aria-label="切換景點" className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={!previousAttractionName}
              aria-label={
                previousAttractionName
                  ? `上一個景點：${previousAttractionName}`
                  : "已是第一個景點"
              }
              onClick={onPrevious}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={!nextAttractionName}
              aria-label={
                nextAttractionName
                  ? `下一個景點：${nextAttractionName}`
                  : "已是最後一個景點"
              }
              onClick={onNext}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </nav>

          {attraction && (
            <FavoriteToggleButton
              attractionId={attraction.id}
              attractionName={attraction.name}
              className="static"
            />
          )}
        </div>
      </div>
    </header>
  );
}
