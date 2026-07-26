# 臺中車泊景點專案開發規範

本專案以臺中市觀光景點開放資料整理適合車泊旅人的免費景點，提供地區與主題篩選、
Google Maps 導航、距離排序、深色模式，以及儲存在瀏覽器中的收藏與評論功能。

修改程式碼時，優先遵循本文件與既有程式碼慣例；產品說明、路由與資料內容請參考
`README.md`。

## 技術棧

- Next.js 16（App Router）
- React 19
- TypeScript（Strict Mode）
- Tailwind CSS 4
- shadcn/ui（Base UI）
- class-variance-authority、clsx、tailwind-merge
- Lucide React
- ESLint、TypeScript Compiler
- Node.js Test Runner、Testing Library、user-event
- Playwright

## 開發原則

- 優先考慮可讀性與可維護性，不過度追求簡短。
- 優先重用既有 Component、Hook、Utility 與 semantic token。
- 保持既有架構與風格，不進行與需求無關的重構。
- 不為尚未出現的需求預先建立抽象層或複雜設計。
- 修改範圍應盡量小，但不能以犧牲正確性或測試為代價。
- 不覆蓋、回復或整理與目前需求無關的既有變更。

## Next.js 與 React

### Server 與 Client Component

- 一律使用 App Router，預設採用 Server Component。
- Route Groups 用於組織路由而不影響 URL；Nested Layout 用於共享路由區段的版面。
- 需要事件處理、React client hooks、Context、Browser API，或只能在瀏覽器執行的套件時，
  才加入 `"use client"`。
- 將 Client Component 邊界放在最接近互動需求的位置，避免整個頁面不必要地成為
  Client Component。

### 資料取得

- 初始頁面資料優先由 Server Component 取得與整理。
- 純 UI Component 不直接負責 API 呼叫或外部資料解析。
- 即時更新或只能從瀏覽器取得的資料可在 Client 端讀取，但應封裝在對應 feature 的
  `data/`、`lib/` 或專用 Hook。
- 外部或不可信資料先以 `unknown` 接收、驗證並 Normalize，再轉成專案型別。
- Component 只接收整理完成的資料，不直接依賴 CSV 欄位或外部 API 格式。

### Component 與 Hook

- 一律使用 Function Component，並保持責任清楚。
- Component 同時包含資料處理、複雜商業邏輯與多個獨立畫面區塊時，應考慮拆分。
- 超過約 200 行、JSX 巢狀過深或出現重複區塊，是檢視拆分的訊號，不是硬性限制。
- Custom Hook 可用於共用邏輯，或隔離具有獨立責任的複雜狀態與副作用。
- 不要只為縮短 Component 或搬移少量程式碼而機械式建立 Hook。

### 狀態管理

依狀態性質選擇管理方式：

- 僅影響單一元件或局部互動：Local State。
- 需要分享、書籤或重新整理後還原：URL Search Params。
- 來自伺服器或遠端來源：Server State。
- 真正跨多個功能且無法由上述方式合理管理：Global State。
- `localStorage` 等 Browser API 應封裝在 Client Component 或 feature 專屬模組。

不要只因傳遞方便就引入全域狀態。

## TypeScript

- `tsconfig.json` 必須維持 `strict: true`，不得忽略型別錯誤。
- 不得使用 `any`、`@ts-ignore` 或其他繞過型別檢查的做法。
- 外部資料使用 `unknown`，經過驗證與縮窄後再使用。
- 物件資料結構優先使用 `interface`。
- Union、Utility Type、mapped type 與需要組合的型別使用 `type`。
- 功能型別優先集中於對應 feature 的 `types.ts`；只有緊鄰單一元件使用的 props 型別可
  留在元件檔案中。

## 景點資料流程

主要來源檔為：

`src/features/attractions/data/taichung-attraction.csv`

以下檔案由轉換流程產生，不得直接手動修改：

- `taichung-attraction-list.json`
- `taichung-attraction-details.json`
- `taichung-theme-categories.json`

`taichung-townships.json` 是專案手動維護的行政區與排序資料，不由轉換腳本產生。

資料流程：

```text
CSV
↓
欄位與資料列驗證
↓
篩選及 Normalize
↓
產生 JSON
↓
轉成專案型別
↓
React Component
```

修改 CSV 或轉換規則後：

1. 執行 `npm run convert`。
2. 檢視三個產出 JSON 的差異與景點數量是否合理。
3. 執行 `npm run check`。

## 專案架構

本專案採 feature-first 架構：

```text
src/
├── app/                    # 路由、Layout 與全域樣式
├── components/
│   ├── site/               # 網站框架與導覽元件
│   └── ui/                 # 跨功能可重用的基礎 UI
├── features/
│   └── <feature>/
│       ├── components/     # 功能專屬畫面元件
│       ├── data/           # 功能資料來源、解析與儲存
│       ├── lib/            # 功能專屬邏輯
│       └── types.ts        # 功能型別
└── lib/                    # 跨功能共用工具
```

- 功能專屬程式優先放在對應的 `features/<feature>`。
- 只有跨功能使用的 UI 才放入 `components/ui`。
- 只有跨功能使用的工具才放入 `src/lib`。
- API 呼叫、解析與 Normalize 優先放在對應 feature 的 `data/` 或 `lib/`。
- 邏輯確實跨 feature 共用後，再考慮建立新的共用層。
- 不為預想需求建立空目錄或抽象層。

## 命名與檔案

- Component 與 Component 檔名：PascalCase，例如 `AttractionCard.tsx`。
- Function 與 Utility：camelCase，例如 `getGoogleMapUrl`。
- Hook 及其檔名：以 `use` 開頭，例如 `useFavorites.ts`。
- 模組層級常數：UPPER_SNAKE_CASE，例如 `MAX_IMAGE_SIZE`。
- 測試檔：與受測行為對應的 `*.test.ts` 或 `*.test.tsx`。

## Import

依照下列順序分組，各組之間保留一行：

1. Side effect 或測試環境初始化。
2. Node.js built-in。
3. React / Next.js。
4. 第三方套件。
5. Alias（`@/`）。
6. 相對路徑。

同資料夾模組可使用相對路徑；其他 `src/` 模組優先使用 `@/` Alias。型別匯入優先使用
`import type`，或在具名匯入中使用 `type` 修飾。

## 樣式與 UI

- 避免 inline style 與重複的 `className` 組合。
- Component 優先使用 `bg-surface`、`text-foreground`、`text-muted` 等 semantic token。
- 不在 Component 直接使用色碼或 Tailwind palette 顏色。
- 新增顏色時，在 `src/app/globals.css` 同時定義 light 與 dark theme token。
- 條件樣式與 class 合併使用 `cn()`。
- 多變體或可重用的 UI 元件使用 class-variance-authority；簡單的一次性條件樣式不必強制
  建立 variant。
- 優先擴充 `components/ui` 既有元件，不重做 Button、Dialog、Tooltip 等基礎元件。
- `components/ui` 是專案的 shadcn/ui 基礎層；互動 primitive 統一使用 Base UI。
- `app`、`features` 與 `components/site` 不得直接匯入 `@base-ui/react`，只能使用
  `@/components/ui` 封裝完成的元件。
- 不得新增 Radix UI dependency 或 import。

## 錯誤處理與可讀性

- 不忽略例外，也不得使用空的 `catch`。
- 只有在能復原、補充錯誤脈絡或位於應用程式邊界時捕捉例外；其他錯誤讓其向上傳遞。
- 提交前不得保留 `console.log` 或 `console.debug`；必要的錯誤紀錄除外。
- 註解用於說明決策原因或不直觀限制，不重述程式碼本身。
- 避免過深巢狀、過長函式、Magic Number 與不具意義的命名。
- 相同邏輯或 JSX 出現兩次以上時，評估抽離 Component、Hook、Utility 或 Constant；只有在
  能改善責任劃分或維護性時才進行抽離。

## 無障礙

- 資訊圖片提供有意義的 `alt`；裝飾圖片使用空的 `alt=""`。
- Button 與其他互動控制項必須具有可辨識名稱。
- 使用適當的 Semantic HTML，表單控制項應正確關聯 `label`。
- Dialog、Tooltip 等互動元件優先沿用 shadcn/ui 與 Base UI 的鍵盤、焦點及 ARIA 管理。
- 非同步錯誤或狀態更新應提供適當的 `role`、`aria-live` 或關聯描述。
- 關閉 Dialog 後，應盡可能將焦點還原至原觸發元素。

## 測試與驗證

### 測試原則

- 純函式與資料轉換使用 Node.js Test Runner。
- React 元件互動使用 Testing Library 與 `user-event`。
- Browser API 測試沿用 `tests/testDom.ts` 的測試環境。
- 測試使用者可觀察的行為，避免依賴元件內部實作細節。
- 修改既有行為時，新增或更新對應測試。
- 跨頁導航、URL 狀態、瀏覽器歷史或主要使用流程使用 Playwright E2E 測試。

### 完成條件

一般程式修改完成後執行：

```bash
npm run check
```

`npm run check` 包含 ESLint、TypeScript 型別檢查及 Node.js/Testing Library 測試。

修改下列內容時，再執行 `npm run build`：

- 路由、Layout 或 Next.js 設定。
- Server / Client Component 邊界。
- Metadata、靜態資源載入或正式建置相關內容。

修改下列行為時，再執行 `npm run test:e2e`：

- 跨頁導航或關鍵使用流程。
- URL Search Params、瀏覽器 history 或重新整理後的狀態還原。
- 難以由 Testing Library 可靠覆蓋的瀏覽器整合行為。

純文件修改不需要執行程式測試，但應檢查內容與目前的 `package.json`、目錄結構及實際命令
一致。

## AI 工作流程

- 修改前先閱讀相關檔案、既有測試及目前工作區差異。
- 低風險且不影響產品行為的細節，可依現有慣例合理判斷並在結果中說明。
- 若不同選項會顯著改變功能、資料、公開介面或使用者體驗，應先確認需求。
- 若發現更佳但不屬於需求範圍的做法，只在結果中提出建議，不直接改動。
- 完成後執行與修改範圍相稱的驗證，並移除未使用的變數、Import 與死碼。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
