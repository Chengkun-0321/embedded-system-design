// services/searchService_v2.js
const fs = require("fs");
const csv = require("csv-parser");
const jieba = require("nodejieba");

// 簡單的時間戳記 log（與後端全域日誌風格一致）
function logTs(...args) {
  try {
    console.log(`[${new Date().toISOString()}]`, ...args);
  } catch (_) {
    // ignore
  }
}

/**
 * 從 CSV 檔案搜尋資料（支援中文斷詞 + 權重 + 分頁）
 *
 * 合約（Contract）
 * - 輸入：
 *   - keyword: string（必填，將做 jieba 斷詞）
 *   - page: number >= 1（預設 1）
 *   - pageSize: number >= 1（預設 24）
 * - 輸出：
 *   {
 *     total: number,        // 總筆數
 *     totalPages: number,   // 總頁數
 *     currentPage: number,  // 當前頁碼
 *     data: Array<object>   // 分頁資料（含 _score 欄位）
 *   }
 * - 失敗：reject(Error) 或回傳空集合（當 keyword 為空）
 */
function searchFromCSV(keyword, page = 1, pageSize = 24) {
  return new Promise((resolve, reject) => {
    if (!keyword) {
      return resolve({ total: 0, totalPages: 0, currentPage: 1, data: [] });
    }

    // 斷詞（例如「鮮蝦泡麵」→ ["鮮蝦", "泡麵"]）
    const tokens = jieba.cut(keyword);
    logTs("🔍 斷詞結果：", tokens);

    const weights = {
      title: 0.5,
      categories: 2,
      description: 0.5,
    };

    const results = [];

    fs.createReadStream(__dirname + "/../data/0_20000.csv")
      .pipe(csv())
      .on("data", (row) => {
        let score = 0;
        for (const token of tokens) {
          let maxFieldScore = 0;
          const tokenLower = token.toLowerCase();

          for (const field in weights) {
            const value = (row[field] || "").toLowerCase();
            if (value.includes(tokenLower)) {
              maxFieldScore = Math.max(maxFieldScore, weights[field]);
            }
          }
          // 每個 token 只計算最高的欄位分數
          score += maxFieldScore;
        }

        if (score > 0) {
          row._score = score;
          results.push(row);
        }
      })
      .on("end", () => {
        results.sort((a, b) => {
          if (b._score !== a._score) {
            return b._score - a._score;
          }
          return (a.categories?.length || 100) - (b.categories?.length || 100);
        });

        const total = results.length;
        const totalPages = Math.ceil(total / pageSize);
        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        // 總結 log（摘要，不輸出全量資料）
        logTs(
          "🔎 搜尋完成",
          `keyword="${keyword}", tokens=${tokens.length}, total=${total}, page=${page}/${totalPages}, pageSize=${pageSize}`
        );

        resolve({
          total,
          totalPages,
          currentPage: page,
          data: results.slice(start, end),
        });
      })
      .on("error", (err) => {
        logTs("❌ 搜尋錯誤：", err?.message || err);
        reject(err);
      });
  });
}

module.exports = { searchFromCSV };