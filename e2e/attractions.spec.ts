import { expect, test } from "@playwright/test";

test("景點 Dialog 會同步瀏覽器歷史並還原焦點", async ({ page }) => {
  await page.goto("/");
  const detailsButton = page
    .getByRole("button", { name: /查看「.+」詳細資訊/ })
    .nth(8);

  await detailsButton.scrollIntoViewIfNeeded();
  const scrollPosition = await page.evaluate(() => window.scrollY);
  await detailsButton.click();

  await expect(page).toHaveURL(/attraction=/);
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect
    .poll(() =>
      dialog.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const topElement = document.elementFromPoint(
          bounds.left + bounds.width / 2,
          bounds.top + 4,
        );

        return topElement === element || element.contains(topElement);
      }),
    )
    .toBe(true);
  await page.getByRole("button", { name: "關閉" }).click();

  await expect(page).not.toHaveURL(/attraction=/);
  await expect(detailsButton).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThanOrEqual(scrollPosition - 2);

  await page.goForward();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("無效景點參數會保留列表並從網址移除", async ({ page }) => {
  const response = await page.goto("/?attraction=missing#results");

  expect(response?.status()).toBe(200);
  await expect(page).not.toHaveURL(/attraction=/);
  await expect(
    page.getByRole("button", { name: /查看「.+」詳細資訊/ }).first(),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("不存在的路徑會顯示自訂 404 頁面", async ({ page }) => {
  const response = await page.goto("/not-a-real-page");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "找不到這個頁面" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "回首頁探索景點" })).toBeVisible();
});

test("景點 API 提供列表、篩選選項與個別詳細資料", async ({ request }) => {
  const catalogResponse = await request.get("/api/attractions");
  const catalog: unknown = await catalogResponse.json();

  expect(catalogResponse.status()).toBe(200);

  if (!catalog || typeof catalog !== "object") {
    throw new Error("景點 API 回應格式不正確。");
  }

  const catalogRecord = catalog as Record<string, unknown>;

  expect(Array.isArray(catalogRecord.attractions)).toBe(true);
  expect(Array.isArray(catalogRecord.townships)).toBe(true);
  expect(Array.isArray(catalogRecord.themeCategories)).toBe(true);

  const firstAttraction = Array.isArray(catalogRecord.attractions)
    ? catalogRecord.attractions[0]
    : null;

  if (
    !firstAttraction ||
    typeof firstAttraction !== "object" ||
    typeof (firstAttraction as Record<string, unknown>).id !== "string"
  ) {
    throw new Error("景點列表缺少可用的景點編號。");
  }

  const attractionId = (firstAttraction as Record<string, string>).id;
  const detailResponse = await request.get(
    `/api/attractions/${encodeURIComponent(attractionId)}`,
  );
  const missingResponse = await request.get("/api/attractions/not-found");

  expect(detailResponse.status()).toBe(200);
  expect(await detailResponse.json()).toMatchObject({
    attraction: { id: attractionId },
  });
  expect(missingResponse.status()).toBe(404);
});
