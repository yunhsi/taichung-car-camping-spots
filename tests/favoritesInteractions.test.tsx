import assert from "node:assert/strict";
import test from "node:test";

import { testDom as dom } from "./testDom";

import { act, cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TooltipProvider } from "@/components/ui/Tooltip";
import { FavoriteButton } from "@/features/favorites/components/FavoriteButton";
const renderCounts = new Map<string, number>();

function TrackedFavoriteButton({
  attractionId,
}: {
  attractionId: string;
}) {
  renderCounts.set(attractionId, (renderCounts.get(attractionId) ?? 0) + 1);

  return (
    <FavoriteButton
      attractionId={attractionId}
      attractionName={attractionId}
    />
  );
}

function renderFavoriteButtons() {
  return render(
    <TooltipProvider>
      <TrackedFavoriteButton attractionId="spot-1" />
      <TrackedFavoriteButton attractionId="spot-2" />
    </TooltipProvider>,
  );
}

test.beforeEach(() => {
  dom.window.localStorage.clear();
  renderCounts.clear();
});

test.afterEach(() => {
  cleanup();
});

test("切換收藏時只重新渲染狀態改變的按鈕", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderFavoriteButtons();
  const secondButtonRenderCount = renderCounts.get("spot-2");

  await user.click(view.getByRole("button", { name: "收藏「spot-1」" }));

  assert.equal(
    view.getByRole("button", { name: "取消收藏「spot-1」" }).getAttribute(
      "aria-pressed",
    ),
    "true",
  );
  assert.equal(renderCounts.get("spot-2"), secondButtonRenderCount);
});

test("其他分頁的 storage 事件會同步更新收藏狀態", async () => {
  const view = renderFavoriteButtons();

  act(() => {
    dom.window.localStorage.setItem(
      "favoriteAttractionIds",
      JSON.stringify(["spot-2"]),
    );
    dom.window.dispatchEvent(
      new dom.window.StorageEvent("storage", {
        key: "favoriteAttractionIds",
      }),
    );
  });

  assert.equal(
    (await view.findByRole("button", {
      name: "取消收藏「spot-2」",
    })).getAttribute("aria-pressed"),
    "true",
  );
});
