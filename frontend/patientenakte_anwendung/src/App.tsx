import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Navbar from "./Components/Navbar/Navbar";
import AppRoutes from "./Services/AppRoutes";


function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <Navbar />
        </header>

        <div className="left-space">
          <div className="left-space-header"></div>
        </div>
        <main className="main-content">
          <AppRoutes />
        </main>
        <div className="right-space">
          <div className="right-space-header"></div>
        </div>

        {/* Footer */}
        <footer className="footer">Footer</footer>
      </div>
    </Router>
  );
}

export default App;
