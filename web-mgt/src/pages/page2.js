import React, { useState, useEffect } from "react";

function Page2() {
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetch("/api/product-list")
      .then((res) => res.json())
      .then((data) => {
        const list = (data || []).map((item) => ({
          ...item,
          quantity: item.quantity || 1,
        }));
        setCart(list);
      });
  }, []);

  const handleToggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleQuantityChange = (id, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Number(item.quantity) + delta) }
          : item
      )
    );
  };

  // 刪除單一商品
  const handleDelete = (id) => {
    if (window.confirm("確定要刪除此商品嗎？")) {
      setCart((prev) => prev.filter((item) => item.id !== id));

      // 同步更新後端 (可選)
      fetch(`/api/product-delete/${id}`, { method: "DELETE" });
    }
  };

  const handleExport = () => {
    fetch("/api/export-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart, selected }),
    })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "購物清單.pdf";
        link.click();
      });
  };

  

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  return (
    <div style={{ padding: "40px", fontFamily: "Microsoft JhengHei" }}>
      <h1>🧾 我的購物清單</h1>

      {cart.length === 0 ? (
        <p>目前購物清單是空的 🛒</p>
      ) : (
        <>
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th scope="col">
                  <button
                    type="button"
                    className={`btn btn-sm btn-outline-${ selected.length === cart.length && cart.length > 0 ? "danger" : "success"}`}
                    style={{ width: "60px" }}
                    onClick={() => {
                      if (selected.length === cart.length) {
                        setSelected([]);      // 全不選
                      } else {
                        setSelected(cart.map((item) => item.id)); // 全選
                      }
                    }}
                  >
                    {selected.length === cart.length && cart.length > 0 ? "全不選" : "全選"}
                  </button>
                </th>
                <th scope="col">商品名稱</th>
                <th scope="col">單價</th>
                <th scope="col">數量</th>
                <th scope="col">小計</th>
                <th scope="col">操作</th>
              </tr>
            </thead>

            <tbody className="table-group-divider">
              {cart.map((item) => (
                <tr key={item.id}>
                  <th scope="row">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selected.includes(item.id)}
                      onChange={() => handleToggleSelect(item.id)}
                    />
                  </th>
                  <td>{item.title}</td>
                  <td>NT$ {item.price}</td>
                  <td>
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        disabled={item.quantity <= 1}
                        onClick={() => handleQuantityChange(item.id, -1)}
                      >
                        －
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleQuantityChange(item.id, +1)}
                      >
                        ＋
                      </button>
                    </div>
                  </td>
                  <td>NT$ {(item.price * item.quantity).toFixed(1)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      🗑 刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ textAlign: "right", marginRight: "20px" }}>
            💰 總金額：NT$ {total.toFixed(1)}
          </h3>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleExport}
            disabled={selected.length === 0}
            style={{ width: "200px" }}   // 想固定寬度才加，可改數字或刪掉
          >
            📦 匯出選取商品清單
          </button>
        </>
      )}
    </div>
  );
}

export default Page2;