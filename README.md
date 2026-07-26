# 台中車泊景點

以臺中市觀光景點開放資料整理適合車泊旅人的免費景點，提供地區與主題篩選、Google Maps 導航、深色模式及本機收藏功能。

## 技術棧

- Next.js 16（App Router）
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI

## 專案結構

```text
src/
├── app/                    # 路由、頁面與全域樣式
├── components/
│   ├── site/               # 網站層級元件
│   └── ui/                 # 可重用的基礎 UI
├── features/
│   ├── attractions/
│   │   ├── components/     # 景點畫面元件
│   │   ├── data/           # 景點來源與轉換後資料
│   │   ├── lib/            # 篩選、識別與距離邏輯
│   │   └── types.ts
│   └── favorites/          # 收藏狀態、儲存與畫面元件
└── lib/                    # 跨功能共用工具
```

## 常用指令

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript 型別檢查
npm run test       # 核心邏輯測試
npm run check      # 依序執行以上所有檢查
npm run build      # Production build
npm run convert    # 由 CSV 重新產生景點與主題 JSON
```

## 資料處理

原始資料位於
`src/features/attractions/data/taichung-attraction.csv`。轉換腳本會：

1. 驗證必要欄位。
2. 保留同時提供停車場與公廁的景點。
3. 保留免費或未標示收費的景點。
4. 排除不適合車泊情境的主題分類。
5. 產生精簡的景點列表、以景點 ID 索引的詳細資料、主題清單與 Google Maps 網址。

產出的景點資料分為：

- `taichung-attraction-list.json`：列表顯示、篩選及排序所需欄位。
- `taichung-attraction-details.json`：以景點 ID 為 key 的名稱、介紹、停車資訊、旅遊叮嚀、相關連結及 Google Maps 網址。

前端開啟景點詳細視窗時，會動態載入本地詳細資料，並以列表項目的
`id` 取得對應內容。

重新產生資料後，請執行 `npm run check` 並檢視輸出差異。
