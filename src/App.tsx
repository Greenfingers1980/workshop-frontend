import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./App.css";

export default function App() {
  return (
    <div className="app-container">
      {/* Verify this tag is exactly here */}
      <Sidebar />
      
      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}