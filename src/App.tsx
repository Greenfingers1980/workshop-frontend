import { Outlet, Link } from "react-router-dom";
import "./App.css";


export default function App() {
  return (
    <>
      {/* ⭐ FIXED SIDEBAR */}
      <div
        style={{
          width: "220px",
          backgroundImage: "url('/book-spine.jpg')",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          padding: "1rem",
          paddingBottom: "3rem",
          borderRight: "1px solid #d2c4a8",
          boxSizing: "border-box",
          color: "#f8f3e6",
          textShadow: "0 1px 2px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          overflowY: "auto",
          zIndex: 10000,
        }}
      >
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            width: "100%",
          }}
        >
          {/* MAIN */}
          <Link to="/" className="ledger-button">Dashboard</Link>
          <Link to="/stock" className="ledger-button">Stock</Link>
          <Link to="/jobs" className="ledger-button">Jobs</Link>
          <Link to="/tools" className="ledger-button">Tools</Link>

          {/* ACCOUNTING */}
          <div style={{ marginTop: "1rem", opacity: 0.8 }}>Accounting</div>
          <Link to="/accounting/sales-ledger" className="ledger-button">Sales Ledger</Link>
          <Link to="/accounting/sales-receipts/new" className="ledger-button">New Sales Receipt</Link>
          <Link to="/accounting/customers" className="ledger-button">Customers</Link>
          <Link to="/accounting/suppliers" className="ledger-button">Suppliers</Link>
          <Link to="/accounting/purchase-invoices" className="ledger-button">Purchase Invoices</Link>
          <Link to="/accounting/purchase-invoice/new" className="ledger-button">New Purchase Invoice</Link>
          <Link to="/accounting/supplier-payments" className="ledger-button">Supplier Payments</Link>
          <Link to="/accounting/suppliers" className="ledger-button">Supplier Ledger</Link>
          <Link to="/accounting/bank/import" className="ledger-button">Import Bank Statement</Link>
          <Link to="/accounting/bank/reconcile/1" className="ledger-button">Bank Reconciliation</Link>

          {/* REPORTS */}
          <div style={{ marginTop: "1rem", opacity: 0.8 }}>Reports</div>
          <Link to="/accounting/profit-and-loss" className="ledger-button">Profit & Loss</Link>
          <Link to="/accounting/balance-sheet" className="ledger-button">Balance Sheet</Link>
          <Link to="/accounting/audit-trail" className="ledger-button">Audit Trail</Link>
          <Link to="/accounting/year-end" className="ledger-button">Year End</Link>

          {/* SETTINGS */}
          <div style={{ marginTop: "1rem", opacity: 0.8 }}>Settings</div>
          <Link to="/settings/data-tools" className="ledger-button">Data Tools</Link>

          {/* TECHNICIAN */}
          <div style={{ marginTop: "1rem", opacity: 0.8 }}>Technician</div>
          <Link to="/technician/learning/courses" className="ledger-button">Courses</Link>
          <Link to="/technician/learning/schedule" className="ledger-button">Study Schedule</Link>
          <Link to="/technician/learning/progress" className="ledger-button">My Progress</Link>
          <Link to="/technician" className="ledger-button">Technician Dashboard</Link>
          <Link to="/technician/jobs" className="ledger-button">My Jobs</Link> {/* ✅ fixed route */}
          <Link to="/login" className="ledger-button">Technician Login</Link>
        </nav>
      </div>

      {/* ⭐ MAIN CONTENT AREA */}
      <div
        style={{
          marginLeft: "220px",
          padding: "2rem",
          flexGrow: 1,
          minHeight: "100vh",
          boxSizing: "border-box",
          display: "flex",
        }}
      >
        <Outlet /> {/* ✅ ensures nested routes render */}
      </div>

      {/* ⭐ FLOATING DOCK (GLOBAL) */}
      
    </>
  );
}
