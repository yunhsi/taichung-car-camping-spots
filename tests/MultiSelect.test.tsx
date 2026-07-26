import assert from "node:assert/strict";
import test from "node:test";

import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JSDOM } from "jsdom";
import { useState } from "react";

import { MultiSelect } from "@/components/ui/MultiSelect";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost",
});

Object.defineProperties(globalThis, {
  document: {
    configurable: true,
    value: dom.window.document,
  },
  HTMLElement: {
    configurable: true,
    value: dom.window.HTMLElement,
  },
  Node: {
    configurable: true,
    value: dom.window.Node,
  },
  navigator: {
    configurable: true,
    value: dom.window.navigator,
  },
  PointerEvent: {
    configurable: true,
    value: dom.window.PointerEvent ?? dom.window.MouseEvent,
  },
  requestAnimationFrame: {
    configurable: true,
    value: (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    },
  },
  window: {
    configurable: true,
    value: dom.window,
  },
});

interface TestMultiSelectProps {
  initialValue?: string[];
}

function TestMultiSelect({ initialValue = [] }: TestMultiSelectProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <MultiSelect
      id="township-filter"
      label="地區"
      options={["和平區", "新社區"]}
      emptyOptionLabel="全部地區"
      value={value}
      onValueChange={setValue}
    />
  );
}

test.afterEach(() => {
  cleanup();
});

test("以滑鼠開啟後可按 Escape 關閉選項", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(<TestMultiSelect />);
  const trigger = view.getByRole("button", { name: "地區" });

  await user.click(trigger);
  assert.equal(trigger.getAttribute("aria-expanded"), "true");

  await user.keyboard("{Escape}");
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  assert.equal(dom.window.document.activeElement, trigger);
});

test("方向鍵會開啟選項並移動焦點", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(<TestMultiSelect />);
  const trigger = view.getByRole("button", { name: "地區" });

  trigger.focus();
  await user.keyboard("{ArrowDown}");

  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  assert.equal(
    dom.window.document.activeElement,
    view.getByRole("button", { name: "全部地區" }),
  );
});

test("離開元件後會關閉選項", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(
    <>
      <TestMultiSelect />
      <button type="button">下一個控制項</button>
    </>,
  );
  const trigger = view.getByRole("button", { name: "地區" });

  await user.click(trigger);
  view.getByRole("checkbox", { name: "新社區" }).focus();
  await user.tab();

  assert.equal(trigger.getAttribute("aria-expanded"), "false");
});

test("點擊整列選項可切換選取狀態", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(<TestMultiSelect />);

  await user.click(view.getByRole("button", { name: "地區" }));

  const option = view.getByRole("checkbox", { name: "新社區" });

  await user.click(option);
  assert.equal(option.getAttribute("aria-checked"), "true");

  await user.click(option);
  assert.equal(option.getAttribute("aria-checked"), "false");
});
