import { useCallback, useMemo, useState } from "react";

import { useToast } from "@/components/ui/Toast";
import { sortByDistance } from "@/features/attractions/lib/distance";
import type {
  AttractionListItem,
  AttractionSortMode,
} from "@/features/attractions/types";

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface AttractionSortValue {
  isLocating: boolean;
  sortedAttractions: AttractionListItem[];
  sortMode: AttractionSortMode;
  changeSortMode: (sortMode: AttractionSortMode) => void;
}

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10000,
  maximumAge: 300000,
};

function getLocationErrorMessage(error: GeolocationPositionError): string {
  if (error.code === error.PERMISSION_DENIED) {
    return "無法取得位置，請允許瀏覽器使用定位後再試一次。";
  }

  if (error.code === error.TIMEOUT) {
    return "定位逾時，請確認裝置已開啟定位功能後再試一次。";
  }

  return "暫時無法取得位置，請稍後再試一次。";
}

export function useAttractionListSort(
  attractions: AttractionListItem[],
): AttractionSortValue {
  const { showToast } = useToast();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [sortMode, setSortMode] = useState<AttractionSortMode>("township");
  const sortedAttractions = useMemo(
    () =>
      sortMode === "distance" && userLocation
        ? sortByDistance(attractions, userLocation)
        : attractions,
    [attractions, sortMode, userLocation],
  );

  const sortFromCurrentLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      showToast({
        title: "定位失敗",
        description: "此瀏覽器不支援定位功能。",
        variant: "error",
      });
      setSortMode("township");
      return;
    }

    setIsLocating(true);

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
        showToast({
          title: "定位失敗",
          description: getLocationErrorMessage(error),
          variant: "error",
        });
        setSortMode("township");
      },
      GEOLOCATION_OPTIONS,
    );
  }, [showToast]);

  const changeSortMode = useCallback(
    (nextSortMode: AttractionSortMode) => {
      if (nextSortMode === "township") {
        setSortMode("township");
        return;
      }

      setSortMode("distance");

      if (userLocation) {
        return;
      }

      sortFromCurrentLocation();
    },
    [sortFromCurrentLocation, userLocation],
  );

  return {
    isLocating,
    sortedAttractions,
    sortMode,
    changeSortMode,
  };
}
