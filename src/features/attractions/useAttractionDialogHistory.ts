import { useCallback, useEffect, useRef, useState } from "react";

import {
  getValidAttractionIdFromUrl,
  setAttractionUrlState,
} from "@/features/attractions/lib/attractionHistory";
import type { AttractionListItem } from "@/features/attractions/types";

interface PendingHistoryScrollRestore {
  scrollRestoration: ScrollRestoration;
  x: number;
  y: number;
}

interface AttractionDialogHistoryValue {
  currentPosition: number;
  nextAttraction: AttractionListItem | null;
  previousAttraction: AttractionListItem | null;
  selectedAttractionId: string | null;
  closeDialog: () => void;
  openDialog: (attractionId: string, trigger: HTMLButtonElement) => void;
  restoreTriggerFocus: () => void;
  showNextAttraction: () => void;
  showPreviousAttraction: () => void;
}

export function useAttractionDialogHistory(
  attractions: AttractionListItem[],
  initialAttractionId: string | null,
): AttractionDialogHistoryValue {
  const [selectedAttractionId, setSelectedAttractionId] = useState<
    string | null
  >(initialAttractionId);
  const detailsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const hasPushedAttractionEntryRef = useRef(false);
  const pendingUrlUpdateRef = useRef<number | null>(null);
  const pendingHistoryScrollRestoreRef =
    useRef<PendingHistoryScrollRestore | null>(null);
  const selectedAttractionIndex = attractions.findIndex(
    ({ id }) => id === selectedAttractionId,
  );
  const previousAttraction =
    selectedAttractionIndex > 0 ? attractions[selectedAttractionIndex - 1] : null;
  const nextAttraction =
    selectedAttractionIndex >= 0 &&
    selectedAttractionIndex < attractions.length - 1
      ? attractions[selectedAttractionIndex + 1]
      : null;

  useEffect(
    function listenForAttractionHistoryChanges() {
      function handlePopState() {
        hasPushedAttractionEntryRef.current = false;
        setSelectedAttractionId(getValidAttractionIdFromUrl(attractions));

        const pendingScrollRestore = pendingHistoryScrollRestoreRef.current;

        if (!pendingScrollRestore) {
          return;
        }

        pendingHistoryScrollRestoreRef.current = null;
        window.scrollTo(pendingScrollRestore.x, pendingScrollRestore.y);

        requestAnimationFrame(() => {
          window.scrollTo(pendingScrollRestore.x, pendingScrollRestore.y);
          window.history.scrollRestoration =
            pendingScrollRestore.scrollRestoration;
        });
      }

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    },
    [attractions],
  );

  useEffect(function cancelPendingHistoryUpdatesOnUnmount() {
    return () => {
      if (pendingUrlUpdateRef.current !== null) {
        cancelAnimationFrame(pendingUrlUpdateRef.current);
      }

      const pendingScrollRestore = pendingHistoryScrollRestoreRef.current;

      if (pendingScrollRestore) {
        window.history.scrollRestoration =
          pendingScrollRestore.scrollRestoration;
      }
    };
  }, []);

  const scheduleAttractionUrlUpdate = useCallback(
    (attractionId: string, mode: "push" | "replace") => {
      if (pendingUrlUpdateRef.current !== null) {
        cancelAnimationFrame(pendingUrlUpdateRef.current);
      }

      pendingUrlUpdateRef.current = requestAnimationFrame(() => {
        pendingUrlUpdateRef.current = null;

        if (mode === "push") {
          hasPushedAttractionEntryRef.current = true;
        }

        setAttractionUrlState(attractionId, mode);
      });
    },
    [],
  );

  const openDialog = useCallback(
    (attractionId: string, trigger: HTMLButtonElement) => {
      detailsTriggerRef.current = trigger;
      setSelectedAttractionId(attractionId);
      scheduleAttractionUrlUpdate(attractionId, "push");
    },
    [scheduleAttractionUrlUpdate],
  );

  const replaceSelectedAttraction = useCallback(
    (attractionId: string) => {
      setSelectedAttractionId(attractionId);
      scheduleAttractionUrlUpdate(attractionId, "replace");
    },
    [scheduleAttractionUrlUpdate],
  );

  const closeDialog = useCallback(() => {
    if (pendingUrlUpdateRef.current !== null) {
      cancelAnimationFrame(pendingUrlUpdateRef.current);
      pendingUrlUpdateRef.current = null;
    }

    setSelectedAttractionId(null);

    if (!hasPushedAttractionEntryRef.current) {
      setAttractionUrlState(null, "replace");
      return;
    }

    hasPushedAttractionEntryRef.current = false;
    pendingHistoryScrollRestoreRef.current = {
      scrollRestoration: window.history.scrollRestoration,
      x: window.scrollX,
      y: window.scrollY,
    };
    window.history.scrollRestoration = "manual";
    window.history.back();
  }, []);

  const restoreTriggerFocus = useCallback(() => {
    detailsTriggerRef.current?.focus({ preventScroll: true });
    detailsTriggerRef.current = null;
  }, []);

  const showPreviousAttraction = useCallback(() => {
    if (previousAttraction) {
      replaceSelectedAttraction(previousAttraction.id);
    }
  }, [previousAttraction, replaceSelectedAttraction]);

  const showNextAttraction = useCallback(() => {
    if (nextAttraction) {
      replaceSelectedAttraction(nextAttraction.id);
    }
  }, [nextAttraction, replaceSelectedAttraction]);

  return {
    currentPosition:
      selectedAttractionIndex >= 0 ? selectedAttractionIndex + 1 : 0,
    nextAttraction,
    previousAttraction,
    selectedAttractionId,
    closeDialog,
    openDialog,
    restoreTriggerFocus,
    showNextAttraction,
    showPreviousAttraction,
  };
}
