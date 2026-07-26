import { expect, test } from "@playwright/test";

test("無效、重複及未知篩選參數會導向 canonical URL", async ({ page }) => {
  await page.goto(
    "/?category=不存在&township=和平區&township=和平區&source=unknown",
  );

  await expect(page).toHaveURL("/?township=%E5%92%8C%E5%B9%B3%E5%8D%80");
  await expect(page.getByText("已選 1 項")).toBeVisible();
});

test("手機尺寸可展開與收合篩選條件", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const filterToggle = page.getByRole("button", { name: /篩選條件/ });

  await expect(filterToggle).toHaveAttribute("aria-expanded", "true");
  await filterToggle.click();
  await expect(filterToggle).toHaveAttribute("aria-expanded", "false");
  await filterToggle.click();
  await expect(page.getByRole("combobox", { name: "地區" })).toBeVisible();
});
