import { testDom as dom } from "./testDom";

import { render } from "@testing-library/react";

import { ToastProvider } from "@/components/ui/Toast";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { AttractionList } from "@/features/attractions/components/AttractionList/AttractionList";
import type { AttractionListItem } from "@/features/attractions/types";

export const TEST_ATTRACTIONS: AttractionListItem[] = [
  {
    id: "far",
    name: "較遠景點",
    openingHours: "",
    address: "臺中市和平區",
    phone: "",
    latitude: 24.5,
    longitude: 120.9,
    stayDuration: "",
    categories: [],
    googleMapsUrl: "",
  },
  {
    id: "near",
    name: "較近景點",
    openingHours: "",
    address: "臺中市新社區",
    phone: "",
    latitude: 24.1,
    longitude: 120.7,
    stayDuration: "",
    categories: [],
    googleMapsUrl: "",
  },
];

export function renderAttractionList(
  attractions: AttractionListItem[] = TEST_ATTRACTIONS,
) {
  return render(
    <TooltipProvider>
      <ToastProvider>
        <AttractionList attractions={attractions} />
      </ToastProvider>
    </TooltipProvider>,
  );
}

export function setGeolocation(
  getCurrentPosition: Geolocation["getCurrentPosition"],
) {
  const geolocation: Geolocation = {
    clearWatch: () => undefined,
    getCurrentPosition,
    watchPosition: () => 0,
  };

  Object.defineProperty(dom.window.navigator, "geolocation", {
    configurable: true,
    value: geolocation,
  });
}
