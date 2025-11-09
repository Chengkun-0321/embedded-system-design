// 商品搜尋頁面：支援分頁、請求中止（避免競態）、錯誤處理與加入購物清單
import React, { useEffect, useRef, useState } from "react";

function Page1() {
  // 使用者輸入的關鍵字
  const [keyword, setKeyword] = useState("");
  // 後端回傳的搜尋結果清單
  const [results, setResults] = useState([]);
  // 請求進行中的旗標（用於按鈕禁用、顯示載入中文字）
  const [loading, setLoading] = useState(false);
  // 目前頁碼（從 1 開始）
  const [page, setPage] = useState(1);
  // 總頁數（由後端回傳）
  const [totalPages, setTotalPages] = useState(1);
  // 總筆數（由後端回傳）
  const [totalCount, setTotalCount] = useState(0);
  // 顯示給使用者的錯誤訊息（非中止錯誤）
  const [error, setError] = useState(null);

  // 取消舊請求，避免快切頁/重複搜尋造成競態
  const abortRef = useRef(null);
  // 與 UI 排版一致（6 欄 x 3 列）
  const PAGE_SIZE = 18;

  // 簡易提示（Toast）狀態：加入購物車成功/失敗顯示 1.5s
  const [toast, setToast] = useState({ show: false, type: "success", text: "" });
  const toastTimerRef = useRef(null);

  // 依據導覽列高度自動計算右上角提示與頂端距離，避免重疊
  const [navOffset, setNavOffset] = useState(24);
  useEffect(() => {
    const computeOffset = () => {
      const nav = document.querySelector('.navbar');
      if (nav) {
        const h = nav.getBoundingClientRect().height || 0;
        setNavOffset(Math.round(h + 16)); // nav 高度 + 16px 安全距
      } else {
        setNavOffset(24);
      }
    };
    computeOffset();
    window.addEventListener('resize', computeOffset);
    return () => window.removeEventListener('resize', computeOffset);
  }, []);

  // 清理：元件卸載時關閉尚未結束的 toast 計時器
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (text, type = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, text });
    toastTimerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, show: false }));
    }, 1500);
  };

  const handleSearch = (newPage = 1) => {
    // 無關鍵字時不送出請求
    if (!keyword.trim()) return;
    setLoading(true);
    setError(null);

    // 1) 中止上一個請求（若存在）
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    // 2) 以 POST + query 參數呼叫搜尋 API
    fetch(
      `/api/search?keyword=${encodeURIComponent(keyword)}&page=${newPage}&size=${PAGE_SIZE}`,
      {
        method: "POST",
        signal: controller.signal,
      }
    )
      .then((res) => res.json())
      .then((data) => {
        // 3) 正常回應：寫入清單、頁碼、總頁數/總筆數
        setResults(data.data || []);
        setPage(data.currentPage || newPage);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
        // UX：換頁或新搜尋後將畫面捲回上方
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((err) => {
        // 4) 被中止（切頁或再次搜尋）直接忽略，不視為錯誤
        if (err?.name === "AbortError") return;
        console.error("搜尋失敗：", err);
        setError("搜尋失敗，請稍後再試或更換關鍵字。");
      })
      .finally(() => {
        // 5) 清理旗標與 controller 參考
        setLoading(false);
        abortRef.current = null;
      });
  };

  const handlePageChange = (newPage) => {
    // 守門：頁碼必須介於 1..totalPages
    if (newPage < 1 || newPage > totalPages) return;
    handleSearch(newPage);
  };

  const handleAddToCart = (item) => {
    const payload = {
      id: item.id,
      title: item.title,
      uri: item.uri,
      price: item.price,
      quantity: 1,
    };
    // 將商品物件送到後端的購物車 API
    fetch("/api/product-add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        // 顯示右下角提示 1.5s
        showToast(`✅ 已加入購物清單：${item.title || "商品"}`);
      })
      .catch((err) => {
        console.error("加入購物清單失敗：", err);
        showToast("加入購物清單失敗", "error");
      });
  };

  return (
    <>
    <div style={{ padding: "20px", fontFamily: "Arial", textAlign: "center" }}>
      <h1>🛒 商品搜尋系統</h1>

      {/* 搜尋欄：輸入 + 按鈕，支援 Enter 觸發 */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(1);
            }
          }}
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
          disabled={loading || !keyword.trim()}
          style={{
            marginLeft: "10px",
            padding: "8px 16px",
            borderRadius: "6px",
            backgroundColor: loading || !keyword.trim() ? "#9CCC9C" : "#4CAF50",
            color: "white",
            border: "none",
            cursor: loading || !keyword.trim() ? "not-allowed" : "pointer",
          }}
        >
          搜尋
        </button>
      </div>

      {error && (
        <p style={{ color: "#d9534f", marginTop: 8 }}>{error}</p>
      )}
      {loading && <p>搜尋中，請稍候...</p>}

      {!loading && Array.isArray(results) && results.length > 0 ? (
        <>
          {/* 結果統計：顯示總筆數 */}
          <div style={{ marginBottom: 10 }}>
            <span>
              共 <b>{totalCount}</b> 筆結果
            </span>
          </div>
          {/* 商品卡片區：6 欄網格，置中排版 */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
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
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "370px", // 固定卡片高度
                  }}
                >
                  {/* 圖片區 */}
                  <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <a href={item.uri} target="_blank" rel="noopener noreferrer">
                      <img
                        src={item.first_image_uri}
                        alt={item.title}
                        style={{
                          maxHeight: "150px",
                          objectFit: "contain",
                          borderRadius: "6px",
                        }}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    </a>
                  </div>

                  {/* 商品名稱區 */}
                  <a
                    href={item.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2, // 最多顯示兩行
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontWeight: "bold",
                      margin: "8px 0",
                      color: "#0077cc",
                      textDecoration: "none",
                      minHeight: "45px", // ✅ 名稱區固定高度
                    }}
                  >
                    {item.title}
                  </a>

                  {/* 價格區 */}
                  <div style={{ minHeight: "40px" }}>
                    {item.originalPrice && item.originalPrice !== item.price ? (
                      <>
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
                        <p style={{ margin: "5px 0", fontSize: "16px", color: "#d9534f" }}>
                          NT$ {item.price}
                        </p>
                      </>
                    ) : (
                      <p style={{ margin: "20px 0 0", fontSize: "16px", color: "#d9534f" }}>
                        NT$ {item.price}
                      </p>
                    )}
                  </div>

                  {/* 加入購物車按鈕 */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    style={{
                      marginTop: "8px",
                      padding: "6px 12px",
                      backgroundColor: "#ff9800",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    🛒 加入購物清單
                  </button>

                  {/* 類別文字 */}
                  <p style={{ color: "#777", fontSize: "10px", marginTop: "10px", minHeight: "25px" }}>
                    {item.categories?.replace(/[\[\]]/g, "")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 分頁控制 */}
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
    {toast.show && (
      <div
        role="status"
        aria-live="polite"
        style={{
          position: "fixed",
          right: 24,
          top: navOffset,
          // 使用半透明背景，讓內容更輕盈但文字仍維持高對比
          backgroundColor:
            toast.type === "success"
              ? "rgba(46, 125, 50, 0.78)" // #2e7d32 → rgba(46,125,50,0.78)
              : "rgba(211, 47, 47, 0.78)", // #d32f2f → rgba(211,47,47,0.78)
          color: "#fff",
          padding: "10px 14px",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 1000,
          maxWidth: 360,
          lineHeight: 1.4,
          fontSize: 14,
          transition: "background-color 0.2s ease",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {toast.text}
      </div>
    )}
    </>
  );
}

export default Page1;