"use client";

import { useEffect, useId, useRef, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/Dialog";
import type { AttractionDetail } from "@/features/attractions/types";
import { FavoriteButton } from "@/features/favorites/components/FavoriteButton";

interface AttractionDialogProps {
  attractionId: string | null;
  isOpen: boolean;
  currentPosition: number;
  totalAttractions: number;
  previousAttractionName: string | null;
  nextAttractionName: string | null;
  onPrevious: () => void;
  onNext: () => void;
  onCloseAutoFocus: () => void;
  onOpenChange: (isOpen: boolean) => void;
}

export function AttractionDialog({
  attractionId,
  isOpen,
  currentPosition,
  totalAttractions,
  previousAttractionName,
  nextAttractionName,
  onPrevious,
  onNext,
  onCloseAutoFocus,
  onOpenChange,
}: AttractionDialogProps) {
  const linksTitleId = useId();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [detail, setDetail] = useState<AttractionDetail | null>(null);
  const [loadError, setLoadError] = useState<{
    attractionId: string;
    message: string;
  } | null>(null);
  const [requestAttempt, setRequestAttempt] = useState(0);
  const activeDetail = detail?.id === attractionId ? detail : null;
  const errorMessage =
    loadError?.attractionId === attractionId ? loadError.message : "";

  useEffect(() => {
    if (attractionId && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [attractionId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleNavigationKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "ArrowLeft" && previousAttractionName) {
        event.preventDefault();
        onPrevious();
      }

      if (event.key === "ArrowRight" && nextAttractionName) {
        event.preventDefault();
        onNext();
      }
    }

    document.addEventListener("keydown", handleNavigationKeyDown);

    return () => {
      document.removeEventListener("keydown", handleNavigationKeyDown);
    };
  }, [
    isOpen,
    nextAttractionName,
    onNext,
    onPrevious,
    previousAttractionName,
  ]);

  useEffect(() => {
    if (!isOpen || !attractionId || detail?.id === attractionId) {
      return;
    }

    let isCancelled = false;

    import("@/features/attractions/data/attractionDetails")
      .then(({ getAttractionDetailById }) => {
        const attractionDetail = getAttractionDetailById(attractionId);

        if (!attractionDetail) {
          throw new Error("景點詳細資料不完整。");
        }

        if (isCancelled) {
          return;
        }

        setDetail(attractionDetail);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return;
        }

        setLoadError({
          attractionId,
          message:
            error instanceof Error
              ? error.message
              : "暫時無法取得景點詳細資訊。",
        });
      });

    return () => {
      isCancelled = true;
    };
  }, [attractionId, detail?.id, isOpen, requestAttempt]);

  return (
    <Dialog open={isOpen && attractionId !== null} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="flex h-[calc(100dvh-2rem)] max-w-2xl flex-col overflow-hidden p-0"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onCloseAutoFocus();
        }}
      >
        <header className="relative shrink-0 rounded-t-2xl border-b border-border bg-linear-to-r from-primary-soft to-surface px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="mb-1 text-sm font-semibold tracking-wide text-accent-strong">
                景點詳細資訊
                {currentPosition > 0 && totalAttractions > 0 && (
                  <span className="ml-2 text-muted">
                    {currentPosition} / {totalAttractions}
                  </span>
                )}
              </p>
              <DialogTitle className="text-2xl">
                {activeDetail?.name ?? "載入中…"}
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

              {activeDetail && attractionId && (
                <FavoriteButton
                  attractionId={attractionId}
                  attractionName={activeDetail.name}
                  className="static"
                />
              )}
            </div>
          </div>
        </header>

        <div
          ref={contentRef}
          className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-6"
        >
          {activeDetail ? (
            <>
              <DetailSection
                title="介紹內容"
                content={activeDetail.description}
              />

              <DetailSection
                title="停車資訊"
                content={activeDetail.parkingInformation}
              />

              <section aria-labelledby={linksTitleId}>
                <h3
                  id={linksTitleId}
                  className="mb-3 text-lg font-semibold text-foreground"
                >
                  相關連結
                </h3>
                <div className="flex flex-wrap gap-3">
                  <ExternalLink
                    label="官方網站"
                    url={activeDetail.officialWebsiteUrl}
                  />
                  <ExternalLink
                    label="粉絲專頁"
                    url={activeDetail.fanPageUrl}
                  />
                </div>
              </section>

              <DetailSection
                title="旅遊叮嚀"
                content={activeDetail.travelTips}
              />
            </>
          ) : errorMessage ? (
            <div role="alert" className="py-10 text-center">
              <p className="text-sm text-danger">{errorMessage}</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => {
                  setLoadError(null);
                  setRequestAttempt((attempt) => attempt + 1);
                }}
              >
                重新載入
              </Button>
            </div>
          ) : (
            <p role="status" className="py-10 text-center text-sm text-muted">
              正在載入景點詳細資訊…
            </p>
          )}
        </div>

        <footer className="flex shrink-0 flex-col gap-3 rounded-b-2xl border-t border-border bg-surface-elevated px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <DialogClose asChild>
              <Button variant="outline">關閉</Button>
            </DialogClose>
            {activeDetail?.googleMapsUrl && (
              <Button asChild>
                <a
                  href={activeDetail.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  在 Google 地圖查看
                  <span aria-hidden="true">↗</span>
                </a>
              </Button>
            )}
          </div>
        </footer>

      </DialogContent>
    </Dialog>
  );
}

interface DetailSectionProps {
  title: string;
  content: string;
}

function DetailSection({ title, content }: DetailSectionProps) {
  return (
    <section>
      <h3 className="mb-3 text-lg font-semibold text-foreground">{title}</h3>
      <p className="whitespace-pre-line text-sm leading-7 text-foreground">
        {content || "未提供"}
      </p>
    </section>
  );
}

interface ExternalLinkProps {
  label: string;
  url: string;
}

function ExternalLink({ label, url }: ExternalLinkProps) {
  if (!url) {
    return (
      <p className="rounded-lg border border-border bg-surface-elevated px-4 py-2 text-sm text-muted">
        {label}：未提供
      </p>
    );
  }

  return (
    <Button asChild variant="outline">
      <a href={url} target="_blank" rel="noreferrer">
        {label}
        <span aria-hidden="true">↗</span>
      </a>
    </Button>
  );
}
