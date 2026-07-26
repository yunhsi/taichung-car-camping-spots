import assert from "node:assert/strict";
import test from "node:test";

import { parseFavoriteIds } from "../src/features/favorites/favoritesStorage";

test("收藏快照只保留不重複的非空字串", () => {
  const result = parseFavoriteIds(
    JSON.stringify(["spot-1", 123, " ", "spot-1", null, " spot-2 "]),
  );

  assert.deepEqual(result, ["spot-1", "spot-2"]);
});

test("損毀或非陣列的收藏快照會安全地回傳空陣列", () => {
  assert.deepEqual(parseFavoriteIds("{invalid"), []);
  assert.deepEqual(parseFavoriteIds(JSON.stringify({ id: "spot-1" })), []);
  assert.deepEqual(parseFavoriteIds(null), []);
});
