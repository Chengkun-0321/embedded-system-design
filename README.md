# HW2 — 前後端搜尋範例（Express + React)

這是一個採用 monorepo 結構的專案：
- `web/`：Node.js + Express 後端 API（商品搜尋、購物車範例）
- `web-mgt/`：React 前端（介面、搜尋、分頁與購物車操作）

完整檔案樹請見 `資料夾結構.txt`。

---

## 環境需求
- Node.js 18+（建議使用 LTS 版本）
- npm 8+

---

## 安裝與啟動

在專案根目錄執行：

```bash
# 1) 安裝相依套件（root、前後端都會準備好）
npm install

# 2) 同時啟動前後端（concurrently）
npm run dev
```json
{
  "proxy": "http://localhost:4000"
}
```
- 搜尋頁面在 `src/pages/page1.js`，包含分頁與加入購物車等邏輯。

---

## 疑難排解

### Proxy 錯誤（ECONNREFUSED / ECONNRESET）
- 現象：前端顯示 "Could not proxy request /api/... from localhost:3000 to http://localhost:4000"
- 可能原因：後端未啟動，或埠號不同。
- 檢查：
  1. 後端是否在 4000 埠啟動（`cd web && npm run dev`）
  2. `web-mgt/package.json` 的 `proxy` 是否為 `http://localhost:4000`

### React 開發模式 API 觸發兩次
- 原因：React 18 開發模式下 `StrictMode` 會造成部分 `useEffect` 先掛載→卸載→再掛載，用以檢測副作用。
- 建議：開發時可暫時移除 `StrictMode`，或在發出請求處加上 `useRef` 做一次性防護。Production 不會有此問題。

### 搜尋 API 呼叫格式不一致
- 目前後端使用 `POST /api/search` 並以 query 讀取 `keyword/page/size`。
- 若前端以 `GET /api/search?q=...` 呼叫，請擇一：
  1) 前端改用 `POST /api/search?keyword=...`；或
  2) 修改後端新增 `GET /api/search` 以支援 `q` 參數。

---

## 開發筆記
- 搜尋分詞使用 `nodejieba`，權重計算在 `web/services/searchService.js`。
- CSV 解析使用 `csv-parser`，檔案位於 `web/data/0_20000.csv`。

---

## 授權
此專案僅供課程與學習用途。

---

## 參考
- Express: https://expressjs.com/
- Create React App: https://create-react-app.dev/
- nodejieba: https://github.com/yanyiwu/nodejieba
- csv-parser: https://www.npmjs.com/package/csv-parser

分開啟動：

```bash
# 啟動後端（http://localhost:4000）
cd web
npm run dev      # 開發模式（nodemon）
# npm start     # 正式模式

# 啟動前端（http://localhost:3000）
cd web-mgt
npm start
```

---

## 可用 Scripts（摘要）

root (`HW2/`):
- `npm run dev`：以 concurrently 同時啟動 `web` 與 `web-mgt`

後端 `web/`：
- `npm run dev`：以 nodemon 啟動 `app.js`
- `npm start`：以 node 執行 `app.js`

前端 `web-mgt/`（Create React App）：
- `npm start`：開發伺服器（含 Hot Reload）
- `npm run build`：打包 production 靜態檔案
- `npm test`：執行測試

---

## API 文件（後端 `web/app.js`）
Base URL：`http://localhost:4000`

### 1) 取得本機使用者名稱
- Method：GET
- Path：`/api/username`
- Response 範例：
```json
{ "success": true, "username": "yourname" }
```

### 2) 搜尋商品
- Method：POST
- Path：`/api/search`
- Query 參數：
  - `keyword` (string) 必填：關鍵字
  - `page` (number) 選填，預設 1
  - `size` (number) 選填，預設 18
- 說明：目前以「查詢字串參數」提供搜尋條件（即使是 POST）。
- 來源資料：`web/data/0_20000.csv`，搜尋邏輯在 `web/services/searchService.js`
- 回應格式：
```json
{
  "total": 123,
  "totalPages": 7,
  "currentPage": 1,
  "data": [ { /* 商品欄位，含 _score */ } ]
}
```
- 範例：
```bash
curl -X POST "http://localhost:4000/api/search?keyword=餅乾&page=1&size=18"
```

> 注意：目前為 POST + query 的介面。如果你的前端是以 GET `/api/search?q=...` 呼叫，需調整為上方格式，或修改後端路由以支援 GET。

### 3) 購物車：新增商品
- Method：POST
- Path：`/api/product-add`
- Body：`application/json`，商品物件（至少需有 `id`）
- Response：
```json
{ "success": true, "cart": [ /* 當前購物車清單 */ ] }
```

### 4) 購物車：取得清單
- Method：GET
- Path：`/api/product-list`
- Response：
```json
[ /* 當前購物車清單 */ ]
```

### 5) 購物車：刪除商品
- Method：DELETE
- Path：`/api/product-delete/:id`
- Response：
```json
{ "success": true, "cart": [ /* 刪除後的購物車清單 */ ] }
```

---

## 前端（`web-mgt/`）重點
- 開發伺服器：`http://localhost:3000`
 - 在 `web-mgt/package.json` 設定 proxy：