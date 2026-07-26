import assert from "node:assert/strict";
import test from "node:test";

import { testDom as dom } from "./testDom";

import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";

import { TooltipProvider } from "@/components/ui/Tooltip";
import { AttractionFilterPanel } from "@/features/attractions/components/AttractionFilterPanel/AttractionFilterPanel";

test.afterEach(() => {
  cleanup();
});

test("送出篩選時會建立可分享的查詢參數與結果錨點", async () => {
  const navigationCalls: Array<{
    href: string;
    options?: { scroll?: boolean };
  }> = [];
  const router: AppRouterInstance = {
    back: () => undefined,
    bfcacheId: "test",
    forward: () => undefined,
    prefetch: () => undefined,
    push: (href, options) => navigationCalls.push({ href, options }),
    refresh: () => undefined,
    replace: () => undefined,
  };
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(
    <AppRouterContext.Provider value={router}>
      <PathnameContext.Provider value="/">
        <TooltipProvider>
          <AttractionFilterPanel
            initialTownships={[]}
            initialCategories={[]}
            themeCategories={["公園綠地"]}
            townships={["和平區"]}
          />
          <div id="results" />
        </TooltipProvider>
      </PathnameContext.Provider>
    </AppRouterContext.Provider>,
  );

  await user.click(view.getByRole("combobox", { name: "地區" }));
  await user.click(view.getByRole("option", { name: "和平區" }));
  await user.click(view.getByRole("combobox", { name: "主題" }));
  await user.click(view.getByRole("option", { name: "公園綠地" }));
  await user.click(view.getByRole("button", { name: "套用篩選" }));

  assert.deepEqual(navigationCalls, [
    {
      href: "/?township=%E5%92%8C%E5%B9%B3%E5%8D%80&category=%E5%85%AC%E5%9C%92%E7%B6%A0%E5%9C%B0#results",
      options: { scroll: false },
    },
  ]);
});

test("清除篩選時會回到原始網址並平滑捲動至頁首", async () => {
  const navigationCalls: Array<{
    href: string;
    options?: { scroll?: boolean };
  }> = [];
  const scrollCalls: ScrollToOptions[] = [];
  const router: AppRouterInstance = {
    back: () => undefined,
    bfcacheId: "test",
    forward: () => undefined,
    prefetch: () => undefined,
    push: (href, options) => navigationCalls.push({ href, options }),
    refresh: () => undefined,
    replace: () => undefined,
  };
  const originalScrollTo = dom.window.scrollTo;

  Object.defineProperty(dom.window, "scrollTo", {
    configurable: true,
    value: (options: ScrollToOptions) => scrollCalls.push(options),
  });

  try {
    const user = userEvent.setup({ document: dom.window.document });
    const view = render(
      <AppRouterContext.Provider value={router}>
        <PathnameContext.Provider value="/">
          <TooltipProvider>
            <AttractionFilterPanel
              initialTownships={["和平區"]}
              initialCategories={[]}
              themeCategories={["公園綠地"]}
              townships={["和平區"]}
            />
          </TooltipProvider>
        </PathnameContext.Provider>
      </AppRouterContext.Provider>,
    );

    await user.click(
      view.getByRole("button", { name: "清除所有篩選" }),
    );

    assert.deepEqual(navigationCalls, [
      { href: "/", options: { scroll: false } },
    ]);
    assert.deepEqual(scrollCalls, [{ top: 0, behavior: "smooth" }]);
  } finally {
    Object.defineProperty(dom.window, "scrollTo", {
      configurable: true,
      value: originalScrollTo,
    });
  }
});
