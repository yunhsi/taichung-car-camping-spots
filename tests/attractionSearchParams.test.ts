import assert from "node:assert/strict";
import test from "node:test";

import {
  createAttractionSearchParams,
  getAttractionSearchParamsState,
} from "@/features/attractions/lib/attractionSearchParams";

import { TEST_ATTRACTIONS } from "./attractionListTestUtils";

const OPTIONS = {
  attractions: TEST_ATTRACTIONS,
  themeCategories: ["公園綠地"],
  townships: ["和平區", "新社區"],
};

test("有效搜尋參數會解析為篩選條件與指定景點", () => {
  assert.deepEqual(
    getAttractionSearchParamsState(
      {
        township: "和平區",
        attraction: TEST_ATTRACTIONS[0].id,
      },
      OPTIONS,
    ),
    {
      attractionId: TEST_ATTRACTIONS[0].id,
      categories: [],
      canonicalQuery: "township=%E5%92%8C%E5%B9%B3%E5%8D%80&attraction=far",
      filteredAttractions: [TEST_ATTRACTIONS[0]],
      shouldRedirect: false,
      townships: ["和平區"],
    },
  );
});

test("無效、重複及未知參數會產生乾淨的 canonical query", () => {
  assert.deepEqual(
    getAttractionSearchParamsState(
      {
        township: ["和平區", "不存在", "和平區", "新社區"],
        category: ["不存在", "公園綠地"],
        attraction: ["far", "near"],
        tracking: "unexpected",
      },
      OPTIONS,
    ),
    {
      attractionId: null,
      categories: ["公園綠地"],
      canonicalQuery:
        "township=%E5%92%8C%E5%B9%B3%E5%8D%80&township=%E6%96%B0%E7%A4%BE%E5%8D%80&category=%E5%85%AC%E5%9C%92%E7%B6%A0%E5%9C%B0",
      filteredAttractions: [],
      shouldRedirect: true,
      townships: ["和平區", "新社區"],
    },
  );
});

test("不在目前篩選結果中的景點會從 canonical query 移除", () => {
  const result = getAttractionSearchParamsState(
    {
      township: "新社區",
      attraction: TEST_ATTRACTIONS[0].id,
    },
    OPTIONS,
  );

  assert.equal(result.attractionId, null);
  assert.equal(
    result.canonicalQuery,
    "township=%E6%96%B0%E7%A4%BE%E5%8D%80",
  );
  assert.equal(result.shouldRedirect, true);
});

test("網址產生器固定使用地區、主題、景點順序", () => {
  assert.equal(
    createAttractionSearchParams({
      townships: ["和平區"],
      categories: ["公園綠地"],
      attractionId: "far",
    }).toString(),
    "township=%E5%92%8C%E5%B9%B3%E5%8D%80&category=%E5%85%AC%E5%9C%92%E7%B6%A0%E5%9C%B0&attraction=far",
  );
});
