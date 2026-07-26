import assert from "node:assert/strict";
import test from "node:test";

import { testDom as dom } from "./testDom";

import type { ReactNode } from "react";

import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ThemeToggleButton } from "@/components/site/ThemeToggleButton";
import { ToastProvider } from "@/components/ui/Toast";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { AccountMenuContent } from "@/features/auth/components/AccountMenuContent";
import { FavoritesNavigationLink } from "@/features/favorites/components/FavoritesNavigationLink";
import { UserDataProvider } from "@/features/user/components/UserDataProvider";

async function unusedAction() {}
const ORIGINAL_FETCH = globalThis.fetch;
const AUTHENTICATED_USER = {
  id: "user-1",
  email: "traveler@example.com",
  image: null,
  name: "測試旅人",
};

function AuthenticatedProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delay={0}>
      <ToastProvider>
        <UserDataProvider initialUser={AUTHENTICATED_USER}>
          {children}
        </UserDataProvider>
      </ToastProvider>
    </TooltipProvider>
  );
}

test.beforeEach(() => {
  globalThis.fetch = async (input) => {
    const url = new URL(String(input), "http://localhost");

    return url.pathname === "/api/favorites"
      ? Response.json({ favoriteAttractionIds: [] })
      : Response.json({ reviews: [] });
  };
});

test.afterEach(() => {
  cleanup();
  dom.window.document.documentElement.classList.remove("dark");
  dom.window.localStorage.clear();
});

test.after(() => {
  globalThis.fetch = ORIGINAL_FETCH;
});

test("Site Header 在所有版面只渲染一組收藏、主題與帳號控制", () => {
  const view = render(
    <AuthenticatedProviders>
      <div>
        <FavoritesNavigationLink />
        <ThemeToggleButton />
        <AccountMenuContent
          status="authenticated"
          user={AUTHENTICATED_USER}
          signInAction={unusedAction}
          signOutAction={unusedAction}
        />
      </div>
    </AuthenticatedProviders>,
  );

  assert.equal(
    view.getAllByRole("link", { name: "前往收藏頁" }).length,
    1,
  );
  assert.equal(
    view.getAllByRole("button", { name: "切換為深色模式" }).length,
    1,
  );
  assert.equal(view.queryByRole("button", { name: "開啟功能選單" }), null);
  assert.ok(view.getByRole("button", { name: "開啟帳號選單：測試旅人" }));
});

test("收藏在所有版面使用圓形按鈕，並為電腦版提供 Tooltip", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(
    <AuthenticatedProviders>
      <FavoritesNavigationLink />
    </AuthenticatedProviders>,
  );

  const favoritesLink = view.getByRole("link", { name: "前往收藏頁" });

  assert.ok(favoritesLink.classList.contains("rounded-full"));
  assert.equal(favoritesLink.classList.contains("rounded-md"), false);
  assert.equal(view.queryByText("我的收藏"), null);

  await user.hover(favoritesLink);

  const tooltip = await view.findByText("我的收藏");
  assert.equal(tooltip.textContent, "我的收藏");
  assert.ok(tooltip.classList.contains("md:block"));
  assert.ok(tooltip.classList.contains("z-90"));
});

test("主題控制在同一個按鈕中更新狀態", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(
    <TooltipProvider delay={0}>
      <ThemeToggleButton />
    </TooltipProvider>,
  );

  const themeButton = view.getByRole("button", { name: "切換為深色模式" });

  assert.ok(themeButton.classList.contains("rounded-full"));
  assert.equal(view.queryByText("切換為深色模式"), null);

  await user.hover(themeButton);

  const tooltip = await view.findByText("切換為深色模式");
  assert.ok(tooltip.classList.contains("md:block"));

  await user.click(themeButton);

  assert.ok(dom.window.document.documentElement.classList.contains("dark"));
  assert.ok(view.getByRole("button", { name: "切換為淺色模式" }));
});

test("Google 登入先說明會員功能，再由使用者決定是否繼續", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(
    <TooltipProvider delay={0}>
      <AccountMenuContent
        status="unauthenticated"
        signInAction={unusedAction}
        signOutAction={unusedAction}
      />
    </TooltipProvider>,
  );

  const loginButton = view.getByRole("button", { name: "使用 Google 登入" });

  assert.ok(loginButton.classList.contains("rounded-full"));
  assert.equal(loginButton.textContent, "");
  assert.equal(view.queryByText("Google 登入"), null);

  await user.hover(loginButton);

  const tooltip = await view.findByText("Google 登入");
  assert.ok(tooltip.classList.contains("md:block"));

  await user.unhover(loginButton);
  await user.click(loginButton);

  const dialog = view.getByRole("dialog", {
    name: "登入以解鎖會員功能",
  });
  assert.ok(dialog);
  assert.ok(view.getByText("收藏景點"));
  assert.ok(view.getByText("撰寫評論"));
  assert.ok(view.getByText("跨裝置同步"));

  await user.click(view.getByRole("button", { name: "先不用" }));
  assert.equal(
    view.queryByRole("dialog", { name: "登入以解鎖會員功能" }),
    null,
  );
  assert.equal(dom.window.document.activeElement, loginButton);
});

test("登出只顯示圓形 Icon，並提供不干擾鍵盤操作的 Tooltip", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(
    <TooltipProvider delay={0}>
      <AccountMenuContent
        status="authenticated"
        user={{ name: "測試旅人", image: null }}
        signInAction={unusedAction}
        signOutAction={unusedAction}
      />
    </TooltipProvider>,
  );

  await user.click(
    view.getByRole("button", { name: "開啟帳號選單：測試旅人" }),
  );

  const logoutButton = view.getByRole("button", { name: "登出" });

  assert.ok(logoutButton.classList.contains("rounded-full"));
  assert.equal(logoutButton.textContent, "");
  assert.equal(logoutButton.getAttribute("aria-describedby"), "logout-tooltip");

  const tooltip = view.getByRole("tooltip", { hidden: true });
  assert.equal(tooltip.textContent?.trim(), "登出");
  assert.ok(tooltip.classList.contains("md:group-hover/logout:block"));
  assert.equal(
    tooltip.classList.contains("md:group-focus-within/logout:block"),
    false,
  );
});

test("登入後可從頭像開啟帳號資訊，並以 Escape 關閉後還原焦點", async () => {
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(
    <AccountMenuContent
      status="authenticated"
      user={{
        name: "測試旅人",
        email: "traveler@example.com",
        image: null,
      }}
      signInAction={unusedAction}
      signOutAction={unusedAction}
    />,
  );

  const trigger = view.getByRole("button", {
    name: "開啟帳號選單：測試旅人",
  });
  await user.click(trigger);

  assert.ok(view.getByLabelText("帳號選單"));
  assert.ok(view.getByText("traveler@example.com"));
  assert.ok(view.getByRole("button", { name: "登出" }));

  await user.keyboard("{Escape}");

  assert.equal(view.queryByLabelText("帳號選單"), null);
  assert.equal(dom.window.document.activeElement, trigger);
});
