# 台中車泊景點

以臺中市觀光景點開放資料整理適合車泊旅人行前探索的免費景點，提供篩選、距離排序、景點詳情、Google Maps 導航，以及會員收藏與評論。

> [!IMPORTANT]
> 收錄景點具有停車場、公廁，且免門票或未標示收費，但不代表允許過夜或車泊。出發前請向管理單位確認開放時間、停車及過夜規定。

## 功能

- 依行政區與主題複選篩選景點，條件保存在 URL，方便分享與還原。
- 依行政區或目前位置距離排序；只有使用者主動選擇時才請求定位權限。
- 查看景點介紹、開放時間、地址、電話、停車資訊、官方連結與旅遊叮嚀。
- 使用 Google Maps 導航，並在目前結果中切換前後景點。
- 支援淺色、深色模式與響應式版面。
- 使用 Google 帳號登入，跨裝置同步收藏與自己的評論。
- 每位會員可為每個景點留下 1～5 星及最多 100 字的評論。
- 所有人皆可閱讀公開評論、評分摘要與星等分布，並依最新、最高或最低評分排序。
- 點擊評論者頭像可分頁查看該旅人的其他公開評論。
- 登入會員可檢舉他人的評論，選擇原因並填寫最多 200 字的補充說明。

## 頁面與網址

| 路徑或參數 | 用途 |
| --- | --- |
| `/` | 景點探索首頁 |
| `/favorites` | 登入會員的收藏清單 |
| `township` | 行政區篩選，可重複使用 |
| `category` | 主題篩選，可重複使用 |
| `attraction` | 直接開啟指定景點詳情 |

例如：

```text
/?township=和平區&category=公園綠地&attraction=<景點編號>
```

無效、重複或順序不一致的參數會轉為 canonical URL；不在目前篩選結果中的景點參數會被移除。

## 本機開發

### 環境需求

- Node.js 20、22 或 24 以上版本；建議使用 `.nvmrc` 指定的版本
- npm
- Docker Desktop

### 安裝

```bash
nvm use
npm ci
cp .env.example .env.local
docker compose up -d
npm run db:migrate
npm run db:check
npm run dev
```

開啟 <http://localhost:3000>。

### Google 登入

在 Google Cloud Console 建立「網頁應用程式」OAuth 2.0 用戶端，並設定回呼網址：

```text
http://localhost:3000/api/auth/callback/google
```

接著在 `.env.local` 設定：

```dotenv
DATABASE_URL=postgresql://app:local_dev_password@localhost:5432/taichung_car_camping
AUTH_URL=http://localhost:3000
AUTH_SECRET=<隨機安全字串>
AUTH_GOOGLE_ID=<Google Client ID>
AUTH_GOOGLE_SECRET=<Google Client Secret>
```

正式環境須加入正式網域的 OAuth 回呼網址。若部署平台無法自動判斷網站網址，可另外設定 `NEXT_PUBLIC_SITE_URL`。密鑰不得提交至版本控制。

## 景點資料

原始資料取自政府資料開放平臺的[臺中市觀光景點](https://data.gov.tw/dataset/85008)，由臺中市政府觀光旅遊局依[政府資料開放授權條款－第 1 版](https://data.gov.tw/license)提供。專案內的 CSV 是資料快照，不會自動跟隨來源更新。

主要來源檔：

```text
src/features/attractions/data/taichung-attraction.csv
```

轉換腳本保留同時具備停車場、公廁，且免費或未標示收費的景點，並排除不適合本專案定位的主題。執行後會產生：

- `taichung-attraction-list.json`：列表、篩選、排序與座標。
- `taichung-attraction-details.json`：景點介紹、停車資訊、叮嚀與外部連結。
- `taichung-theme-categories.json`：由入選景點產生的主題選項。

`taichung-townships.json` 是手動維護的行政區與排序資料。產出的三個 JSON 不應直接修改。

更新 CSV 或轉換規則後執行：

```bash
npm run convert
npm run check
```

並檢查產出 JSON 的差異與景點數量是否合理。

## 技術架構

- Next.js 16 App Router、React 19、TypeScript Strict Mode
- Tailwind CSS 4、shadcn/ui、Base UI、Lucide React
- Auth.js Google OAuth
- PostgreSQL 17、Drizzle ORM
- Node.js Test Runner、Testing Library、Playwright

```text
src/
├── app/             # 路由、Layout、API 與全域樣式
├── components/      # 網站框架與共用 UI
├── features/        # 景點、收藏、評論、會員與驗證功能
└── lib/             # 資料庫與跨功能工具

drizzle/             # PostgreSQL migrations
scripts/             # 景點資料轉換與資料庫檢查
tests/               # 單元與元件互動測試
e2e/                 # Playwright 瀏覽器流程
```

景點初始資料由 Server Component 整理；定位、Dialog 與其他瀏覽器互動由 Client Component 處理。會員、工作階段、收藏、評論、檢舉及 API 限流資料保存於 PostgreSQL。瀏覽器的 `localStorage` 只保存 `theme`。

## 常用指令

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 啟動開發伺服器 |
| `npm run build` | 建立正式版本 |
| `npm run start` | 啟動正式版本 |
| `npm run check` | 執行 ESLint、型別檢查與一般測試 |
| `npm run test:integration` | 驗證 PostgreSQL repository 與限流 |
| `npm run test:e2e` | 執行 Playwright 瀏覽器測試 |
| `npm run convert` | 驗證 CSV 並重新產生景點 JSON |
| `npm run db:generate` | 依 Drizzle schema 產生 migration |
| `npm run db:migrate` | 套用 migration |
| `npm run db:check` | 檢查資料庫連線、資料表與 migration |

首次執行 E2E 測試前安裝 Chromium：

```bash
npx playwright install chromium
```

開發規範與各類修改需要執行的驗證請參考 [AGENTS.md](./AGENTS.md)。

## 授權

臺中市觀光景點資料依政府資料開放授權條款使用。本專案目前未附獨立的程式碼開源授權；第三方套件各自適用其原始授權條款。
