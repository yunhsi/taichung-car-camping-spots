import assert from "node:assert/strict";
import test from "node:test";

import { readAttractions } from "@/features/attractions/data/attractions";
import {
  getFavoriteIdsSnapshot,
  replaceFavoriteIds,
  setFavoriteIdStatus,
  subscribeToFavorites,
} from "@/features/favorites/data/favoritesStore";
import { parseFavoriteUpdateInput } from "@/features/favorites/lib/favoriteValidation";

const ATTRACTION_ID = readAttractions()[0]?.id;

if (!ATTRACTION_ID) {
  throw new Error("測試需要至少一個景點。");
}

test.beforeEach(() => {
  replaceFavoriteIds([]);
});

test("收藏修改只接受已知景點與布林狀態", () => {
  assert.deepEqual(
    parseFavoriteUpdateInput({ attractionId: ATTRACTION_ID, isFavorite: true }),
    { attractionId: ATTRACTION_ID, isFavorite: true },
  );
  assert.equal(
    parseFavoriteUpdateInput({ attractionId: "unknown", isFavorite: true }),
    null,
  );
  assert.equal(
    parseFavoriteUpdateInput({ attractionId: ATTRACTION_ID }),
    null,
  );
});

test("伺服器收藏快照可取代記憶體狀態並更新個別收藏", () => {
  replaceFavoriteIds([ATTRACTION_ID, ATTRACTION_ID]);
  setFavoriteIdStatus(ATTRACTION_ID, false);

  assert.deepEqual(getFavoriteIdsSnapshot(), []);
});

test("收藏通知只呼叫更新開始時已存在的訂閱者", () => {
  let addedListenerCalls = 0;
  let unsubscribeAddedListener: () => void = () => undefined;
  let unsubscribeInitialListener: () => void = () => undefined;

  unsubscribeInitialListener = subscribeToFavorites(() => {
    unsubscribeInitialListener();
    unsubscribeAddedListener = subscribeToFavorites(() => {
      addedListenerCalls += 1;
    });
  });

  replaceFavoriteIds([ATTRACTION_ID]);

  assert.equal(addedListenerCalls, 0);
  unsubscribeAddedListener();
});
