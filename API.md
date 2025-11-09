# API 快速對照表

基底 URL：`http://localhost:4000`

> 詳細呼叫方式（含回應 JSON 與前端 fetch 範例）請見 README 的「API 一覽（如何呼叫）」章節。

## 總覽

| 方法 | URL | Query / Path 參數 | Body | 回應 | 備註 |
|---|---|---|---|---|---|
| GET | `/api/username` | — | — | `{"success":boolean, "username"?:string}` | 取得本機使用者名稱 |
| POST | `/api/search` | `keyword`(必), `page`(選), `size`(選) | — | `{ total, totalPages, currentPage, data: [] }` | 參數走 URL Query，無 Body |
| POST | `/api/product-add` | — | `{ id, title, price, ... }` | `{ success, cart: [] }` | 若同 ID 已存在，quantity +1 |
| GET | `/api/product-list` | — | — | `[]` | 目前購物清單陣列 |
| DELETE | `/api/product-delete/:id` | `:id`(必) | — | `{ success, cart: [] }` | 以 ID 刪除 |
| POST | `/api/export-cart` | — | `{ cart: [], selected: [] }` | `application/pdf` | 回應為 PDF 檔（下載） |

## 極簡 curl 範例

```bash
# 1) 使用者名稱
curl -s http://localhost:4000/api/username

# 2) 搜尋（POST + Query）
curl -s -X POST "http://localhost:4000/api/search?keyword=筆記型電腦&page=1&size=18" \
  -H 'Content-Type: application/json'

# 3) 加入購物清單
curl -s -X POST http://localhost:4000/api/product-add \
  -H 'Content-Type: application/json' \
  -d '{"id":"P001","title":"商品 A","price":100}'

# 4) 取得購物清單
curl -s http://localhost:4000/api/product-list

# 5) 刪除指定商品
curl -s -X DELETE http://localhost:4000/api/product-delete/P001

# 6) 匯出 PDF（下載到 cart.pdf）
curl -X POST http://localhost:4000/api/export-cart \
  -H 'Content-Type: application/json' \
  -d '{"cart":[{"id":"P001","title":"商品 A","price":100,"quantity":2}],"selected":["P001"]}' \
  --output cart.pdf
```
