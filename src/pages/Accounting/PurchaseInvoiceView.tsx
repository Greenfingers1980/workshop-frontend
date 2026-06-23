import { useParams, Link } from "react-router-dom";
import { useAccounting } from "./AccountingContext";
import "./Accounting.css";

export default function PurchaseInvoiceView() {
  const { id } = useParams();
  const { purchaseInvoices, suppliers } = useAccounting();

  const invoice = purchaseInvoices.find((p) => p.id === Number(id));

  if (!invoice) {
    return (
      <div className="panel">
        <h1>Purchase Invoice</h1>
        <p className="muted">Invoice not found.</p>
        <Link to="/accounting/purchase-invoices" className="btn">
          Back to Purchase Invoices
        </Link>
      </div>
    );
  }

  const supplier = suppliers.find((s) => s.id === invoice.supplierId);

  return (
    <div className="panel">
      <h1>Purchase Invoice</h1>
      <p className="muted">Supplier invoice details.</p>

      <div className="info-grid" style={{ marginTop: "1.5rem" }}>
        <div>
          <strong>Supplier:</strong>
          <p>{supplier ? supplier.name : "Unknown Supplier"}</p>
        </div>

        <div>
          <strong>Date:</strong>
          <p>{invoice.date}</p>
        </div>

        <div>
          <strong>Reference:</strong>
          <p>{invoice.reference || "—"}</p>
        </div>

        <div>
          <strong>Description:</strong>
          <p>{invoice.description || "—"}</p>
        </div>

        <div>
          <strong>Total:</strong>
          <p>£{invoice.total.toFixed(2)}</p>
        </div>
      </div>

      <hr className="divider" />

      <Link to="/accounting/purchase-invoices" className="btn">
        ← Back to Purchase Invoices
      </Link>
    </div>
  );
}

