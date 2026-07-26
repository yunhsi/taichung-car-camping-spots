import assert from "node:assert/strict";
import test from "node:test";

import { testDom as dom } from "./testDom";

import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ToastProvider, useToast } from "@/components/ui/Toast";

function ToastControls() {
  const { showToast } = useToast();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          showToast({
            title: "收藏成功",
            description: "景點已加入收藏。",
            variant: "success",
            duration: 0,
          })
        }
      >
        顯示成功通知
      </button>
      <button
        type="button"
        onClick={() =>
          showToast({
            title: "收藏失敗",
            variant: "error",
            duration: 0,
          })
        }
      >
        顯示失敗通知
      </button>
      <button
        type="button"
        onClick={() =>
          showToast({
            title: "短暫通知",
            variant: "success",
            duration: 10,
          })
        }
      >
        顯示短暫通知
      </button>
      <button
        type="button"
        onClick={() => {
          for (const title of ["通知一", "通知二", "通知三", "通知四"]) {
            showToast({ title, variant: "success", duration: 0 });
          }
        }}
      >
        顯示四則通知
      </button>
    </>
  );
}

function renderToastControls() {
  return render(
    <ToastProvider>
      <ToastControls />
    </ToastProvider>,
  );
}

test.afterEach(() => {
  cleanup();
});

test("成功與失敗通知使用適當的 live region", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderToastControls();

  await user.click(view.getByRole("button", { name: "顯示成功通知" }));
  await user.click(view.getByRole("button", { name: "顯示失敗通知" }));

  assert.match(view.getByRole("status").textContent ?? "", /收藏成功/);
  assert.match(view.getByRole("status").textContent ?? "", /景點已加入收藏/);
  assert.match(view.getByRole("alert").textContent ?? "", /收藏失敗/);
});

test("使用者可手動關閉通知", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderToastControls();

  await user.click(view.getByRole("button", { name: "顯示失敗通知" }));
  const toast = view.getByRole("alert");
  await user.click(within(toast).getByRole("button", { name: "關閉通知" }));

  assert.equal(view.queryByRole("alert"), null);
});

test("通知會在指定時間後自動消失", (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const view = renderToastControls();

  fireEvent.click(view.getByRole("button", { name: "顯示短暫通知" }));
  assert.match(view.getByRole("status").textContent ?? "", /短暫通知/);

  act(() => context.mock.timers.tick(10));

  assert.equal(view.queryByRole("status"), null);
});

test("相同通知會去重並重新排到最新位置", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderToastControls();

  await user.click(view.getByRole("button", { name: "顯示成功通知" }));
  await user.click(view.getByRole("button", { name: "顯示成功通知" }));

  assert.equal(view.getAllByRole("status").length, 1);
  assert.match(view.getByRole("status").textContent ?? "", /收藏成功/);
});

test("最多保留最近三則通知", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = renderToastControls();

  await user.click(view.getByRole("button", { name: "顯示四則通知" }));

  const visibleToasts = view.getAllByRole("status");
  assert.equal(visibleToasts.length, 3);
  assert.equal(view.queryByText("通知一"), null);
  assert.match(visibleToasts[0]?.textContent ?? "", /通知二/);
  assert.match(visibleToasts[2]?.textContent ?? "", /通知四/);
});
