import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">Workshop</div>

      <div className="sidebar-section-title">Dashboard</div>
      <NavLink to="/">Home</NavLink>

      <div className="sidebar-section-title">Jobs</div>
      <NavLink to="/jobs">All Jobs</NavLink>
      <NavLink to="/jobs/new">New Job</NavLink>

      <div className="sidebar-section-title">Technician</div>
      <NavLink to="/technician">Dashboard</NavLink>
      <NavLink to="/technician/my-jobs">My Jobs</NavLink>
      <NavLink to="/technician/learning">Learning</NavLink>

      <div className="sidebar-section-title">Accounting</div>
      <NavLink to="/accounting/customers">Customers</NavLink>
      <NavLink to="/accounting/sales-ledger">Sales Ledger</NavLink>
      <NavLink to="/accounting/sales-invoice/new">New Sales Invoice</NavLink>
      <NavLink to="/accounting/sales-receipts/new">Record Payment</NavLink>
      <NavLink to="/accounting/purchase-invoices">Purchase Invoices</NavLink>
      <NavLink to="/accounting/suppliers">Suppliers</NavLink>
      <NavLink to="/accounting/chart-of-accounts">Chart of Accounts</NavLink>
      <NavLink to="/accounting/journal">Journal</NavLink>
      <NavLink to="/accounting/aged-debtors">Aged Debtors</NavLink>
      <NavLink to="/accounting/profit-and-loss">Profit & Loss</NavLink>
      <NavLink to="/accounting/balance-sheet">Balance Sheet</NavLink>
      <NavLink to="/accounting/audit-trail">Audit Trail</NavLink>

      <div className="sidebar-section-title">Stock</div>
      <NavLink to="/stock">Stock Dashboard</NavLink>
      <NavLink to="/stock/adjust">Adjust Stock</NavLink>
      <NavLink to="/stock/history">Stock History</NavLink>

      <div className="sidebar-section-title">Tools</div>
      <NavLink to="/tools">Tools</NavLink>

      <div className="sidebar-section-title">Admin</div>
      <NavLink to="/admin/upload-pdf">Upload PDFs</NavLink>
    </aside>
  );
}
