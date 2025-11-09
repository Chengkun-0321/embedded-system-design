// src/pages/Home.js
import { Container } from "react-bootstrap";
import React, { useState, useEffect } from "react";


function Home() {
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
    <Container className="mt-5 text-center">
      <h1>歡迎來到 商品搜尋與購物清單系統 網站！</h1>
      {username && (
        <p className="text-secondary">
          Hi, {username} 👋 歡迎回來！
        </p>
      )}
    </Container>
  );
}

export default Home;