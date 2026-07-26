import assert from "node:assert/strict";
import test from "node:test";

import { testDom as dom } from "./testDom";

import { cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  renderAttractionList,
  setGeolocation,
} from "./attractionListTestUtils";

test.beforeEach(() => {
  dom.window.localStorage.clear();
  dom.window.history.replaceState(null, "", "/");
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

test("定位被拒絕時會顯示 Toast 並恢復行政區排序", async () => {
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

  const toast = view.getByRole("alert");
  assert.match(toast.textContent ?? "", /定位失敗/);
  assert.match(toast.textContent ?? "", /請允許瀏覽器使用定位/);
  assert.equal(
    (view.getByLabelText("排序方式") as HTMLSelectElement).value,
    "township",
  );
});

test("可從列表工具列查看景點入選條件", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderAttractionList();
  const criteriaButton = view.getByRole("button", {
    name: "景點收錄說明",
  });

  await user.click(criteriaButton);

  const dialog = await view.findByRole("dialog", {
    name: "景點收錄說明",
  });
  assert.ok(within(dialog).getByText("設有停車場"));
  assert.ok(within(dialog).getByText("設有公廁"));
  assert.ok(within(dialog).getByText("免門票或未標示門票收費"));

  await user.click(within(dialog).getByRole("button", { name: "關閉" }));

  assert.equal(dom.window.document.activeElement, criteriaButton);
});
