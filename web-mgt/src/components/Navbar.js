import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

function NavigationBar({ username }) {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container fluid>
        {/* 網站標題 */}
        <Navbar.Brand as={Link} to="/">
          My Website服務網站（Node Express）
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {/* ✅ 導覽列靠左 (me-auto = margin-end auto) */}
          <Nav className="me-auto align-items-center">
            <Nav.Link as={Link} to="/">首頁</Nav.Link>
            <Nav.Link as={Link} to="/page1">功能一服務</Nav.Link>
            <Nav.Link as={Link} to="/page2">功能二服務</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;