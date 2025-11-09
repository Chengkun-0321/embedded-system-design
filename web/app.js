const express = require('express');
const cors = require('cors');
const os = require('os');
const { searchFromCSV } = require("./services/searchService");
const { generateCartPDF_HTML } = require("./services/pdfPuppeteer");
const { log } = require('console');
const app = express();
const port = 4000;


app.use(cors());
app.use(express.json());

// 進階請求記錄（包含查詢參數、JSON body、狀態碼與耗時）
app.use((req, res, next) => {
  const start = Date.now();
  const ts = new Date().toISOString();

  // 在回應結束後輸出最終資訊（可取得 statusCode）
  res.on('finish', () => {
    const duration = Date.now() - start;
    const parts = [
      `[${ts}]`,
      req.ip,
      req.method,
      req.originalUrl,
      String(res.statusCode),
      `${duration}ms`,
    ];

    // 只有在有內容時才附加，避免噪音過大
    if (req.query && Object.keys(req.query).length) {
      try { parts.push(`query=${JSON.stringify(req.query)}`); } catch {}
    }
    const isJson = (req.headers['content-type'] || '').includes('application/json');
    if (isJson && req.body && Object.keys(req.body).length) {
      try {
        // 只輸出關注欄位：id、title、quantity
        const b = req.body || {};
        const id = b.id ?? b.productId ?? b._id ?? 'N/A';
        const title = typeof b.title === 'string' ? b.title : (b.name ?? 'N/A');
        const quantity = b.quantity ?? 'N/A';
        parts.push(`body:id=${id},title=${String(title).slice(0,80)},quantity=${quantity}`);
      } catch {}
    }

    console.log(parts.join(' '));
  });

  next();
});

// 取得本機使用者名稱
app.get('/api/username', (req, res) => {
    try {
        const username = os.userInfo().username;
        res.status(200).json({ success: true, username: username });
    } catch (err) {
        res.status(500).json({ success: false, error: "無法取得使用者名稱" });
    }
})

// 商品搜尋服務：POST + URL Params 搜尋 API
app.post("/api/search", async (req, res) => {
  const keyword = (req.query.keyword || "").trim();
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 18;

  if (!keyword) {
    return res.status(400).json({ error: "缺少 keyword" });
  }

  try {
    console.log(`🔍 搜尋中: keyword="${keyword}", page=${page}, size=${size}`);
    const result = await searchFromCSV(keyword, page, size);
    res.json(result);
  } catch (err) {
    console.error("搜尋錯誤:", err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
});

let cart = [];

app.post("/api/product-add", (req, res) => {
  const product = req.body;
  const existing = cart.find((p) => p.id === product.id);
  if (existing) {
    existing.quantity += 1; // 已存在則數量 +1
  } else {
    product.quantity = 1;
    cart.push(product);
  }
  // 記錄加入購物車的商品摘要
  try {
    const { id, title } = product || {};
    console.log(`加入購物清單: id=${id ?? 'N/A'}, title=${title ?? 'N/A'}, quantity=${(existing?.quantity) || product?.quantity}`);
  } catch {}
  res.json({ success: true, cart });
});

app.get("/api/product-list", (req, res) => {
  try {
    console.log(`目前購物清單共 ${cart.length} 件`);
  } catch {}
  res.json(cart);
});

app.delete("/api/product-delete/:id", (req, res) => {
  const id = req.params.id;
  cart = cart.filter((p) => p.id !== id);
  console.log(`🗑 已刪除商品 ID: ${id}`);
  res.json({ success: true, cart });
});




app.post("/api/export-cart", async (req, res) => {
  try {
    const pdfBuffer = await generateCartPDF_HTML(req.body.cart, req.body.selected);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=cart.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF 產生失敗:", error);
    res.status(500).json({ message: "PDF 產生失敗" });
  }
});

app.listen(port, () => {
  console.log(`後端啟動於：http://localhost:${port}`);
});