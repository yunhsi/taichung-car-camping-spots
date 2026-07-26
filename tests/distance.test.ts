import assert from "node:assert/strict";
import test from "node:test";

import {
  getDistanceInKilometers,
  sortByDistance,
} from "../src/features/attractions/lib/distance";

test("相同座標的距離為零", () => {
  const location = { latitude: 24.1477, longitude: 120.6736 };

  assert.equal(getDistanceInKilometers(location, location), 0);
});

test("景點會依直線距離由近到遠排序", () => {
  const result = sortByDistance(
    [
      { name: "較遠", latitude: 24.2, longitude: 120.7 },
      { name: "最近", latitude: 24.15, longitude: 120.67 },
      { name: "無座標", latitude: null, longitude: null },
    ],
    { latitude: 24.1477, longitude: 120.6736 },
  );

  assert.deepEqual(
    result.map(({ name }) => name),
    ["最近", "較遠", "無座標"],
  );
});

test("距離相同時會維持原本的景點順序", () => {
  const result = sortByDistance(
    [
      { name: "第一筆", latitude: 24.15, longitude: 120.67 },
      { name: "第二筆", latitude: 24.15, longitude: 120.67 },
    ],
    { latitude: 24.1477, longitude: 120.6736 },
  );

  assert.deepEqual(
    result.map(({ name }) => name),
    ["第一筆", "第二筆"],
  );
});
