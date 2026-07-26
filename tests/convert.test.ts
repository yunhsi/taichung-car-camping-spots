import assert from "node:assert/strict";
import test from "node:test";

import {
  createAttractionDetails,
  createAttractionList,
  getGoogleMapsUrl,
  validateCsvRows,
} from "../scripts/convertAttractions";

const VALID_ROW = {
  編號: "1",
  名稱: "範例景點",
  介紹內容: "",
  開放時間: "全天",
  地址: "範例路 1 號",
  電話: "",
  "地理座標（緯度）": "24.123",
  "地理座標（經度）": "120.456",
  停留時間: "",
  旅遊叮嚀: "",
  停車資訊: "",
  官方網站: "",
  粉絲專頁: "",
  主題分類: "自然風景",
  縣市: "臺中市",
  鄉鎮: "和平區",
  服務設施: "停車場、公廁",
  "門票/收費": "免費",
  谷歌地點ID: "",
};

test("CSV 驗證會接受空字串，但拒絕遺漏的欄位值", () => {
  assert.doesNotThrow(() => validateCsvRows([VALID_ROW]));

  const inVALID_ROW = { ...VALID_ROW };
  delete (inVALID_ROW as Partial<typeof VALID_ROW>).服務設施;

  assert.throws(
    () => validateCsvRows([inVALID_ROW]),
    /第 2 列的「服務設施」/,
  );
});

test("Google Maps 網址包含景點、地址與 Place ID", () => {
  const url = new URL(
    getGoogleMapsUrl(
      "example-place-id",
      "範例景點",
      "臺中市和平區範例路 1 號",
    ),
  );

  assert.equal(url.origin, "https://www.google.com");
  assert.equal(url.searchParams.get("api"), "1");
  assert.equal(
    url.searchParams.get("query"),
    "範例景點 臺中市和平區範例路 1 號",
  );
  assert.equal(url.searchParams.get("query_place_id"), "example-place-id");
});

test("景點列表與詳細資料會分開，並以編號索引詳細資料", () => {
  const spot = {
    編號: "1",
    名稱: "範例景點",
    介紹內容: "詳細介紹",
    開放時間: "全天",
    地址: "臺中市和平區範例路 1 號",
    電話: "",
    "地理座標（緯度）": "24.123",
    "地理座標（經度）": "120.456",
    停留時間: "1 小時",
    旅遊叮嚀: "注意天候",
    停車資訊: "設有停車場",
    官方網站: "",
    粉絲專頁: "",
    主題分類: "自然風景",
    Google地圖網址: "https://maps.example.com",
  };

  const list = createAttractionList([spot]);
  const details = createAttractionDetails([spot]);

  assert.equal(list[0]["編號"], "1");
  assert.equal("介紹內容" in list[0], false);
  assert.equal(details["1"]["名稱"], "範例景點");
  assert.equal(details["1"]["介紹內容"], "詳細介紹");
  assert.equal(
    details["1"]["Google地圖網址"],
    "https://maps.example.com",
  );
});
