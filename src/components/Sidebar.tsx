import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

interface NavLink { name: string; path: string; }
interface NavGroup { title: string; links: NavLink[]; }

const navConfig: NavGroup[] = [
  {
    title: "Workshop",
    links: [
      { name: "Dashboard", path: "/" },
      { name: "Jobs", path: "/jobs" },
      { name: "Stock", path: "/stock" },
    ],
  },
  {
    title: "Accounting",
    links: [
      { name: "Customers", path: "/accounting/customers" },
      { name: "Sales Ledger", path: "/accounting/sales-ledger" },
      { name: "Purchase Invoices", path: "/accounting/purchase-invoices" },
      { name: "Chart of Accounts", path: "/accounting/chart-of-accounts" },
      { name: "Trial Balance", path: "/accounting/trial-balance" },
      { name: "Balance Sheet", path: "/accounting/balance-sheet" },
      { name: "Year End", path: "/accounting/year-end" },
    ],
  },
  {
    title: "Technician",
    links: [
      { name: "Dashboard", path: "/technician" },
      { name: "My Jobs", path: "/technician/jobs" },
      { name: "Tools", path: "/technician/tools" },
      { name: "Workbench", path: "/technician/Workbench" },
      { name: "Login", path: "/technician/login" }, 
    ],
  },
  {
    title: "System & Admin",
    links: [
      { name: "Data Tools", path: "/settings/data-tools" },
      { name: "Upload PDF", path: "/admin/upload-pdf" },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">LedgerOS</div>
      
      {navConfig.map((group) => (
        <div key={group.title} className="nav-group">
          <h4 className="nav-group-title">{group.title}</h4>
          
          {group.links.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              /* Updated class here to match the modern button CSS */
              className={`nav-button ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      ))}
      
      <ThemeToggle />
    </aside>
  );
}