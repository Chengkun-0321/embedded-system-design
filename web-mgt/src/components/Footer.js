import React from "react";

// 使用原生 Bootstrap 容器類別，避免與 react-bootstrap 綁定
function Footer() {
  return (
    <footer className="footer-lineicon mt-auto">
      <div className="container py-4">
        <div className="row align-items-center gy-3">
          {/* 左側版權 / 署名 */}
          <div className="col-12 col-md-6 text-center text-md-start">
            <small className="footer-meta d-block">
              © 2025 王正坤 B1204063 · 資工 4A · HW2 作業
            </small>
            <small className="footer-meta sub d-block">
              建置日期：2025-11-09
            </small>
          </div>

          {/* 右側社群 / 聯絡 icon */}
            <div className="col-12 col-md-6">
              <ul className="list-inline mb-0 d-flex justify-content-center justify-content-md-end footer-icons gap-3">
                {/* GitHub */}
                <li className="list-inline-item">
                  <a
                    href="https://github.com/Chengkun-0321/embedded-system-design/tree/HW2"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="icon-link"
                  >
                    {/* Feather GitHub SVG (stroke line style) */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="feather feather-github">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77 5.44 5.44 0 0 0 3.5 8.5c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                  </a>
                </li>                
              </ul>
            </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;