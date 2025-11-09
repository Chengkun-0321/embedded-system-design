import { NavLink, Link } from "react-router-dom";
import { useEffect } from "react";

function NavigationBar({ username }) {
  useEffect(() => {
    // 若尚未在專案其他地方載入 bootstrap 的 JS，建議在 src/index.js 加上：
    // import 'bootstrap/dist/js/bootstrap.bundle.min';
  }, []);

  return (
  <nav className="navbar navbar-expand-lg navbar-dark navbar-navy" aria-label="Main navigation">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">My Website服務網站（Node Express）</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink
                to="/"
                end
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                首頁
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/page1"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                商品搜尋服務
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/page2"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                功能二服務
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavigationBar;