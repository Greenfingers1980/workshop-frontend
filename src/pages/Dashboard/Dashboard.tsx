import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  // Read stored data safely
  const jobs = JSON.parse(localStorage.getItem("jobs") || "[]");
  const ledger = JSON.parse(localStorage.getItem("ledger") || "[]");
  const stock = JSON.parse(localStorage.getItem("stock") || "[]");
  const technicianTasks = JSON.parse(localStorage.getItem("technicianTasks") || "[]");

  // Calculate metrics dynamically
  const openJobs = jobs.length;
  const outstandingInvoices = ledger.reduce(
    (sum: number, item: any) => sum + (item.amount || 0),
    0
  );
  const stockAlerts = stock.filter((item: any) => item.alert).length;
  const technicianCount = technicianTasks.length;

  return (
    <div className="dashboard">
      {/* HERO BANNER */}
      <div className="dashboard-hero">
        <div className="hero-overlay">
          <h1 className="hero-title">Welcome to the Workshop</h1>
          <p className="hero-subtitle">
            Your horological workspace — jobs, customers, accounting and tools all in one place.
          </p>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="panel">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <Link className="btn" to="/jobs/new">New Job</Link>
          <Link className="btn" to="/accounting/sales-invoice/new">New Invoice</Link>
          <Link className="btn" to="/accounting/sales-receipts/new">Record Payment</Link>
          <Link className="btn" to="/stock/adjust">Adjust Stock</Link>
        </div>
      </div>

      {/* METRICS */}
      <div className="metrics-grid">
        <div className="panel metric-card">
          <h3>Open Jobs</h3>
          <p className="metric-number">{openJobs}</p>
          <Link to="/jobs" className="metric-link">View Jobs</Link>
        </div>

        <div className="panel metric-card">
          <h3>Outstanding Invoices</h3>
          <p className="metric-number">£{outstandingInvoices.toLocaleString()}</p>
          <Link to="/accounting/sales-ledger" className="metric-link">View Ledger</Link>
        </div>

        <div className="panel metric-card">
          <h3>Stock Alerts</h3>
          <p className="metric-number">{stockAlerts}</p>
          <Link to="/stock" className="metric-link">View Stock</Link>
        </div>

        <div className="panel metric-card">
          <h3>Technician Tasks</h3>
          <p className="metric-number">{technicianCount}</p>
          <Link to="/technician/my-jobs" className="metric-link">View Tasks</Link>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="panel">
        <h2>Recent Activity</h2>
        <ul className="activity-list">
          {jobs.length === 0 && ledger.length === 0 && stock.length === 0 ? (
            <li>No recent activity — start by creating a new job or invoice.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
