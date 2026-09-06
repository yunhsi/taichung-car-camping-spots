import type { AttractionDetail } from "@/features/attractions/types";

const ATTRACTIONS_API_URL = "/api/attractions";
const ATTRACTION_REQUESTS = new Map<string, Promise<AttractionDetail>>();

export function fetchAttraction(
  attractionId: string,
): Promise<AttractionDetail> {
  const cachedRequest = ATTRACTION_REQUESTS.get(attractionId);

  if (cachedRequest) {
    return cachedRequest;
  }

  const request = requestAttraction(attractionId).catch(
    (error: unknown) => {
      ATTRACTION_REQUESTS.delete(attractionId);
      throw error;
    },
  );
  ATTRACTION_REQUESTS.set(attractionId, request);

  return request;
}

export function preloadAttraction(attractionId: string): void {
  void fetchAttraction(attractionId).catch(() => undefined);
}

async function requestAttraction(
  attractionId: string,
): Promise<AttractionDetail> {
  const response = await fetch(
    `${ATTRACTIONS_API_URL}/${encodeURIComponent(attractionId)}`,
  );

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? "找不到指定的景點詳細資料。"
        : "景點詳細資料載入失敗。",
    );
  }

  const value: unknown = await response.json();

  if (!value || typeof value !== "object" || !("attraction" in value)) {
    throw new Error("伺服器回傳的景點詳細資料格式不正確。");
  }

  const attraction = parseAttraction(value.attraction);

  if (!attraction || attraction.id !== attractionId) {
    throw new Error("伺服器回傳的景點詳細資料格式不正確。");
  }

  return attraction;
}

function parseAttraction(value: unknown): AttractionDetail | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const attraction = value as Record<string, unknown>;
  const stringFields = [
    "id",
    "name",
    "description",
    "travelTips",
    "parkingInformation",
    "officialWebsiteUrl",
    "fanPageUrl",
    "googleMapsUrl",
  ] as const;

  if (stringFields.some((field) => typeof attraction[field] !== "string")) {
    return null;
  }

  return {
    id: attraction.id as string,
    name: attraction.name as string,
    description: attraction.description as string,
    travelTips: attraction.travelTips as string,
    parkingInformation: attraction.parkingInformation as string,
    officialWebsiteUrl: attraction.officialWebsiteUrl as string,
    fanPageUrl: attraction.fanPageUrl as string,
    googleMapsUrl: attraction.googleMapsUrl as string,
  };
}
