export interface AttractionListItem {
  id: string;
  name: string;
  openingHours: string;
  address: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  stayDuration: string;
  categories: string[];
  googleMapsUrl: string;
}

export interface AttractionDetail {
  id: string;
  name: string;
  description: string;
  travelTips: string;
  parkingInformation: string;
  officialWebsiteUrl: string;
  fanPageUrl: string;
  googleMapsUrl: string;
}
