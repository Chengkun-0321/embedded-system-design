import React, { useState, useEffect } from "react";
import './App.css';

function App() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetch("/api/username")
      .then(res => res.json())
      .then(data => {
        setUsername(data.username);
      })
      .catch(err => {
        console.error("無法取得使用者名稱", err);
      });
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px", fontSize: "24px" }}>
      {username ? <h1>歡迎 {username}</h1> : <h1>載入中...</h1>}
    </div>
  );
}

export default App;
