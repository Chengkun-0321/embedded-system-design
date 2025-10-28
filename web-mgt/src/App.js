import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NavigationBar, Footer } from "./components";
import { Home, Page1, Page2 } from "./pages";

function App() {
  return (
    
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <NavigationBar/>
        <div className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/page1" element={<Page1 />} />
            <Route path="/page2" element={<Page2 />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
