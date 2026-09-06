export interface CsvRow {
  [column: string]: string;
}

const EXCLUDED_THEME_CATEGORIES = new Set([
  "百貨商圈",
  "觀光夜市",
  "自行車道",
  "主題街道",
  "藝術空間",
  "地方展館",
  "宗教寺廟",
  "歷史古蹟",
  "原民生活",
  "觀光工廠",
]);
const FACILITIES_COLUMN = "服務設施";
const REQUIRED_FACILITIES = ["停車場", "公廁"];
const ADMISSION_COLUMN = "門票/收費";
const FREE_ADMISSION_VALUES = new Set(["免費", "免費參觀", "免費入場", "無"]);
const GOOGLE_PLACE_ID_COLUMN = "谷歌地點ID";
const GOOGLE_MAP_URL_COLUMN = "Google地圖網址";
const ATTRACTION_LIST_OUTPUT_COLUMNS = [
  "編號",
  "名稱",
  "開放時間",
  "地址",
  "電話",
  "地理座標（緯度）",
  "地理座標（經度）",
  "停留時間",
  "主題分類",
  GOOGLE_MAP_URL_COLUMN,
] as const;
const ATTRACTION_DETAIL_OUTPUT_COLUMNS = [
  "名稱",
  "介紹內容",
  "旅遊叮嚀",
  "停車資訊",
  "官方網站",
  "粉絲專頁",
  GOOGLE_MAP_URL_COLUMN,
] as const;
const REQUIRED_COLUMNS = [
  ...ATTRACTION_LIST_OUTPUT_COLUMNS,
  ...ATTRACTION_DETAIL_OUTPUT_COLUMNS,
  "縣市",
  "鄉鎮",
  FACILITIES_COLUMN,
  ADMISSION_COLUMN,
  GOOGLE_PLACE_ID_COLUMN,
].filter((column) => column !== GOOGLE_MAP_URL_COLUMN);

type AttractionListOutputColumn =
  (typeof ATTRACTION_LIST_OUTPUT_COLUMNS)[number];
type AttractionDetailOutputColumn =
  (typeof ATTRACTION_DETAIL_OUTPUT_COLUMNS)[number];
type CarCampingSpot = Record<
  AttractionListOutputColumn | AttractionDetailOutputColumn,
  string
>;
type AttractionListItem = Record<AttractionListOutputColumn, string>;
type AttractionDetails = Record<
  string,
  Record<AttractionDetailOutputColumn, string>
>;

interface AttractionConversionResult {
  attractionList: AttractionListItem[];
  attractionDetails: AttractionDetails;
  themeCategories: string[];
}

export function convertAttractionRows(
  rows: readonly CsvRow[],
): AttractionConversionResult {
  const carCampingSpots = createCarCampingSpots(rows);

  return {
    attractionList: createAttractionList(carCampingSpots),
    attractionDetails: createAttractionDetails(carCampingSpots),
    themeCategories: createThemeCategories(carCampingSpots),
  };
}

export function validateCsvColumns(fields: readonly string[]): void {
  const availableFields = new Set(fields);
  const missingColumns = REQUIRED_COLUMNS.filter(
    (column) => !availableFields.has(column),
  );

  if (missingColumns.length > 0) {
    throw new Error(`CSV 缺少必要欄位：${missingColumns.join("、")}`);
  }
}

export function validateCsvRows(
  rows: readonly Record<string, unknown>[],
): void {
  const invalidCells = rows.flatMap((row, rowIndex) =>
    REQUIRED_COLUMNS.filter((column) => typeof row[column] !== "string").map(
      (column) => `第 ${rowIndex + 2} 列的「${column}」`,
    ),
  );

  if (invalidCells.length > 0) {
    throw new Error(`CSV 欄位值無效：${invalidCells.join("、")}`);
  }
}

function createCarCampingSpots(rows: readonly CsvRow[]): CarCampingSpot[] {
  return rows.filter(isSuitableForCarCamping).map(createCarCampingSpot);
}

function createCarCampingSpot(row: CsvRow): CarCampingSpot {
  const address = `${row["縣市"]}${row["鄉鎮"]}${row["地址"]}`;
  const normalizedRow: CsvRow = {
    ...row,
    地址: address,
    [GOOGLE_MAP_URL_COLUMN]: getGoogleMapsUrl(
      row[GOOGLE_PLACE_ID_COLUMN],
      row["名稱"],
      address,
    ),
  };

  return {
    ...pickColumns(normalizedRow, ATTRACTION_LIST_OUTPUT_COLUMNS),
    ...pickColumns(normalizedRow, ATTRACTION_DETAIL_OUTPUT_COLUMNS),
  };
}

export function createAttractionList(
  carCampingSpots: readonly CarCampingSpot[],
): AttractionListItem[] {
  return carCampingSpots.map((spot) =>
    pickColumns(spot, ATTRACTION_LIST_OUTPUT_COLUMNS),
  );
}

export function createAttractionDetails(
  carCampingSpots: readonly CarCampingSpot[],
): AttractionDetails {
  return Object.fromEntries(
    carCampingSpots.map((spot) => [
      spot["編號"],
      pickColumns(spot, ATTRACTION_DETAIL_OUTPUT_COLUMNS),
    ]),
  );
}

function createThemeCategories(
  carCampingSpots: readonly CarCampingSpot[],
): string[] {
  return [
    ...new Set(
      carCampingSpots.flatMap((spot) => parseDelimitedValues(spot["主題分類"])),
    ),
  ];
}

function isSuitableForCarCamping(row: CsvRow): boolean {
  return (
    hasRequiredFacilities(row) &&
    doesNotRequireAdmissionFee(row) &&
    doesNotHaveExcludedThemeCategory(row)
  );
}

function hasRequiredFacilities(row: CsvRow): boolean {
  const facilities = parseDelimitedValues(row[FACILITIES_COLUMN]);

  return REQUIRED_FACILITIES.every((facility) => facilities.includes(facility));
}

function doesNotRequireAdmissionFee(row: CsvRow): boolean {
  const admission = row[ADMISSION_COLUMN].trim();

  return admission === "" || FREE_ADMISSION_VALUES.has(admission);
}

function doesNotHaveExcludedThemeCategory(row: CsvRow): boolean {
  const themeCategories = parseDelimitedValues(row["主題分類"]);

  return themeCategories.every(
    (category) => !EXCLUDED_THEME_CATEGORIES.has(category),
  );
}

function parseDelimitedValues(value: string): string[] {
  return value
    .split("、")
    .map((item) => item.trim())
    .filter(Boolean);
}

function pickColumns<const Column extends string>(
  row: CsvRow,
  columns: readonly Column[],
): Record<Column, string> {
  return Object.fromEntries(columns.map((column) => [column, row[column]])) as Record<
    Column,
    string
  >;
}

export function getGoogleMapsUrl(
  placeId: string,
  placeName: string,
  address: string,
): string {
  const query = [placeName.trim(), address.trim()].filter(Boolean).join(" ");

  if (!query) {
    return "";
  }

  const searchParams = new URLSearchParams({ api: "1", query });
  const normalizedPlaceId = placeId.trim();

  if (normalizedPlaceId) {
    searchParams.set("query_place_id", normalizedPlaceId);
  }

  return `https://www.google.com/maps/search/?${searchParams.toString()}`;
}
