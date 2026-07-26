import assert from "node:assert/strict";
import test from "node:test";

import { testDom as dom } from "./testDom";

import { act, cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ToastProvider } from "@/components/ui/Toast";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { AttractionList } from "@/features/attractions/components/AttractionList/AttractionList";
import { readAttraction } from "@/features/attractions/data/attraction";
import { readAttractions } from "@/features/attractions/data/attractions";

import {
  renderAttractionList,
  TEST_ATTRACTIONS,
} from "./attractionListTestUtils";

const ORIGINAL_FETCH = globalThis.fetch;

test.beforeEach(() => {
  dom.window.localStorage.clear();
  dom.window.history.replaceState(null, "", "/");
  globalThis.fetch = async (input) => {
    const url = new URL(String(input), "http://localhost");

    if (url.pathname === "/api/reviews") {
      return Response.json({ reviews: [] });
    }

    const attractionId = decodeURIComponent(url.pathname.split("/").at(-1) ?? "");
    const attraction = readAttraction(attractionId);

    return Response.json(
      attraction ? { attraction } : { error: "Attraction not found" },
      { status: attraction ? 200 : 404 },
    );
  };
});

test.afterEach(() => {
  cleanup();
});

test.after(() => {
  globalThis.fetch = ORIGINAL_FETCH;
});

test("列表共用 Dialog，並以景點名稱提供可辨識的按鈕名稱", async () => {
  const attraction = readAttractions()[0];
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderAttractionList([attraction]);
  const detailsButton = view.getByRole("button", {
    name: `查看「${attraction.name}」詳細資訊`,
  });

  await user.click(detailsButton);

  const dialog = await view.findByRole("dialog");
  await waitFor(() => {
    assert.equal(
      new URL(dom.window.location.href).searchParams.get("attraction"),
      attraction.id,
    );
  });
  assert.equal(view.getAllByRole("dialog").length, 1);
  assert.ok(await within(dialog).findByText("介紹內容"));

  const returnedToList = new Promise<void>((resolve) => {
    dom.window.addEventListener("popstate", () => resolve(), { once: true });
  });
  await user.click(within(dialog).getByRole("button", { name: "關閉" }));
  await act(async () => {
    await returnedToList;
  });
  assert.equal(
    new URL(dom.window.location.href).searchParams.has("attraction"),
    false,
  );
  assert.equal(dom.window.document.activeElement, detailsButton);
});

test("景點詳細使用評分摘要，點擊後開啟完整評論", async () => {
  const attraction = readAttractions()[0];
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderAttractionList([attraction]);

  await user.click(
    view.getByRole("button", {
      name: `查看「${attraction.name}」詳細資訊`,
    }),
  );

  const attractionDialog = await view.findByRole("dialog", {
    name: attraction.name,
  });
  const reviewSummaryButton = await within(attractionDialog).findByRole(
    "button",
    { name: `查看「${attraction.name}」的評分與評論` },
  );

  await user.click(reviewSummaryButton);

  const reviewsDialog = await view.findByRole("dialog", {
    name: `「${attraction.name}」評分與評論`,
  });
  assert.ok(within(reviewsDialog).getByLabelText("評分分布"));
  assert.ok(within(reviewsDialog).getByText("目前尚無公開評論"));

  await user.click(
    within(reviewsDialog).getByRole("button", { name: "關閉" }),
  );
  assert.equal(dom.window.document.activeElement, reviewSummaryButton);
});

test("從列表開啟與關閉 Dialog 會沿用瀏覽器前進與後退紀錄", async () => {
  const attraction = readAttractions()[0];
  dom.window.history.replaceState(null, "", "/?township=北區#results");
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderAttractionList([attraction]);

  await user.click(
    view.getByRole("button", {
      name: `查看「${attraction.name}」詳細資訊`,
    }),
  );

  const dialog = await view.findByRole("dialog");
  const returnedToList = new Promise<void>((resolve) => {
    dom.window.addEventListener("popstate", () => resolve(), { once: true });
  });

  await user.click(within(dialog).getByRole("button", { name: "關閉" }));
  await act(async () => {
    await returnedToList;
  });

  let url = new URL(dom.window.location.href);
  assert.equal(url.searchParams.get("township"), "北區");
  assert.equal(url.searchParams.has("attraction"), false);
  assert.equal(url.hash, "#results");

  const reopenedDetails = new Promise<void>((resolve) => {
    dom.window.addEventListener("popstate", () => resolve(), { once: true });
  });
  await act(async () => {
    dom.window.history.forward();
    await reopenedDetails;
  });

  url = new URL(dom.window.location.href);
  assert.equal(url.searchParams.get("attraction"), attraction.id);
  assert.ok(await view.findByRole("dialog"));
});

test("分享網址會直接開啟景點 Dialog，並保留其他網址狀態", async () => {
  const attraction = readAttractions()[0];
  dom.window.history.replaceState(
    null,
    "",
    `/?township=北區&attraction=${attraction.id}#results`,
  );
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(
    <TooltipProvider>
      <ToastProvider>
        <AttractionList
          attractions={[attraction]}
          initialAttractionId={attraction.id}
        />
      </ToastProvider>
    </TooltipProvider>,
  );

  const dialog = await view.findByRole("dialog");
  assert.ok(
    await within(dialog).findByRole("heading", { name: attraction.name }),
  );

  await user.click(within(dialog).getByRole("button", { name: "關閉" }));

  const url = new URL(dom.window.location.href);
  assert.equal(url.searchParams.get("township"), "北區");
  assert.equal(url.searchParams.has("attraction"), false);
  assert.equal(url.hash, "#results");
});

test("可在 Dialog 內依目前列表順序切換前後景點", async () => {
  const [firstAttraction, secondAttraction] = readAttractions();
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderAttractionList([firstAttraction, secondAttraction]);

  await user.click(
    view.getByRole("button", {
      name: `查看「${firstAttraction.name}」詳細資訊`,
    }),
  );

  const dialog = await view.findByRole("dialog");
  assert.ok(
    within(dialog).getByRole("button", {
      name: "已是第一個景點",
    }).hasAttribute("disabled"),
  );

  await user.click(
    within(dialog).getByRole("button", {
      name: `下一個景點：${secondAttraction.name}`,
    }),
  );

  await waitFor(() => {
    assert.equal(
      new URL(dom.window.location.href).searchParams.get("attraction"),
      secondAttraction.id,
    );
  });
  assert.ok(
    await within(dialog).findByRole("heading", {
      name: secondAttraction.name,
    }),
  );
  assert.ok(
    within(dialog).getByRole("button", {
      name: "已是最後一個景點",
    }).hasAttribute("disabled"),
  );

  await user.keyboard("{ArrowLeft}");

  assert.ok(
    await within(dialog).findByRole("heading", {
      name: firstAttraction.name,
    }),
  );
});

test("詳細資料載入失敗時關閉 Dialog 並顯示 Toast", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderAttractionList([
    { ...TEST_ATTRACTIONS[0], id: "missing-attraction" },
  ]);

  await user.click(
    view.getByRole("button", { name: "查看「較遠景點」詳細資訊" }),
  );

  const toast = await view.findByRole("alert");

  assert.equal(view.queryByRole("dialog"), null);
  assert.match(toast.textContent ?? "", /景點載入失敗/);
  assert.match(toast.textContent ?? "", /找不到指定的景點詳細資料/);
});
