import { Outlet } from "react-router-dom"; // or your layout navigation components
import { TechnicianWallpaper } from "./TechnicianWallpaper";
// Or leave as "./TechnicianWallpaper" if it is physically in the Technician folder


export default function TechnicianLayout() {
  return (
    <div className="technician-wrapper">
  
      {/* 2. PLACED SECOND: The visible UI layout grid sits on z-index: 1 over the wallpaper */}
      <div className="technician-grid">
        
        {/* Sidebar Workbench Navigation */}
        <aside className="technician-sidebar">
          <nav className="tech-nav">
            <ul>
              <li><a href="#bench">Main Workbench</a></li>
              <li><a href="#parts">Parts Catalog</a></li>
              <li><a href="#ledger">Workshop Ledger</a></li>
            </ul>
          </nav>
        </aside>

        {/* Main Operational Window Component Layer */}
        <main className="technician-content">
          <header className="technician-header">
            <h1>Horological Workbench</h1>
            <h2>Active Queue Control</h2>
          </header>
          
          <div className="technician-outlet">
            {/* Child routes render down smoothly inside your layout system hooks */}
            <Outlet /> 
          </div>
        </main>

      </div>
    </div>
  );
}