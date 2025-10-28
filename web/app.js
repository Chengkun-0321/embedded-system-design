const express = require('express');
const cors = require('cors');
const os = require('os');
const { log } = require('console');
const app = express();
const port = 4000;

app.use(cors());

// Logger Middleware
app.use((req, res, next) => {
  const now = new Date().toISOString(); // 時間戳記
  console.log(`[${now}] ${req.method} ${req.url}`);
  next(); // 繼續交給後面的路由
});

// API：取得本機使用者名稱
app.get('/api/username', (req, res) => {
    try {
        const username = os.userInfo().username;
        res.status(200).json({ success: true, username: username });
    } catch (err) {
        res.status(500).json({ success: false, error: "無法取得使用者名稱" });
    }
});

// API：回傳 Hello
app.get('/api/hello', (req, res) => {
    res.status(200).json({ success: true, message: "Hello from backend 🚀" });
});

app.listen(port, () => {
  console.log(`後端啟動於：http://localhost:${port}`);
});