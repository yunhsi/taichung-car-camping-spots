"use client";

import { type ChangeEvent, useMemo, useRef, useState } from "react";

import { ChevronDown, LoaderCircle } from "lucide-react";

import { sortByDistance } from "@/features/attractions/lib/distance";
import type { AttractionListItem } from "@/features/attractions/types";

import { AttractionCard } from "./AttractionCard";
import { AttractionDialog } from "./AttractionDialog";

interface AttractionListProps {
  attractions: AttractionListItem[];
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

type SortMode = "distance" | "township";

function getLocationErrorMessage(error: GeolocationPositionError): string {
  if (error.code === error.PERMISSION_DENIED) {
    return "無法取得位置，請允許瀏覽器使用定位後再試一次。";
  }

  if (error.code === error.TIMEOUT) {
    return "定位逾時，請確認裝置已開啟定位功能後再試一次。";
  }

  return "暫時無法取得位置，請稍後再試一次。";
}

export function AttractionList({
  attractions,
}: AttractionListProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("township");
  const [selectedAttractionId, setSelectedAttractionId] = useState<
    string | null
  >(null);
  const detailsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const sortedAttractions = useMemo(
    () =>
      sortMode === "distance" && userLocation
        ? sortByDistance(attractions, userLocation)
        : attractions,
    [attractions, sortMode, userLocation],
  );
  const selectedAttractionIndex = sortedAttractions.findIndex(
    ({ id }) => id === selectedAttractionId,
  );
  const previousAttraction =
    selectedAttractionIndex > 0
      ? sortedAttractions[selectedAttractionIndex - 1]
      : null;
  const nextAttraction =
    selectedAttractionIndex >= 0 &&
    selectedAttractionIndex < sortedAttractions.length - 1
      ? sortedAttractions[selectedAttractionIndex + 1]
      : null;

  function sortFromCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setLocationError("此瀏覽器不支援定位功能。");
      setSortMode("township");
      return;
    }

    setIsLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        setLocationError(getLocationErrorMessage(error));
        setSortMode("township");
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextSortMode = event.target.value as SortMode;

    if (nextSortMode === "township") {
      setSortMode("township");
      setLocationError("");
      return;
    }

    setSortMode("distance");

    if (userLocation) {
      setLocationError("");
      return;
    }

    sortFromCurrentLocation();
  }

  function openAttractionDetails(
    attractionId: string,
    trigger: HTMLButtonElement,
  ) {
    detailsTriggerRef.current = trigger;
    setSelectedAttractionId(attractionId);
  }

  function restoreDetailsTriggerFocus() {
    detailsTriggerRef.current?.focus();
    detailsTriggerRef.current = null;
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div
          aria-hidden="true"
          className="h-1.5 w-20 rounded-full bg-linear-to-r from-primary to-accent"
        />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="relative">
            <label htmlFor="attraction-sort" className="sr-only">
              排序方式
            </label>
            <select
              id="attraction-sort"
              value={sortMode}
              disabled={isLocating}
              aria-describedby={locationError ? "location-error" : undefined}
              onChange={handleSortChange}
              className="h-9 cursor-pointer appearance-none rounded-md border border-control-border bg-surface py-1.5 pr-9 pl-3 text-sm font-medium text-foreground shadow-sm outline-none transition-colors hover:bg-surface-elevated focus-visible:border-focus-ring focus-visible:ring-3 focus-visible:ring-focus-ring/30 disabled:cursor-wait disabled:opacity-70"
            >
              <option value="distance">依距離</option>
              <option value="township">依行政區</option>
            </select>
            {isLocating ? (
              <LoaderCircle
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted"
              />
            ) : (
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
              />
            )}
          </div>
          <p className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
            共 {attractions.length} 筆
          </p>
        </div>
      </div>

      {locationError && (
        <p
          id="location-error"
          role="alert"
          className="mb-5 text-right text-sm text-danger"
        >
          {locationError}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sortedAttractions.map((attraction) => (
          <AttractionCard
            key={attraction.id}
            {...attraction}
            onOpenDetails={openAttractionDetails}
          />
        ))}
      </div>

      <AttractionDialog
        attractionId={selectedAttractionId}
        isOpen={selectedAttractionId !== null}
        currentPosition={
          selectedAttractionIndex >= 0 ? selectedAttractionIndex + 1 : 0
        }
        totalAttractions={sortedAttractions.length}
        previousAttractionName={previousAttraction?.name ?? null}
        nextAttractionName={nextAttraction?.name ?? null}
        onPrevious={() => {
          if (previousAttraction) {
            setSelectedAttractionId(previousAttraction.id);
          }
        }}
        onNext={() => {
          if (nextAttraction) {
            setSelectedAttractionId(nextAttraction.id);
          }
        }}
        onCloseAutoFocus={restoreDetailsTriggerFocus}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedAttractionId(null);
          }
        }}
      />
    </>
  );
}
