import { Link } from "react-router-dom";
import "./Accounting.css";

export default function AccountingMenu() {
  return (
    <div className="accounting-menu">
      <Link to="/accounts" className="ledger-button">
        Accounts
      </Link>
      <Link to="/customers" className="ledger-button">
        Customers
      </Link>
      <Link to="/journal" className="ledger-button">
        Journal
      </Link>
      <Link to="/sales-ledger" className="ledger-button">
        Sales Ledger
      </Link>
      <Link to="/trial-balance" className="ledger-button">
        Trial Balance
      </Link>
      <Link to="/suppliers" className="ledger-button">
        Suppliers
      </Link>
      <Link to="/purchases" className="ledger-button">
        Purchase Invoices
      </Link>
      <Link to="/supplier-payments" className="ledger-button">
        Supplier Payments
      </Link>
      <Link to="/supplier-ledger" className="ledger-button">
        Supplier Ledger
      </Link>
      <Link to="/profit-and-loss" className="ledger-button">
        Profit & Loss
      </Link>
      <Link to="/balance-sheet" className="ledger-button">
        Balance Sheet
      </Link>
      <Link to="/audit-trail" className="ledger-button">
        Audit Trail
      </Link>
    </div>
  );
}
