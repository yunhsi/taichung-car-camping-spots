import assert from "node:assert/strict";
import test from "node:test";

import { getTableConfig } from "drizzle-orm/pg-core";

import {
  accounts,
  favorites,
  reviewReports,
  reviews,
  sessions,
  users,
} from "../src/lib/db/schema";

test("資料庫包含 Auth.js 與會員個人資料所需表格", () => {
  assert.deepEqual(
    [
      users,
      accounts,
      sessions,
      favorites,
      reviewReports,
      reviews,
    ].map((table) => getTableConfig(table).name),
    [
      "users",
      "accounts",
      "sessions",
      "favorites",
      "review_reports",
      "reviews",
    ],
  );
});

test("帳號、工作階段、個人資料與檢舉會隨來源資料一併清除", () => {
  for (const table of [
    accounts,
    sessions,
    favorites,
    reviews,
    reviewReports,
  ]) {
    const foreignKeys = getTableConfig(table).foreignKeys;

    assert.ok(foreignKeys.length >= 1);
    assert.equal(
      foreignKeys.every((foreignKey) => foreignKey.onDelete === "cascade"),
      true,
    );
  }
});

test("每位會員對同一則評論只能送出一筆檢舉", () => {
  const primaryKeys = getTableConfig(reviewReports).primaryKeys;

  assert.equal(primaryKeys.length, 1);
  assert.deepEqual(
    primaryKeys[0]?.columns.map((column) => column.name),
    ["reporter_user_id", "review_id"],
  );
});

test("每位會員對同一景點只保留一筆收藏與評論", () => {
  for (const table of [favorites, reviews]) {
    const primaryKeys = getTableConfig(table).primaryKeys;

    assert.equal(primaryKeys.length, 1);
    assert.deepEqual(
      primaryKeys[0]?.columns.map((column) => column.name),
      ["user_id", "attraction_id"],
    );
  }
});

test("公開評論可依景點與更新時間查詢", () => {
  const indexes = getTableConfig(reviews).indexes;
  const reviewQueryIndex = indexes.find(
    (index) => index.config.name === "reviews_attraction_updated_idx",
  );

  assert.deepEqual(
    reviewQueryIndex?.config.columns.map((column) =>
      "name" in column ? column.name : null,
    ),
    ["attraction_id", "updated_at"],
  );
});
