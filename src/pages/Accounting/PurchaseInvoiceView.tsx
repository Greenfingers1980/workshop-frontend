import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useAccounting } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";


export default function PurchaseInvoiceView() {
  const { id } = useParams<{ id: string }>();
  const { purchaseInvoices, suppliers, accounts } = useAccounting();

  const invoice = useMemo(() => {
    if (!id || !purchaseInvoices) return null;
    return purchaseInvoices.find((p) => String(p.id) === String(id)) || null;
  }, [purchaseInvoices, id]);

  const supplier = useMemo(() => {
    if (!invoice) return null;
    return suppliers.find((s) => s.id === invoice.supplierId) || null;
  }, [suppliers, invoice]);

  const accountLabelsMap = useMemo(() => {
    return new Map<number, string>(accounts.map(a => [a.id, `${a.code} — ${a.name}`]));
  }, [accounts]);

  if (!invoice) {
    return (
      <div className="accounting-container">
        <div className="parchment-card" style={{ textAlign: "center", padding: "3rem" }}>
          <h2>⚠️ Purchase Invoice Not Found</h2>
          <p style={{ margin: "1rem 0" }}>The specified purchase voucher tracking ID is invalid or has been archived.</p>
          <Link to="/purchases" className="ledger-button active">
            Return to Purchase Ledger
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "1rem" }}>
          <div>
            <h1 className="accounting-title">Purchase Invoice Voucher</h1>
            <p className="accounting-subtitle">Detailed allocation breakdown for incoming trade payables.</p>
          </div>
          <Link to="/purchases" className="ledger-button" style={{ padding: "0.5rem 1rem" }}>
            ← Back to Archives
          </Link>
        </div>

        <hr className="divider" />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem", padding: "1.25rem", background: "#fdfbf7", border: "1px solid #d2c4a8", borderRadius: "6px" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#6b5c4a", fontWeight: "bold" }}>Supplier / Vendor</span>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.05rem", fontWeight: "bold", color: "#4a3f35" }}>
              {supplier ? supplier.name : "Unknown Supplier"}
            </p>
          </div>

          <div>
            <span style={{ fontSize: "0.8rem", color: "#6b5c4a", fontWeight: "bold" }}>Invoice Date</span>
            <p style={{ margin: "0.25rem 0 0 0", color: "#4a3f35" }}>{invoice.date}</p>
          </div>

          <div>
            <span style={{ fontSize: "0.8rem", color: "#6b5c4a", fontWeight: "bold" }}>Reference / Ref Code</span>
            <p style={{ margin: "0.25rem 0 0 0", fontFamily: "monospace", fontWeight: "bold", color: "#4a3f35" }}>
              {invoice.reference ?? "No reference"}
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.8rem", color: "#6b5c4a", fontWeight: "bold" }}>Voucher Grand Total</span>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.25rem", fontWeight: "bold", color: "#7a1f1f" }}>
              £{invoice.amount.toFixed(2)}
            </p>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#fdfbf7", border: "1px solid #d2c4a8", borderRadius: "6px", fontSize: "0.9rem" }}>
          <strong>Primary Material Narrative:</strong>
          <p style={{ margin: "0.4rem 0 0 0", color: "#555", fontStyle: "italic", lineHeight: "1.4" }}>
            {invoice.description || "No accounting memo narrative attached to this purchase invoice registry entry."}
          </p>
        </div>

        <h3 className="section-title" style={{ marginTop: "2rem", fontSize: "1.1rem" }}>
          📋 Ledger Account Distribution Breakdowns
        </h3>
        <table className="ledger-table" style={{ marginTop: "0.5rem" }}>
          <thead>
            <tr>
              <th style={{ width: "45%" }}>Target Ledger Allocation Account</th>
              <th style={{ width: "30%" }}>Department Stream</th>
              <th style={{ width: "25%", textAlign: "right" }}>Net Value</th>
            </tr>
          </thead>
          <tbody>
            {!invoice.lines || invoice.lines.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ color: "#6b5c4a", fontStyle: "italic", textAlign: "center" }}>
                  No itemized ledger splits stored for this voucher.
                </td>
              </tr>
            ) : (
              invoice.lines.map((line, idx) => {
                const accountName = accountLabelsMap.get(line.accountId) || `Unknown Account (#${line.accountId})`;
                return (
                  <tr key={idx}>
                    <td><code>{accountName}</code></td>
                    <td>
                      <span className="badge-action">{line.department || "General"}</span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "bold", color: "#4a3f35" }}>
                      £{line.amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}
            <tr style={{ background: "#e9ddc7", fontWeight: "bold" }}>
              <td colSpan={2}>Aggregated Splits Summary Verification</td>
              <td style={{ textAlign: "right", fontSize: "1.05rem" }}>£{invoice.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}