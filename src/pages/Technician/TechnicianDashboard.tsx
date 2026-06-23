import { Link, Outlet } from "react-router-dom";
import "./TechnicianDashboard.css";


const TECHNICIAN_NAME = "Matthew"; // 👈 fixed technician identity

export default function TechnicianDashboard() {
  // Example local job data — replace with real data later if needed
  const jobsInProgress = 2;
  const completedJobs = 5;
  const coursesStarted = 1;

  return (
    <div className="technician-wrapper">

      {/* Wallpaper background */}
      <div className="technician-wallpaper"></div>

      {/* Main grid layout */}
      <div className="technician-grid">

        {/* LEFT SIDEBAR */}
        <aside className="technician-sidebar">
          <h2 className="tech-title">Technician Area</h2>

          <nav className="tech-nav">
            <ul>
              <li>
                <Link to="/technician">Dashboard</Link>
              </li>
              <li>
                <Link to="/technician/my-jobs">My Jobs</Link>
              </li>
              <li>
                <Link to="/technician/learning/courses">Learning – Courses</Link>
              </li>
              <li>
                <Link to="/technician/tools">Tools</Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* RIGHT CONTENT AREA */}
        <main className="technician-content">

          {/* Technician header panel */}
          <div className="technician-header">
            <h1>Welcome, {TECHNICIAN_NAME}</h1>
            <p>Your workshop tasks and learning progress are shown below.</p>
          </div>

          {/* Technician stats boxes */}
          <div className="technician-stats">
            <div className="stat-box">
              <h3>Jobs in Progress</h3>
              <p>{jobsInProgress}</p>
            </div>
            <div className="stat-box">
              <h3>Completed Jobs</h3>
              <p>{completedJobs}</p>
            </div>
            <div className="stat-box">
              <h3>Courses Started</h3>
              <p>{coursesStarted}</p>
            </div>
          </div>

          {/* Nested route content */}
          <div className="technician-outlet">
            <Outlet />
          </div>

        </main>
      </div>
    </div>
  );
}
