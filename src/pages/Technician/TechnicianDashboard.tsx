import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Wrench, LayoutDashboard, Briefcase, GraduationCap, Hammer } from "lucide-react";
import "../Dashboard/Dashboard.css"; // Ensure this matches the new styles

const TECHNICIAN_NAME = "Matthew"; 

export default function TechnicianDashboard() {
  const location = useLocation();

  const jobsInProgress = 2;
  const completedJobs = 5;
  const coursesStarted = 1;

  const isBaseDashboard = location.pathname === "/technician" || location.pathname === "/technician/";

  return (
    <div className="technician-wrapper">
      <div className="technician-grid">
        {/* Sidebar */}
        <aside className="technician-sidebar">
          <div className="sidebar-header">
            <Wrench className="w-5 h-5" />
            <h2 className="tech-title">Technician Area</h2>
          </div>

          <nav className="tech-nav">
            <ul>
              <li>
                <Link to="/technician" className={isBaseDashboard ? "active" : ""}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard Overview
                </Link>
              </li>
              <li>
                <Link to="jobs" className={location.pathname.includes("/technician/jobs") ? "active" : ""}>
                  <Briefcase className="w-4 h-4" /> My Active Jobs
                </Link>
              </li>
              <li>
                <Link to="learning/courses" className={location.pathname.includes("/learning/courses") ? "active" : ""}>
                  <GraduationCap className="w-4 h-4" /> Horology Courses
                </Link>
              </li>
              <li>
                <Link to="tools" className={location.pathname.includes("/technician/tools") ? "active" : ""}>
                  <Hammer className="w-4 h-4" /> Bench Utilities
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="technician-content">
          {isBaseDashboard ? (
            <div className="space-y-6">
              <div className="parchment-card">
                <h1 className="text-xl font-bold">Welcome back, {TECHNICIAN_NAME}</h1>
              </div>

              <div className="metrics-grid">
                <div className="parchment-card stat-box">
                  <h3>Jobs In Progress</h3>
                  <p className="dash-number">{jobsInProgress}</p>
                </div>
                <div className="parchment-card stat-box">
                  <h3>Completed Logs</h3>
                  <p className="dash-number">{completedJobs}</p>
                </div>
                <div className="parchment-card stat-box">
                  <h3>Courses Staged</h3>
                  <p className="dash-number">{coursesStarted}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="technician-outlet">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}