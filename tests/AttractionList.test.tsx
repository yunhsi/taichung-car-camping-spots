import assert from "node:assert/strict";
import test from "node:test";

import { testDom as dom } from "./testDom";

import { cleanup, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TooltipProvider } from "@/components/ui/Tooltip";
import { AttractionList } from "@/features/attractions/components/AttractionList";
import { getAttractions } from "@/features/attractions/data/attractions";
import type { AttractionListItem } from "@/features/attractions/types";

const TEST_ATTRACTIONS: AttractionListItem[] = [
  {
    id: "far",
    name: "較遠景點",
    openingHours: "",
    address: "臺中市和平區",
    phone: "",
    latitude: 24.5,
    longitude: 120.9,
    stayDuration: "",
    categories: [],
    googleMapsUrl: "",
  },
  {
    id: "near",
    name: "較近景點",
    openingHours: "",
    address: "臺中市新社區",
    phone: "",
    latitude: 24.1,
    longitude: 120.7,
    stayDuration: "",
    categories: [],
    googleMapsUrl: "",
  },
];

function renderAttractionList(attractions = TEST_ATTRACTIONS) {
  return render(
    <TooltipProvider>
      <AttractionList attractions={attractions} />
    </TooltipProvider>,
  );
}

function setGeolocation(getCurrentPosition: Geolocation["getCurrentPosition"]) {
  const geolocation: Geolocation = {
    clearWatch: () => undefined,
    getCurrentPosition,
    watchPosition: () => 0,
  };

  Object.defineProperty(dom.window.navigator, "geolocation", {
    configurable: true,
    value: geolocation,
  });
}

test.beforeEach(() => {
  dom.window.localStorage.clear();
});

test.afterEach(() => {
  cleanup();
});

test("取得定位後會依使用者距離排序", async () => {
  setGeolocation((onSuccess) => {
    onSuccess({
      coords: {
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: 24.1,
        longitude: 120.7,
        speed: null,
        toJSON: () => ({}),
      },
      timestamp: Date.now(),
      toJSON: () => ({}),
    });
  });
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderAttractionList();

  await user.selectOptions(view.getByLabelText("排序方式"), "distance");

  const detailButtons = view.getAllByRole("button", {
    name: /查看「.+」詳細資訊/,
  });
  assert.deepEqual(
    detailButtons.map((button) => button.getAttribute("aria-label")),
    ["查看「較近景點」詳細資訊", "查看「較遠景點」詳細資訊"],
  );
});

test("定位被拒絕時會顯示錯誤並恢復行政區排序", async () => {
  setGeolocation((_onSuccess, onError) => {
    onError?.({
      code: 1,
      message: "denied",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    });
  });
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderAttractionList();

  await user.selectOptions(view.getByLabelText("排序方式"), "distance");

  assert.match(view.getByRole("alert").textContent ?? "", /請允許瀏覽器使用定位/);
  assert.equal(
    (view.getByLabelText("排序方式") as HTMLSelectElement).value,
    "township",
  );
});

test("列表共用 Dialog，並以景點名稱提供可辨識的按鈕名稱", async () => {
  const attraction = getAttractions()[0];
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderAttractionList([attraction]);
  const detailsButton = view.getByRole("button", {
    name: `查看「${attraction.name}」詳細資訊`,
  });

  await user.click(detailsButton);

  const dialog = await view.findByRole("dialog");
  assert.equal(view.getAllByRole("dialog").length, 1);
  assert.ok(await within(dialog).findByText("介紹內容"));

  await user.click(within(dialog).getByRole("button", { name: "關閉" }));
  assert.equal(dom.window.document.activeElement, detailsButton);
});

test("可在 Dialog 內依目前列表順序切換前後景點", async () => {
  const [firstAttraction, secondAttraction] = getAttractions();
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

test("詳細資料載入失敗時可重新載入", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderAttractionList([
    { ...TEST_ATTRACTIONS[0], id: "missing-attraction" },
  ]);

  await user.click(
    view.getByRole("button", { name: "查看「較遠景點」詳細資訊" }),
  );

  const dialog = await view.findByRole("dialog");
  assert.match(
    (await within(dialog).findByRole("alert")).textContent ?? "",
    /資料不完整/,
  );
  await user.click(
    within(dialog).getByRole("button", { name: "重新載入" }),
  );
  assert.match(
    (await within(dialog).findByRole("alert")).textContent ?? "",
    /資料不完整/,
  );
});
