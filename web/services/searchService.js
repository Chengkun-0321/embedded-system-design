// services/searchService.js
const fs = require("fs");
const csv = require("csv-parser");
const jieba = require("nodejieba");

/**
 * 從 CSV 搜尋資料（支援中文斷詞 + 權重 + 分頁）
 * @param {string} keyword 搜尋關鍵字
 * @param {number} page 第幾頁
 * @param {number} pageSize 每頁筆數
 * @returns {Promise<object>} 搜尋結果
 */
function searchFromCSV(keyword, page = 1, pageSize = 24) {
  return new Promise((resolve, reject) => {
    if (!keyword) {
      return resolve({ total: 0, totalPages: 0, currentPage: 1, data: [] });
    }

    const tokens = jieba.cut(keyword); // 例如「鮮蝦泡麵」→ ["鮮蝦", "泡麵"]
    console.log("🔍 斷詞結果：", tokens);

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
          const tokenLower = token.toLowerCase();
          for (const field in weights) {
            const value = (row[field] || "").toLowerCase();
            if (value.includes(tokenLower)) {
              score += weights[field];
            }
          }
        }

        if (score > 0) {
          row._score = score;
          results.push(row);
        }
      })
      .on("end", () => {
        results.sort((a, b) => b._score - a._score);

        const total = results.length;
        const totalPages = Math.ceil(total / pageSize);
        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        resolve({
          total,
          totalPages,
          currentPage: page,
          data: results.slice(start, end),
        });
      })
      .on("error", reject);
  });
}

module.exports = { searchFromCSV };