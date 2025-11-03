const express = require('express');
const cors = require('cors');
const os = require('os');
const { searchFromCSV } = require("./services/searchService");
const { log } = require('console');
const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
  const now = new Date().toISOString(); // 時間戳記
  console.log(`[${now}] ${req.method} ${req.url}`);
  next(); // 繼續交給後面的路由
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


app.listen(port, () => {
  console.log(`後端啟動於：http://localhost:${port}`);
});