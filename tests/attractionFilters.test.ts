import assert from "node:assert/strict";
import test from "node:test";

import {
  filterAttractions,
  getValidFilters,
  sortAttractionsByTownshipOrder,
} from "../src/features/attractions/lib/attractionFilters";

const attractions = [
  {
    name: "山區景點",
    address: "臺中市和平區範例路 1 號",
    categories: ["自然風景", "戶外踏青"],
  },
  {
    name: "市區景點",
    address: "臺中市西區範例路 2 號",
    categories: ["藝術文化"],
  },
  {
    name: "海線景點",
    address: "臺中市梧棲區範例路 3 號",
    categories: ["自然風景"],
  },
];

test("地區與主題條件採交集篩選", () => {
  const result = filterAttractions(attractions, {
    townships: ["和平區"],
    categories: ["自然風景"],
  });

  assert.deepEqual(
    result.map(({ name }) => name),
    ["山區景點"],
  );
});

test("同類型的多個條件採聯集篩選", () => {
  const result = filterAttractions(attractions, {
    townships: [],
    categories: ["自然風景", "藝術文化"],
  });

  assert.equal(result.length, 3);
});

test("空白條件會保留所有景點", () => {
  const result = filterAttractions(attractions, {
    townships: [],
    categories: [],
  });

  assert.deepEqual(result, attractions);
});

test("搜尋參數會移除重複值與無效值", () => {
  const result = getValidFilters(
    ["和平區", "不存在", "和平區", "西區"],
    ["和平區", "西區"],
  );

  assert.deepEqual(result, ["和平區", "西區"]);
});

test("景點依地區列表順序排列，且同區維持原始順序", () => {
  const result = sortAttractionsByTownshipOrder(
    [
      attractions[0],
      attractions[2],
      attractions[1],
      {
        name: "另一個市區景點",
        address: "臺中市西區範例路 4 號",
        categories: ["藝術文化"],
      },
    ],
    ["西區", "和平區", "梧棲區"],
  );

  assert.deepEqual(
    result.map(({ name }) => name),
    ["市區景點", "另一個市區景點", "山區景點", "海線景點"],
  );
});
