"use client";

import { useSyncExternalStore } from "react";

import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

const MOBILE_SCROLL_THRESHOLD = 100;
const DESKTOP_SCROLL_THRESHOLD = 400;
const DESKTOP_BREAKPOINT = 640;
const SCROLL_END_DELAY = 150;

const VISIBLE_CLASSES =
  "translate-y-0 opacity-100 transition-[transform_1500ms_cubic-bezier(0.16,1,0.3,1),opacity_450ms_ease-out]";
const HIDDEN_CLASSES =
  "pointer-events-none translate-y-[calc(100%+2.5rem+env(safe-area-inset-bottom))] opacity-0 transition-[transform_1200ms_cubic-bezier(0.4,0,1,1),opacity_300ms_ease-in_450ms]";
const BUTTON_CLASSES =
  "size-12 rounded-full border-border/80 bg-surface/90 text-foreground shadow-[0_8px_24px_rgb(0_0_0/0.12)] backdrop-blur-md transition-[transform,box-shadow,border-color] duration-300 hover:border-foreground/25 hover:bg-surface hover:shadow-[0_12px_28px_rgb(0_0_0/0.16)] active:scale-95 motion-reduce:transform-none motion-reduce:transition-none";

let isMobileScrolling = false;

function subscribeToViewport(onStoreChange: () => void) {
  let scrollEndTimer: ReturnType<typeof setTimeout> | undefined;

  function handleScroll() {
    if (window.innerWidth >= DESKTOP_BREAKPOINT) {
      onStoreChange();
      return;
    }

    isMobileScrolling = true;
    onStoreChange();
    clearTimeout(scrollEndTimer);

    scrollEndTimer = setTimeout(() => {
      isMobileScrolling = false;
      onStoreChange();
    }, SCROLL_END_DELAY);
  }

  function handleResize() {
    if (window.innerWidth >= DESKTOP_BREAKPOINT) {
      isMobileScrolling = false;
      clearTimeout(scrollEndTimer);
    }

    onStoreChange();
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleResize);
    clearTimeout(scrollEndTimer);
    isMobileScrolling = false;
  };
}

function getVisibilitySnapshot(): boolean {
  const isMobile = window.innerWidth < DESKTOP_BREAKPOINT;
  const scrollThreshold = isMobile
    ? MOBILE_SCROLL_THRESHOLD
    : DESKTOP_SCROLL_THRESHOLD;

  return (
    window.scrollY >= scrollThreshold && (!isMobile || !isMobileScrolling)
  );
}

export function GoToTopButton() {
  const isVisible = useSyncExternalStore(
    subscribeToViewport,
    getVisibilitySnapshot,
    () => false,
  );

  function scrollToTop() {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <div
      aria-hidden={!isVisible}
      className={cn(
        "fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-40 motion-reduce:transition-none sm:right-8 sm:bottom-8",
        isVisible ? VISIBLE_CLASSES : HIDDEN_CLASSES,
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollToTop}
            aria-label="回到頁面頂端"
            tabIndex={isVisible ? undefined : -1}
            className={BUTTON_CLASSES}
          >
            <ArrowUp
              aria-hidden="true"
              strokeWidth="2.25"
              className="size-6"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">回到頁面頂端</TooltipContent>
      </Tooltip>
    </div>
  );
}
