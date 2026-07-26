import attractionDetailsData from "@/features/attractions/data/taichung-attraction-details.json";
import type { AttractionDetail } from "@/features/attractions/types";

export function readAttraction(id: string): AttractionDetail | null {
  const details =
    attractionDetailsData[id as keyof typeof attractionDetailsData];

  if (!details) {
    return null;
  }

  return {
    id,
    name: details["名稱"],
    description: details["介紹內容"],
    travelTips: details["旅遊叮嚀"],
    parkingInformation: details["停車資訊"],
    officialWebsiteUrl: details["官方網站"],
    fanPageUrl: details["粉絲專頁"],
    googleMapsUrl: details["Google地圖網址"],
  };
}
