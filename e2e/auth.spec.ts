import { expect, test } from "@playwright/test";

test("未登入時 Header 只顯示公開功能與登入入口", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const favoritesLink = page.getByRole("link", { name: "前往收藏頁" });
  const themeButton = page.getByRole("button", { name: /切換為.+模式/ });

  await expect(favoritesLink).toHaveCount(0);
  await expect(themeButton).toBeVisible();
  await expect(
    page.getByRole("button", { name: "使用 Google 登入" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "開啟功能選單" }),
  ).toHaveCount(0);

  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(favoritesLink).toHaveCount(0);
  await expect(themeButton).toBeVisible();
  await expect(themeButton).toHaveCount(1);

  await page.getByRole("button", { name: "使用 Google 登入" }).click();
  const signInDialog = page.getByRole("dialog", {
    name: "登入以解鎖會員功能",
  });
  await expect(signInDialog).toBeVisible();
  await expect(signInDialog.getByText("收藏景點")).toBeVisible();
  await expect(signInDialog.getByText("撰寫評論")).toBeVisible();
  await expect(signInDialog.getByText("跨裝置同步")).toBeVisible();
  await signInDialog.getByRole("button", { name: "先不用" }).click();
});

test("未登入造訪收藏頁會由路由導回首頁", async ({ page }) => {
  await page.goto("/favorites");

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("region", { name: "景點列表" })).toBeVisible();
});

test("未登入只能閱讀評論，不能取得個人資料或修改收藏評論", async ({
  page,
}) => {
  await page.goto("/");
  const firstCard = page.locator("article").first();
  const reviewSummaryButton = firstCard.getByRole("button", {
    name: /查看.+評分與評論/,
  });

  await expect(firstCard.getByText("旅人評分", { exact: true })).toBeVisible();
  await expect(
    firstCard.getByRole("button", { name: /收藏/ }),
  ).toHaveCount(0);
  await reviewSummaryButton.click();
  const reviewsDialog = page.getByRole("dialog", { name: /評分與評論/ });
  await expect(reviewsDialog).toBeVisible();
  await expect(
    reviewsDialog.getByRole("button", { name: /為.+評分|修改.+評分/ }),
  ).toHaveCount(0);
  await reviewsDialog.getByRole("button", { name: "關閉" }).click();
  const favoritesResponse = await page.request.get("/api/favorites");
  const reviewCreateResponse = await page.request.post("/api/reviews", {
    data: { attractionId: "unauthorized", rating: 4, comment: "不能新增" },
  });
  const reviewUpdateResponse = await page.request.patch("/api/reviews", {
    data: { attractionId: "unauthorized", rating: 4, comment: "不能新增" },
  });

  expect(favoritesResponse.status()).toBe(401);
  expect(reviewCreateResponse.status()).toBe(401);
  expect(reviewUpdateResponse.status()).toBe(401);
  expect(
    await page.evaluate(() => ({
      favorites: localStorage.getItem("favoriteAttractionIds"),
      reviews: localStorage.getItem("attractionReviews"),
    })),
  ).toEqual({ favorites: null, reviews: null });
});

test("帳號操作結果會顯示 Toast 並返回首頁", async ({ page }) => {
  await page.goto("/auth/result?status=login-success");

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("status")).toContainText("登入成功");
});

test("帳號操作失敗會顯示錯誤 Toast 並返回首頁", async ({ page }) => {
  await page.goto("/auth/result?error=Configuration");

  await expect(page).toHaveURL("/");
  await expect(
    page
      .getByRole("list", { name: "通知" })
      .getByRole("alert")
      .filter({ hasText: "登入失敗" }),
  ).toContainText("登入失敗");
});
