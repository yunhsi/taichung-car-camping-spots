import attractionListData from "@/features/attractions/data/taichung-attraction-list.json";
import type { AttractionListItem } from "@/features/attractions/types";

function parseCoordinate(value: string): number | null {
  const coordinate = Number(value);

  return value.trim() !== "" && Number.isFinite(coordinate) ? coordinate : null;
}

const attractions: AttractionListItem[] = attractionListData.map(
  (attraction) => ({
    id: attraction["編號"],
    name: attraction["名稱"],
    openingHours: attraction["開放時間"],
    address: attraction["地址"],
    phone: attraction["電話"],
    latitude: parseCoordinate(attraction["地理座標（緯度）"]),
    longitude: parseCoordinate(attraction["地理座標（經度）"]),
    stayDuration: attraction["停留時間"],
    categories: attraction["主題分類"].split("、").filter(Boolean),
    googleMapsUrl: attraction["Google地圖網址"],
  }),
);

export function getAttractions(): AttractionListItem[] {
  return attractions;
}
