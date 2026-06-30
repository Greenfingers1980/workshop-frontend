import { Link, useLocation } from "react-router-dom";
import "./AccountingMenu.css";

// 1. Cleaned up interface (removed 'element')
interface MenuLink {
  path: string;
  label: string;
  category: "General" | "Sales" | "Purchases" | "Reports";
}

// 2. Updated paths to match your router structure
const MENU_LINKS: MenuLink[] = [
  // General Ledger
  { path: "/accounting/journal", label: "Journal", category: "General" },
  { path: "/accounting/audit-trail", label: "Audit Trail", category: "General" },
  
  // Sales (Receivables)
  { path: "/accounting/customers", label: "Customers", category: "Sales" },
  { path: "/accounting/sales-ledger", label: "Sales Ledger", category: "Sales" },
  
  // Purchases (Payables)
  { path: "/accounting/suppliers", label: "Suppliers", category: "Purchases" },
  { path: "/accounting/purchase-invoices", label: "Purchase Invoices", category: "Purchases" },
  { path: "/accounting/supplier-payments", label: "Supplier Payments", category: "Purchases" },
  { path: "/accounting/supplier-ledger", label: "Supplier Ledger", category: "Purchases" },
  
  // Financial Reporting
  { path: "/accounting/trial-balance", label: "Trial Balance", category: "Reports" },
  { path: "/accounting/profit-and-loss", label: "Profit & Loss", category: "Reports" },
  { path: "/accounting/balance-sheet", label: "Balance Sheet", category: "Reports" },
];

export default function AccountingMenu() {
  const location = useLocation();

  return (
    <nav className="accounting-menu" aria-label="Accounting navigation">
      {MENU_LINKS.map((link) => {
        // Active class logic remains the same
        const isActive = location.pathname === link.path;
        
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`ledger-button ${isActive ? "active" : ""} cat-${link.category.toLowerCase()}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}