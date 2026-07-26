import assert from "node:assert/strict";
import test from "node:test";

import { testDom as dom } from "./testDom";

import type { ReactNode } from "react";

import { act, cleanup, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ToastProvider } from "@/components/ui/Toast";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { readAttractions } from "@/features/attractions/data/attractions";
import { FavoriteToggleButton } from "@/features/favorites/components/FavoriteToggleButton";
import {
  replaceFavoriteIds,
  setFavoritesLoaded,
} from "@/features/favorites/data/favoritesStore";
import { UserDataProvider } from "@/features/user/components/UserDataProvider";

const ORIGINAL_FETCH = globalThis.fetch;
const AUTHENTICATED_USER = {
  id: "user-1",
  email: "traveler@example.com",
  image: null,
  name: "測試旅人",
};

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}

function createDeferred<T>(): Deferred<T> {
  let resolvePromise: ((value: T) => void) | undefined;
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });

  return {
    promise,
    resolve(value) {
      resolvePromise?.(value);
    },
  };
}

function installFavoriteFetchMock(favoriteUpdate: Deferred<Response>) {
  const requests: Array<{ method: string; url: string }> = [];
  globalThis.fetch = async (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const method = init?.method ?? "GET";
    const requestUrl = new URL(url, "http://localhost");
    requests.push({ method, url: `${requestUrl.pathname}${requestUrl.search}` });

    if (requestUrl.pathname === "/api/favorites" && method === "GET") {
      return Response.json({ favoriteAttractionIds: [] });
    }

    if (requestUrl.pathname === "/api/favorites" && method === "PATCH") {
      return favoriteUpdate.promise;
    }

    if (requestUrl.pathname === "/api/reviews" && method === "GET") {
      return Response.json({ reviews: [] });
    }

    throw new Error(`未處理的測試請求：${method} ${requestUrl.pathname}`);
  };

  return requests;
}

function TestProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <ToastProvider>
        <UserDataProvider initialUser={AUTHENTICATED_USER}>
          {children}
        </UserDataProvider>
      </ToastProvider>
    </TooltipProvider>
  );
}

test.afterEach(() => {
  cleanup();
  globalThis.fetch = ORIGINAL_FETCH;
  replaceFavoriteIds([]);
  setFavoritesLoaded(false);
});

test("未登入不顯示收藏控制", () => {
  const view = render(
    <TooltipProvider>
      <ToastProvider>
        <FavoriteToggleButton attractionId="spot-1" attractionName="景點" />
      </ToastProvider>
    </TooltipProvider>,
  );

  assert.equal(
    view.queryByRole("button", { name: "收藏「景點」" }),
    null,
  );
});

test("收藏同步期間停用按鈕並避免重複請求", async () => {
  const attraction = readAttractions()[0];
  const favoriteUpdate = createDeferred<Response>();
  const requests = installFavoriteFetchMock(favoriteUpdate);
  const user = userEvent.setup({ document: dom.window.document });
  const view = render(
    <TestProviders>
      <FavoriteToggleButton
        attractionId={attraction.id}
        attractionName={attraction.name}
      />
    </TestProviders>,
  );
  const button = await view.findByRole("button", {
    name: `收藏「${attraction.name}」`,
  });

  await waitFor(() => {
    assert.equal((button as HTMLButtonElement).disabled, false);
  });

  await user.click(button);

  assert.equal(button.getAttribute("aria-busy"), "true");
  assert.equal((button as HTMLButtonElement).disabled, true);
  button.click();
  assert.equal(
    requests.filter(
      (request) =>
        request.method === "PATCH" && request.url === "/api/favorites",
    ).length,
    1,
  );

  await act(async () => {
    favoriteUpdate.resolve(Response.json({ success: true }));
  });

  await waitFor(() => {
    assert.equal(
      view.getByRole("button", {
        name: `取消收藏「${attraction.name}」`,
      }).getAttribute("aria-pressed"),
      "true",
    );
  });

  assert.ok(view.getByText("已加入收藏"));
  assert.ok(
    view.getByText(`已將「${attraction.name}」加入收藏。`),
  );

  await user.click(
    view.getByRole("button", {
      name: `取消收藏「${attraction.name}」`,
    }),
  );

  await waitFor(() => {
    assert.equal(
      view.getByRole("button", {
        name: `收藏「${attraction.name}」`,
      }).getAttribute("aria-pressed"),
      "false",
    );
  });

  assert.ok(view.getByText("已取消收藏"));
  assert.ok(
    view.getByText(`已將「${attraction.name}」移出收藏。`),
  );
});
