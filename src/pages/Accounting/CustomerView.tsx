import { useSearchParams, Link } from "react-router-dom";
import { useAccounting } from "./AccountingContext";
import { useJobs } from "../../hooks/useJobs";
import AccountingMenu from "./AccountingMenu";


export default function CustomerView() {
  const [searchParams] = useSearchParams();
  const { customers, salesInvoices, salesReceipts, addSalesReceipt } = useAccounting();
  const { jobs } = useJobs();

  // Extract query parameter '?id=XYZ' securely
  const targetIdString = searchParams.get("id");
  const targetCustomerId = targetIdString ? Number(targetIdString) : null;

  const customer = customers.find(c => c.id === targetCustomerId);

  if (!customer) {
    return (
      <div className="accounting-container">
        <div className="parchment-card" style={{ textAlign: "center", padding: "3rem" }}>
          <h2>⚠️ Client Profile Not Found</h2>
          <p style={{ margin: "1rem 0" }}>The client ID parameter is missing or corrupted.</p>
          <Link to="/customers" className="ledger-button">Return to Registry</Link>
        </div>
      </div>
    );
  }

  // Linear filtered datasets targeting this specific client row
  const customerInvoices = salesInvoices.filter(inv => inv.customerId === customer.id);
  const customerPayments = salesReceipts.filter(pay => pay.customerId === customer.id);
  
  // Custom fallback structural property mappings checking for both 'watch' and 'clock' models
  const customerJobs = jobs.filter(job => job.customerId === customer.id);

  // Structural ledger aggregation metrics
  const totalInvoiced = customerInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = customerPayments.reduce((sum, pay) => sum + pay.amount, 0);
  const outstandingBalance = totalInvoiced - totalPaid;

  /**
   * INTERACTION ACCELERATOR: One-click fast receipt logger
   */
  const handleFastDirectReceipt = async (invoiceId: number, balanceDue: number) => {
    const confirmation = window.confirm(`Log a fast full cash/bank receipt of £${balanceDue.toFixed(2)} for Invoice #${invoiceId}?`);
    if (!confirmation) return;

    try {
      await addSalesReceipt({
        customerId: customer.id,
        invoiceId: invoiceId,
        date: new Date().toISOString().split("T")[0],
        amount: balanceDue,
        method: "Bank Transfer",
        reference: "Direct View Collection"
      });
      alert("Payment receipt recorded successfully.");
    } catch (err) {
      console.error("Failed to post payment shortcut entry:", err);
    }
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />

        {/* --- CLIENT ROBUST IDENTIFICATION METADATA BANNER --- */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "1rem" }}>
          <div>
            <h1 className="accounting-title" style={{ fontSize: "2.5rem" }}>{customer.name}</h1>
            <div style={{ fontStyle: "italic", color: "#6b5c4a", marginTop: "0.25rem", fontSize: "0.95rem" }}>
              📍 {customer.address || "No physical courier shipping address recorded."}
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: "0.9rem", color: "#4a3f35" }}>
            <div>✉️ {customer.email || "No email profile"}</div>
            <div>📞 {customer.phone || "No phone profile"}</div>
          </div>
        </div>

        <hr className="divider" />

        {/* --- ACCOUNT LEDGER BALANCING SUMMARY WIDGETS --- */}
        <h3 className="section-title">Financial Position Statement</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", margin: "1rem 0 2rem 0" }}>
          <div style={{ padding: "1rem", background: "#fdfbf7", borderRadius: "6px", border: "1px solid #d2c4a8" }}>
            <span style={{ fontSize: "0.8rem", color: "#6b5c4a" }}>Gross Billed Volume</span>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4a3f35", marginTop: "0.25rem" }}>£{totalInvoiced.toFixed(2)}</div>
          </div>
          <div style={{ padding: "1rem", background: "#fdfbf7", borderRadius: "6px", border: "1px solid #d2c4a8" }}>
            <span style={{ fontSize: "0.8rem", color: "#6b5c4a" }}>Cleared Receipts Value</span>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#5b8461", marginTop: "0.25rem" }}>£{totalPaid.toFixed(2)}</div>
          </div>
          <div style={{ padding: "1rem", background: outstandingBalance > 0 ? "#fff5f5" : "#fdfbf7", borderRadius: "6px", border: outstandingBalance > 0 ? "1px solid #c27a7a" : "1px solid #d2c4a8" }}>
            <span style={{ fontSize: "0.8rem", color: outstandingBalance > 0 ? "#7a1f1f" : "#6b5c4a" }}>Outstanding Balance Owed</span>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: outstandingBalance > 0 ? "#7a1f1f" : "#4a3f35", marginTop: "0.25rem" }}>£{outstandingBalance.toFixed(2)}</div>
          </div>
        </div>

        {/* --- SALES INVOICES ARCHIVE SUBTABLE --- */}
        <h3 className="section-title" style={{ marginTop: "1.5rem" }}>Sales Invoices</h3>
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Date Issued</th>
              <th>Billed Amount</th>
              <th>Collection Status</th>
              <th style={{ textAlign: "center" }}>Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {customerInvoices.length === 0 ? (
              <tr><td colSpan={5} style={{ color: "#6b5c4a", fontStyle: "italic" }}>No invoices raised against this client profile.</td></tr>
            ) : (
              customerInvoices.map(inv => (
                <tr key={inv.id}>
                  <td><strong># {inv.id}</strong></td>
                  <td>{inv.date}</td>
                  <td>£{inv.amount.toFixed(2)}</td>
                  <td>
                    <span style={{ 
                      fontWeight: "bold",
                      color: inv.status === "Paid" ? "#2e6f40" : inv.status === "Part Paid" ? "#bca380" : "#7a1f1f" 
                    }}>
                      ● {inv.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {inv.status !== "Paid" ? (
                      <button 
                        className="small-button" 
                        onClick={() => handleFastDirectReceipt(inv.id, inv.amount)}
                      >
                        💰 Clear Invoice
                      </button>
                    ) : (
                      <span style={{ color: "#9b8b6f", fontSize: "0.85rem" }}>Settled ✓</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* --- INBOUND BANK RECEIPTS SUBTABLE --- */}
        <h3 className="section-title" style={{ marginTop: "2rem" }}>Payment Collections Log</h3>
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Receipt ID</th>
              <th>Processing Date</th>
              <th>Target Invoice</th>
              <th>Payment Method</th>
              <th style={{ textAlign: "right" }}>Amount Received</th>
            </tr>
          </thead>
          <tbody>
            {customerPayments.length === 0 ? (
              <tr><td colSpan={5} style={{ color: "#6b5c4a", fontStyle: "italic" }}>No payment clearing events found.</td></tr>
            ) : (
              customerPayments.map(pay => (
                <tr key={pay.id}>
                  <td># {pay.id}</td>
                  <td>{pay.date}</td>
                  <td><code>Invoice Row #{pay.invoiceId}</code></td>
                  <td>{pay.method} {pay.reference ? `(${pay.reference})` : ""}</td>
                  <td style={{ textAlign: "right", color: "#2e6f40", fontWeight: "bold" }}>+ £{pay.amount.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* --- WORKSHOP REPAIR JOBS WORKFLOW TICKETS --- */}
        <h3 className="section-title" style={{ marginTop: "2rem" }}>Active & Historical Workshop Tickets</h3>
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Timepiece Description</th>
              <th>Current Operational Status</th>
              <th style={{ textAlign: "center" }}>Card Linking</th>
            </tr>
          </thead>
          <tbody>
            {customerJobs.length === 0 ? (
              <tr><td colSpan={4} style={{ color: "#6b5c4a", fontStyle: "italic" }}>No horological repairs logged for this customer.</td></tr>
            ) : (
              customerJobs.map(job => {
                // Dynamically resolve naming fields whether the record was labeled as a watch or clock object
                const brand = (job as any).watchMake || job.clockMake || "Unknown Make";
                const model = (job as any).watchModel || job.clockModel || "Variant";
                
                return (
                  <tr key={job.id}>
                    <td><strong>Job #{job.id}</strong></td>
                    <td>{brand} — {model}</td>
                    <td>
                      <span className="badge-action">
                        {job.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <Link to={`/jobs/view/${job.id}`} className="small-button">
                        🔧 Open Job Card
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

      </div>
    </div>
  );
}
