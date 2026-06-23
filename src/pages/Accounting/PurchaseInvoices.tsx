import { Link } from "react-router-dom";
import { useAccounting } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";
import "./Accounting.css";

export default function PurchaseInvoices() {
  const { purchaseInvoices, suppliers } = useAccounting();

  const getSupplierName = (id: number) => {
    const s = suppliers.find(s => s.id === id);
    return s ? s.name : "Unknown Supplier";
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        <h1 className="accounting-title">Purchase Invoices</h1>
        <p className="accounting-subtitle">
          All supplier invoices recorded in your purchase ledger.
        </p>

        <hr className="divider" />

        {/* ---------------------- */}
        {/* NEW INVOICE BUTTON */}
        {/* ---------------------- */}
        <div className="form-actions" style={{ marginBottom: "1rem" }}>
          <Link to="/purchases/new" className="ledger-button">
            + New Purchase Invoice
          </Link>
        </div>

        {/* ---------------------- */}
        {/* INVOICE LIST */}
        {/* ---------------------- */}
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Supplier</th>
              <th>Reference</th>
              <th>Description</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {purchaseInvoices.length === 0 && (
              <tr>
                <td colSpan={5}>No purchase invoices recorded yet.</td>
              </tr>
            )}

            {purchaseInvoices.map(inv => (
              <tr key={inv.id}>
                <td>{inv.date}</td>
                <td>{getSupplierName(inv.supplierId)}</td>
                <td>{inv.reference || "—"}</td>
                <td>{inv.description || "—"}</td>
                <td>£{inv.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
