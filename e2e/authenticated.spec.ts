import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("登入會員 E2E 需要 DATABASE_URL。");
}

const USER_ID = randomUUID();
const SESSION_TOKEN = randomUUID();
const USER_NAME = "E2E 測試旅人";
const REVIEW_COMMENT = `E2E 評論 ${randomUUID()}`;
const pool = new Pool({ connectionString: DATABASE_URL });

test.describe.serial("登入會員雲端資料流程", () => {
  test.beforeAll(async () => {
    await pool.query(
      `
        INSERT INTO users (id, name, email)
        VALUES ($1, $2, $3)
      `,
      [USER_ID, USER_NAME, `${USER_ID}@example.test`],
    );
    await pool.query(
      `
        INSERT INTO sessions (session_token, user_id, expires)
        VALUES ($1, $2, $3)
      `,
      [SESSION_TOKEN, USER_ID, new Date(Date.now() + 60 * 60 * 1000)],
    );
  });

  test.afterAll(async () => {
    await pool.query("DELETE FROM api_rate_limits WHERE key LIKE $1", [
      `%:${USER_ID}`,
    ]);
    await pool.query("DELETE FROM users WHERE id = $1", [USER_ID]);
    await pool.end();
  });

  test.beforeEach(async ({ baseURL, context }) => {
    if (!baseURL) {
      throw new Error("Playwright baseURL is not configured.");
    }

    await context.addCookies([
      {
        name: "authjs.session-token",
        value: SESSION_TOKEN,
        url: baseURL,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
  });

  test("登入會員可收藏景點並在收藏頁讀取雲端狀態", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: `開啟帳號選單：${USER_NAME}` }),
    ).toBeVisible();

    const firstCard = page.locator("article").first();
    const attractionName = await firstCard.getByRole("heading").innerText();
    const favoriteButton = firstCard.getByRole("button", {
      name: `收藏「${attractionName}」`,
    });

    await expect(favoriteButton).toBeEnabled();
    await favoriteButton.click();
    await expect(
      firstCard.getByRole("button", {
        name: `取消收藏「${attractionName}」`,
      }),
    ).toHaveAttribute("aria-pressed", "true");

    const favoriteRows = await pool.query<{ attractionId: string }>(
      `
        SELECT attraction_id AS "attractionId"
        FROM favorites
        WHERE user_id = $1
      `,
      [USER_ID],
    );
    expect(favoriteRows.rows).toHaveLength(1);

    await page.getByRole("link", { name: "前往收藏頁" }).click();
    await expect(page).toHaveURL("/favorites");
    await expect(
      page.getByRole("heading", { name: attractionName }),
    ).toBeVisible();
  });

  test("登入會員可新增、公開讀取、更新及刪除自己的評論", async ({ page }) => {
    await page.goto("/");
    const firstCard = page.locator("article").first();
    const attractionName = await firstCard.getByRole("heading").innerText();

    await firstCard
      .getByRole("button", { name: `查看「${attractionName}」的評分與評論` })
      .click();
    const publicDialog = page.getByRole("dialog", {
      name: `「${attractionName}」評分與評論`,
    });
    await expect(publicDialog).toBeVisible();
    await publicDialog
      .getByRole("button", { name: `為「${attractionName}」評分` })
      .click();

    const editorDialog = page.getByRole("dialog", {
      name: `新增「${attractionName}」的評分`,
    });
    await editorDialog
      .locator('label:has(input[aria-label="5 顆星"])')
      .click();
    await editorDialog.getByLabel("留言評論").fill(REVIEW_COMMENT);
    await editorDialog.getByRole("button", { name: "送出評論" }).click();
    await expect(editorDialog).toBeHidden();
    await expect(publicDialog.getByText(REVIEW_COMMENT)).toBeVisible();

    const createdReview = await pool.query<{
      comment: string;
      rating: number;
    }>(
      `
        SELECT rating, comment
        FROM reviews
        WHERE user_id = $1
      `,
      [USER_ID],
    );
    expect(createdReview.rows).toEqual([
      { rating: 5, comment: REVIEW_COMMENT },
    ]);

    await publicDialog
      .getByRole("button", {
        name: `修改「${attractionName}」的評分與評論`,
      })
      .click();
    const updateDialog = page.getByRole("dialog", {
      name: `修改「${attractionName}」的評分`,
    });
    await updateDialog
      .locator('label:has(input[aria-label="4 顆星"])')
      .click();
    await updateDialog.getByLabel("留言評論").fill(`${REVIEW_COMMENT} 更新`);
    await updateDialog.getByRole("button", { name: "更新評論" }).click();
    await expect(publicDialog.getByText(`${REVIEW_COMMENT} 更新`)).toBeVisible();

    await publicDialog
      .getByRole("button", {
        name: `修改「${attractionName}」的評分與評論`,
      })
      .click();
    const deleteDialog = page.getByRole("dialog", {
      name: `修改「${attractionName}」的評分`,
    });
    await deleteDialog.getByRole("button", { name: "刪除評論" }).click();
    await deleteDialog.getByRole("button", { name: "確定刪除" }).click();
    await expect(deleteDialog).toBeHidden();
    await expect(publicDialog.getByText(`${REVIEW_COMMENT} 更新`)).toHaveCount(0);

    await expect
      .poll(async () => {
        const deletedReview = await pool.query(
          "SELECT 1 FROM reviews WHERE user_id = $1",
          [USER_ID],
        );

        return deletedReview.rowCount;
      })
      .toBe(0);
  });

  test("收藏與評論寫入超過會員額度時回傳 429 與 Retry-After", async ({
    page,
  }) => {
    let favoriteResponse = await page.request.patch("/api/favorites", {
      data: {},
    });

    for (let requestIndex = 0; requestIndex < 60; requestIndex += 1) {
      favoriteResponse = await page.request.patch("/api/favorites", {
        data: {},
      });

      if (favoriteResponse.status() === 429) {
        break;
      }
    }

    expect(favoriteResponse.status()).toBe(429);
    expect(
      Number(favoriteResponse.headers()["retry-after"]),
    ).toBeGreaterThan(0);

    let reviewResponse = await page.request.post("/api/reviews", { data: {} });

    for (let requestIndex = 0; requestIndex < 20; requestIndex += 1) {
      reviewResponse = await page.request.post("/api/reviews", { data: {} });

      if (reviewResponse.status() === 429) {
        break;
      }
    }

    expect(reviewResponse.status()).toBe(429);
    expect(Number(reviewResponse.headers()["retry-after"])).toBeGreaterThan(0);
  });
});
