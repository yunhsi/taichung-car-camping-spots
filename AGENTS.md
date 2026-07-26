# AGENTS.md

# 專案介紹

## 專案目的

本專案以臺中市觀光景點開放資料整理適合車泊旅人的免費景點，提供地區與主題篩選、
Google Maps 導航、距離排序、深色模式及本機收藏功能。

請優先遵循本文件的開發規範，維持程式碼一致性、可維護性與可讀性。

---

## 技術棧

### Framework

* Next.js 16（App Router）
* React 19

### Language

* TypeScript

### Styling

* Tailwind CSS 4
* Radix UI
* class-variance-authority
* clsx
* tailwind-merge
* Lucide React

### Code Quality

* ESLint
* TypeScript Compiler
* Node.js Test Runner
* Testing Library

---

# 開發原則

* 優先考慮程式碼可讀性，而非過度追求簡潔。
* 優先考慮可維護性，而非一次性完成。
* 優先重用既有元件，不要重複開發。
* 發現重複邏輯時，應主動提出抽離建議。
* 避免過度設計（Over Engineering）。
* 不要為了未來可能的需求提前加入複雜設計。
* 修改程式碼時應保持既有架構與風格一致。

---

# Next.js

## App Router

* 一律使用 App Router。
* 優先使用 Nested Layout。
* 使用 Route Groups 管理大型功能模組。

## Server Component

預設使用 Server Component。

只有需要以下情況時才改用 Client Component：

* 使用事件（Event Handler）
* 使用 `useState`
* 使用 `useEffect`
* 使用 Browser API
* 使用只能在瀏覽器執行的第三方套件

## Client Component

* 僅在需要互動時加入 `"use client"`。
* 避免整個頁面都成為 Client Component。

## Data Fetching

* Server Component 負責資料取得。
* 不要在純 UI Component 中直接呼叫 API。
* 避免不必要的 Client Fetch。
* 可分享、可回復的篩選狀態優先使用 URL Search Params。
* `localStorage` 等 Browser API 應封裝在 Client Component 或 feature 專屬模組。

---

# React

## Component

* 一律使用 Function Component。
* Component 保持單一職責。

避免：

* 一個 Component 同時負責資料取得、商業邏輯與畫面呈現。

建議拆分：

* Container（資料）
* Presentational（畫面）

Component 出現以下情況時應考慮拆分：

* 超過約 200 行程式碼
* JSX 巢狀過深
* 多個獨立區塊
* 有重複使用需求

行數是拆分訊號，不是硬性限制；應以元件責任是否清楚作為主要判斷。

---

## Hooks

* 只有真正需要共用邏輯時才建立 Custom Hook。
* 不要把只有一個 Component 使用的邏輯硬拆成 Hook。

---

## 狀態管理

優先順序：

1. Local State
2. URL Search Params
3. Server State
4. Global State

不要因為方便就使用全域狀態。

---

# TypeScript

## 必須遵守

* 啟用 Strict Mode 思維撰寫程式。
* 不得使用 `any`。
* 外部 API 資料優先使用 `unknown` 後再解析。
* 型別錯誤不得忽略。
* 不得使用 `@ts-ignore`。

## interface 與 type

遵循以下原則：

* 物件資料使用 `interface`
* Union、Utility Type 使用 `type`

例如：

```ts
interface Attraction {
  id: string;
  name: string;
}

type Theme = "nature" | "culture";
```

---

# 資料與資料流

## 專案資料

* 景點 CSV 是主要來源資料，位於
  `src/features/attractions/data/taichung-attraction.csv`。
* 不要直接手動修改由轉換流程產生的景點列表、詳細資料與主題 JSON。
* 修改來源資料或轉換規則後，執行 `npm run convert`。
* 轉換後應檢視產出差異，並執行 `npm run check`。
* Component 應依賴整理後的專案型別，不直接依賴 CSV 欄位或外部資料格式。

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
React Component
```

## 外部 API

目前沒有集中式遠端 API 層。未來新增 API 時：

* 不要直接在純 UI Component 中撰寫 `fetch`。
* API 呼叫、解析與 Normalize 應放在對應 feature 的 `data/` 或 `lib/`。
* 跨 feature 共用後再考慮建立 `services/`。
* 外部或不可信資料先以 `unknown` 接收並驗證，再轉成專案型別。
* Component 只接收整理完成的資料。

---

# 專案架構

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
│       ├── data/           # 功能資料來源與存取
│       ├── lib/            # 功能專屬邏輯
│       └── types.ts        # 功能型別
└── lib/                    # 跨功能共用工具
```

* 功能專屬程式優先放在對應的 `features/<feature>`。
* 只有跨功能使用的 UI 才放入 `components/ui`。
* 只有跨功能使用的工具才放入 `src/lib`。
* 不要為了預想需求建立空的頂層目錄或抽象層。

---

# 命名規則

## Component

使用 PascalCase。

例如：

```
AttractionCard
```

---

## Function

使用 camelCase。

例如：

```
getGoogleMapUrl
```

---

## Hook

以 `use` 開頭。

例如：

```
useSearchFilter
```

---

## Constant

使用 UPPER_SNAKE_CASE。

例如：

```
MAX_IMAGE_SIZE
```

---

## 檔名

* Component：PascalCase
* Hook：camelCase
* Utility：camelCase
* 功能型別集中於該 feature 的 `types.ts`
* 測試檔使用與受測對象相對應的 `*.test.ts` 或 `*.test.tsx`

---

# Coding Style

## Import 順序

依照以下順序：

1. Side effect 或測試環境初始化
2. Node.js built-in
3. React / Next
4. 第三方套件
5. Alias（`@/`）
6. 相對路徑

每個區塊之間保留一行空白。
同資料夾模組可使用相對路徑，其餘 `src/` 內模組優先使用 `@/` Alias。

---

## Tailwind CSS

* 避免 inline style。
* 避免重複 className。
* Component 優先使用 `bg-surface`、`text-foreground`、`text-muted` 等 semantic token。
* 不要在 Component 直接使用色碼或 Tailwind palette 顏色。
* 新增顏色時，在 `globals.css` 同時定義 light 與 dark theme token。
* UI variants 使用 class-variance-authority；條件樣式與 class 合併使用 `cn()`。
* 優先擴充 `components/ui` 既有元件，不要重做 Button、Dialog、Tooltip 等基礎元件。

---

## Error Handling

不要忽略例外。

只有在能夠復原、補充錯誤脈絡，或位於應用程式邊界時才捕捉例外；
其他情況讓錯誤自然向上傳遞，不要加入沒有處理價值的 `try/catch`。

不要：

```ts
catch {}
```

---

## Console

提交前不得保留：

* `console.log`
* `console.debug`

除非為必要錯誤紀錄。

---

## 註解

註解應說明：

* 為什麼（Why）

不要說明：

* 做了什麼（What）

程式碼本身應足夠清楚。

---

## 可讀性

避免：

* 巢狀過深
* 過長函式
* Magic Number
* 不具意義的命名

複雜判斷請拆成獨立 Function。

---

# 重構

若發現：

* 相同邏輯出現兩次以上
* 相同 JSX 出現兩次以上
* Component 過大
* Function 過長
* Props 過多

請主動建議抽離：

* Component
* Hook
* Utility
* Constant

---

# 無障礙（Accessibility）

* 所有圖片必須提供 `alt`。
* Button 必須具有可辨識名稱。
* 適當使用 Semantic HTML。
* 表單應正確關聯 `label`。
* Dialog、Tooltip 等互動元件優先沿用 Radix UI 的鍵盤與焦點管理。
* 非同步錯誤或狀態更新應提供適當的 `role`、`aria-live` 或關聯描述。
* 關閉 Dialog 後，應盡可能將焦點還原至原觸發元素。

---

# 測試與驗證

## 測試

* 純函式與資料轉換使用 Node.js Test Runner。
* React 元件互動使用 Testing Library 與 `user-event`。
* 測試使用者可觀察的行為，避免依賴元件內部實作細節。
* 修改既有行為時，應新增或更新對應測試。
* Browser API 測試應沿用 `tests/testDom.ts` 的測試環境。

## 完成條件

一般程式修改完成後執行：

```bash
npm run check
```

`npm run check` 包含 ESLint、TypeScript 型別檢查及測試。

修改路由、Next.js 設定、Server/Client Component 邊界或正式建置相關內容時，
再執行：

```bash
npm run build
```

---

# AI Workflow

修改程式碼時：

* 優先修改最少範圍。
* 不要無關重構。
* 不要修改未要求的功能。
* 優先沿用既有架構與設計。
* 優先重用既有 Component、Hook 與 Utility。
* 若需求不明確，先提出可能方案，不要自行假設需求。
* 若有更佳做法，可於最後提出建議，但不要直接改動未要求的內容。
* 不要覆蓋或回復與目前需求無關的既有變更。
* 完成後執行與修改範圍相稱的驗證，避免未使用的變數、Import 或程式碼。
