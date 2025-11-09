// web/services/pdfGeneratorHTML.js
const puppeteer = require("puppeteer");

async function generateCartPDF_HTML(cart = [], selected = []) {
  // 計算總金額
  const totalAmount = cart.reduce((sum, item) => {
    return sum + Number(item.price) * Number(item.quantity);
  }, 0);

  const html = `
    <html>
      <head>
        <style>
          body { font-family: 'Microsoft JhengHei', sans-serif; }
          h2 { text-align: center; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ccc; padding: 8px; font-size: 12px; text-align: center; }
          th { background-color: #f5f5f5; }

          /* 備註欄變寬 */
          td.remark, th.remark {
            width: 25%;
            min-width: 120px;
            text-align: left;
          }
          td.title {
            text-align: left;
          }

          /* 底線 */
          .footer-line {
            border-top: 2px solid #333;
            margin-top: 20px;
            width: 100%;
          }

          .total {
            text-align: right;
            font-size: 14px;
            margin-top: 8px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <h2>🧾 購物清單</h2>
        <table>
          <thead>
            <tr>
              <th>✔</th>
              <th>商品名稱</th>
              <th>單價</th>
              <th>數量</th>
              <th>小計</th>
              <th class="remark">備註</th>
            </tr>
          </thead>
          <tbody>
            ${cart
              .map(
                (item) => `
              <tr>
                <td>${selected.includes(item.id) ? "✅" : ""}</td>
                <td class="title">${item.title || ""}</td>
                <td>NT$ ${item.price || 0}</td>
                <td>${item.quantity || 1}</td>
                <td>NT$ ${(item.price * item.quantity).toFixed(1)}</td>
                <td class="remark"></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <!-- 表格底部的線 -->
        <div class="footer-line"></div>

        <!-- 總金額 -->
        <div class="total">💰 總金額：NT$ ${totalAmount.toFixed(1)}</div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    displayHeaderFooter: false,
    margin: { top: "20px", bottom: "20px", left: "10px", right: "10px" },
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = { generateCartPDF_HTML };