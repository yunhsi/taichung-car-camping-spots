import assert from "node:assert/strict";
import test from "node:test";

import { readAttraction } from "../src/features/attractions/data/attraction";
import { readAttractions } from "../src/features/attractions/data/attractions";

test("可使用列表中的景點 id 取得完整詳細資料", () => {
  const attractions = readAttractions();
  const listItem = attractions[0];
  const detail = readAttraction(listItem.id);

  assert.ok(detail);
  assert.equal(detail.id, listItem.id);
  assert.equal(detail.name, listItem.name);
  assert.equal(detail.googleMapsUrl, listItem.googleMapsUrl);
  assert.equal(typeof detail.description, "string");
});

test("不存在的景點 id 會回傳 null", () => {
  assert.equal(readAttraction("not-found"), null);
});
