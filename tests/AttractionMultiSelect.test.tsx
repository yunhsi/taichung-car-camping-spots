import assert from "node:assert/strict";
import test from "node:test";

import { testDom as dom } from "./testDom";

import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { AttractionMultiSelect } from "@/features/attractions/components/AttractionFilterPanel/AttractionMultiSelect";

interface TestAttractionMultiSelectProps {
  initialValue?: string[];
}

function TestAttractionMultiSelect({
  initialValue = [],
}: TestAttractionMultiSelectProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <AttractionMultiSelect
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
  const view = render(<TestAttractionMultiSelect />);
  const trigger = view.getByRole("combobox", { name: "地區" });

  await user.click(trigger);
  assert.equal(trigger.getAttribute("aria-expanded"), "true");

  await user.keyboard("{Escape}");
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  assert.equal(dom.window.document.activeElement, trigger);
});

test("方向鍵會開啟選項並移動焦點", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(<TestAttractionMultiSelect />);
  const trigger = view.getByRole("combobox", { name: "地區" });

  trigger.focus();
  await user.keyboard("{ArrowDown}");

  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  assert.equal(
    dom.window.document.activeElement,
    view.getByRole("option", { name: "全部地區" }),
  );
});

test("離開元件後會關閉選項", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(
    <>
      <TestAttractionMultiSelect />
      <button type="button">下一個控制項</button>
    </>,
  );
  const trigger = view.getByRole("combobox", { name: "地區" });

  await user.click(trigger);
  await user.click(view.getByRole("option", { name: "新社區" }));
  await user.tab();

  assert.equal(trigger.getAttribute("aria-expanded"), "false");
});

test("點擊整列選項可切換選取狀態", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(<TestAttractionMultiSelect />);

  await user.click(view.getByRole("combobox", { name: "地區" }));

  const option = view.getByRole("option", { name: "新社區" });

  await user.click(option);
  assert.equal(option.getAttribute("aria-selected"), "true");

  await user.click(option);
  assert.equal(option.getAttribute("aria-selected"), "false");
});

test("選擇全部選項會清除既有選擇", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(
    <TestAttractionMultiSelect initialValue={["和平區", "新社區"]} />,
  );
  const trigger = view.getByRole("combobox", { name: "地區" });

  await user.click(trigger);
  await user.click(view.getByRole("option", { name: "全部地區" }));

  assert.match(trigger.textContent ?? "", /全部地區/);
});
