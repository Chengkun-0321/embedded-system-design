import React, { useState } from "react";

function Page1() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleSearch = (newPage = 1) => {
    if (!keyword.trim()) return;
    setLoading(true);

    fetch(`/api/search?keyword=${encodeURIComponent(keyword)}&page=${newPage}`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        setResults(data.data || []);
        setPage(data.currentPage || newPage);
        setTotalPages(data.totalPages || 1);
      })
      .catch((err) => {
        console.error("搜尋失敗：", err);
      })
      .finally(() => setLoading(false));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    handleSearch(newPage);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", textAlign: "center" }}>
      <h1>🛒 商品搜尋系統</h1>

      {/* 🔍 搜尋欄 */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="輸入商品關鍵字..."
          style={{
            padding: "8px",
            width: "300px",
            fontSize: "16px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={() => handleSearch(1)}
          style={{
            marginLeft: "10px",
            padding: "8px 16px",
            borderRadius: "6px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          搜尋
        </button>
      </div>

      {loading && <p>搜尋中，請稍候...</p>}

      {!loading && Array.isArray(results) && results.length > 0 ? (
        <>
          {/* 商品卡片區：6 個一行，置中 */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: "20px",
                width: "100%", // 控制整體寬度
                maxWidth: "1500px",
              }}
            >
              {results.map((item, i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "10px",
                    textAlign: "center",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  }}
                >
                  <a href={item.uri} target="_blank" rel="noopener noreferrer">
                    <img
                      src={item.first_image_uri}
                      alt={item.title}
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "contain",
                        borderRadius: "6px",
                      }}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </a>

                  <a
                    href={item.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      fontWeight: "bold",
                      margin: "8px 0",
                      color: "#0077cc",
                      textDecoration: "none",
                    }}
                  >
                    {item.title}
                  </a>

                  <p style={{ margin: "5px 0", fontSize: "16px", color: "#d9534f" }}>
                    NT$ {item.price}
                  </p>

                  {item.originalPrice && item.originalPrice !== item.price && (
                    <p
                      style={{
                        textDecoration: "line-through",
                        color: "#999",
                        margin: "0",
                        fontSize: "14px",
                      }}
                    >
                      原價 NT$ {item.originalPrice}
                    </p>
                  )}

                  <p style={{ color: "#555", fontSize: "14px", marginTop: "8px" }}>
                    {item.brands?.replace(/[\[\]]/g, "")}
                  </p>
                  <p style={{ color: "#777", fontSize: "13px" }}>
                    {item.categories?.replace(/[\[\]]/g, "")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 📄 分頁控制 */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              style={{
                padding: "6px 12px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                backgroundColor: page <= 1 ? "#eee" : "#4CAF50",
                color: page <= 1 ? "#999" : "white",
                cursor: page <= 1 ? "not-allowed" : "pointer",
              }}
            >
              ← 上一頁
            </button>

            <span>
              第 <b>{page}</b> / {totalPages} 頁
            </span>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              style={{
                padding: "6px 12px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                backgroundColor: page >= totalPages ? "#eee" : "#4CAF50",
                color: page >= totalPages ? "#999" : "white",
                cursor: page >= totalPages ? "not-allowed" : "pointer",
              }}
            >
              下一頁 →
            </button>
          </div>
        </>
      ) : (
        !loading && <p>🔎 請輸入關鍵字進行搜尋。</p>
      )}
    </div>
  );
}

export default Page1;