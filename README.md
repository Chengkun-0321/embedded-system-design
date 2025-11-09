# 嵌入式系統 HW2 — 服務網站（Node + React）

本專案是一個簡易的商品搜尋與購物清單系統，採用 Node.js/Express 建立後端 API，React（Create React App）建立前端管理介面。後端從 CSV 讀取商品資料並支援中文斷詞搜尋；前端提供商品管理與購物清單匯出（PDF）等功能。

## 核心特色
- 商品搜尋：從 `web/data/0_20000.csv` 讀取資料，使用 `nodejieba` 中文斷詞並計分排序，支援分頁。
- 購物清單：新增/刪除/數量調整，計算總金額。
- 匯出 PDF：前端傳遞選取項目至後端，透過 `Puppeteer` 以 HTML 轉 PDF（相容中文、表格與樣式）。
- 進階日誌：後端中介層記錄時間、請求方法、路徑、狀態碼、耗時與關注欄位摘要。

## 架構與技術
- 後端（Backend）：Node.js + Express
  - CSV 解析：`csv-parser`
  - 中文斷詞：`nodejieba`
  - 匯出 PDF（HTML 渲染）：`puppeteer`
- 前端（Frontend）：React + Bootstrap 5
  - 路由：`react-router-dom`
  - 樣式：原生 Bootstrap（含 Navbar、表格等）

## 環境需求
- Node.js 18+（建議 LTS）
- npm 8+

## 安裝與啟動

1) 安裝依賴
```bash
npm install
npm install --prefix web
npm install --prefix web-mgt
```

2) 開發模式同時啟動（後端 4000、前端 3000）
```bash
npm run dev
```

3) 個別啟動（可選）
```bash
# 後端
cd web
npm run dev

# 前端
cd ../web-mgt
npm start
```

前端已在 `web-mgt/package.json` 設定 `proxy: http://localhost:4000`，可直接以 `/api/...` 呼叫後端。

## API 一覽（詳情請見 API.md）
基底 URL：`http://localhost:4000`

預設 Header（除非另有說明）：`Content-Type: application/json`

### 1) 取得本機使用者名稱
- 方法與 URL：GET `/api/username`
- 請求：無 Body
- 回應 JSON 範例：
  ```json
  { "success": true, "username": "your-mac-username" }
  ```
- curl：
  ```bash
  curl -s http://localhost:4000/api/username
  ```

### 2) 商品搜尋（CSV + 中文斷詞）
- 方法與 URL：POST `/api/search?keyword=關鍵字&page=1&size=18`
- Query 參數：
  - `keyword`（必填）：搜尋關鍵字
  - `page`（選填，預設 1）：第幾頁（1-base）
  - `size`（選填，預設 18）：每頁筆數
- Body：無（參數走 URL Query）
- 回應 JSON 範例：
  ```json
  {
    "total": 123,
    "totalPages": 7,
    "currentPage": 1,
    "data": [ { "id": "P001", "title": "商品 A", "price": 100 }, { "id": "P002", "title": "商品 B", "price": 200 } ]
  }
  ```
- curl：
  ```bash
  curl -s -X POST "http://localhost:4000/api/search?keyword=筆記型電腦&page=1&size=18" \
    -H 'Content-Type: application/json'
  ```
- 前端 fetch（瀏覽器）：
  ```js
  const res = await fetch('/api/search?keyword=筆記型電腦&page=1&size=18', { method: 'POST' });
  const data = await res.json();
  ```

### 3) 加入購物清單
- 方法與 URL：POST `/api/product-add`
- Body JSON（必要欄位請依實際商品資料）：
  ```json
  { "id": "P001", "title": "商品 A", "price": 100 }
  ```
- 行為：若清單已有相同 `id`，該品項 `quantity` 自動 +1。
- 回應 JSON 範例：
  ```json
  { "success": true, "cart": [ { "id": "P001", "title": "商品 A", "price": 100, "quantity": 2 } ] }
  ```
- curl：
  ```bash
  curl -s -X POST http://localhost:4000/api/product-add \
    -H 'Content-Type: application/json' \
    -d '{"id":"P001","title":"商品 A","price":100}'
  ```

### 4) 取得購物清單
- 方法與 URL：GET `/api/product-list`
- 請求：無 Body
- 回應 JSON（陣列）：
  ```json
  [ { "id": "P001", "title": "商品 A", "price": 100, "quantity": 2 } ]
  ```
- curl：
  ```bash
  curl -s http://localhost:4000/api/product-list
  ```

### 5) 刪除購物清單內的指定商品
- 方法與 URL：DELETE `/api/product-delete/:id`
- Path 參數：`id` 為商品 ID
- 回應 JSON 範例：
  ```json
  { "success": true, "cart": [] }
  ```
- curl：
  ```bash
  curl -s -X DELETE http://localhost:4000/api/product-delete/P001
  ```

### 6) 匯出購物清單為 PDF
- 方法與 URL：POST `/api/export-cart`
- Header：
  - `Content-Type: application/json`
  - 若用 curl 下載：無需特別設 `Accept`，直接輸出檔案即可
- Body JSON：
  ```json
  {
    "cart": [
      { "id": "P001", "title": "商品 A", "price": 100, "quantity": 2 },
      { "id": "P002", "title": "商品 B", "price": 200, "quantity": 1 }
    ],
    "selected": ["P001", "P002"]
  }
  ```
  - `cart`：前端目前購物清單（包含 quantity）
  - `selected`：要匯出的商品 ID 清單（若提供，後端會據此過濾）
- 回應：`application/pdf`（會觸發下載）
- curl（下載成檔案）：
  ```bash
  curl -X POST http://localhost:4000/api/export-cart \
    -H 'Content-Type: application/json' \
    -d '{"cart":[{"id":"P001","title":"商品 A","price":100,"quantity":2}],"selected":["P001"]}' \
    --output cart.pdf
  ```
- 前端 fetch（瀏覽器下載 Blob）：
  ```js
  const res = await fetch('/api/export-cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart, selected })
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '購物清單.pdf';
  a.click();
  URL.revokeObjectURL(url);
  ```

## 前端頁面（web-mgt）
- Navbar：原生 Bootstrap，藏藍色主題；目前連結：首頁、商品搜尋服務、購物車服務。
- Page1：商品搜尋（配合 `/api/search`）。
- Page2：購物清單操作（新增/刪除/數量調整/全選/總金額），並可「匯出選取商品清單」（呼叫 `/api/export-cart` 下載 PDF）。
- Footer：深藍灰底 + 線條風格 icon（GitHub 佔位）。

## 資料與服務
- CSV 資料：`web/data/0_20000.csv`
- 搜尋服務：`web/services/searchService.js`
- PDF 服務（HTML→PDF）：`web/services/pdfPuppeteer.js`（匯出端點使用此方案，中文字型顯示較穩定）

## 開發筆記 / 常見問題（FAQ）
1) Puppeteer 首次啟動可能會下載 Chromium，時間稍長。若網路受限，可改走 jsPDF，但中文字型需額外嵌入。
2) PDF 下載為空或損毀：確認 `/api/export-cart` 回傳 Header 與 Buffer；目前已以 `puppeteer` 產生 PDF（`res.send(pdfBuffer)`）。
3) 搜尋效能：目前逐行讀 CSV；若資料量更大，可考慮預載索引或改為資料庫。
4) 前端 Proxy：確保前端 `npm start` 走 3000 埠、後端 4000 埠；如果手動改埠，需同步調整 `web-mgt/package.json` 的 proxy。

## 資料夾結構（簡覽）
更多含註解的結構請見根目錄 `資料夾結構.txt`。

```
HW2/
├─ web/          # 後端（Express）
└─ web-mgt/      # 前端（React）
```
