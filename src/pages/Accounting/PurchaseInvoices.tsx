import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAccounting } from "./AccountingContext";
import type { PurchaseInvoice, SupplierPayment } from "./AccountingContext"; // Import both types
import AccountingMenu from "./AccountingMenu";


export default function PurchaseInvoices() {
  const { purchaseInvoices, suppliers, supplierPayments, loading } = useAccounting();

  // 1. High-Performance Dictionary Maps
  const supplierMap = useMemo(() => {
    return new Map<number, string>(suppliers.map(s => [s.id, s.name]));
  }, [suppliers]);

  // 2. High-Performance Payment Aggregation Map
  const paymentTotalsMap = useMemo(() => {
    const sums: Record<number, number> = {};
    if (!supplierPayments) return sums;
    
    // Explicitly type 'p' as SupplierPayment to resolve implicit 'any' error
    supplierPayments.forEach((p: SupplierPayment) => {
      const billId = p.invoiceId; 
      sums[billId] = (sums[billId] || 0) + p.amount;
    });
    return sums;
  }, [supplierPayments]);

  // 3. Complete Bill Status Processing Pipeline
  const compiledInvoices = useMemo(() => {
    return purchaseInvoices.map((inv: PurchaseInvoice) => {
      const totalPaid = paymentTotalsMap[inv.id] || 0;
      const balanceDue = Math.max(0, inv.amount - totalPaid);
      
      let status: "Paid" | "Unpaid" | "Part Paid" = "Unpaid";
      if (balanceDue === 0) status = "Paid";
      else if (totalPaid > 0) status = "Part Paid";

      return {
        ...inv,
        supplierName: supplierMap.get(inv.supplierId) || "Unknown Supplier",
        balanceDue,
        status
      };
    });
  }, [purchaseInvoices, supplierMap, paymentTotalsMap]);

  // 4. Calculate Operational Payables Cash-Flow Metric
  const totalOutstandingCreditors = useMemo(() => {
    return compiledInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  }, [compiledInvoices]);

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="accounting-title">Purchase Invoices</h1>
            <p className="accounting-subtitle">
              Comprehensive log of all supplier bills and material costs recorded in your payables ledger.
            </p>
          </div>
          
          <div style={{ padding: "0.75rem 1.25rem", background: totalOutstandingCreditors > 0 ? "#fff5f5" : "#fdfbf7", border: totalOutstandingCreditors > 0 ? "1px solid #c27a7a" : "1px solid #d2c4a8", borderRadius: "6px", textAlign: "right" }}>
            <span style={{ fontSize: "0.75rem", color: totalOutstandingCreditors > 0 ? "#7a1f1f" : "#6b5c4a", fontWeight: "bold" }}>Total Accounts Payable</span>
            <div style={{ fontSize: "1.35rem", fontWeight: "bold", color: totalOutstandingCreditors > 0 ? "#7a1f1f" : "#4a3f35" }}>
              £{totalOutstandingCreditors.toFixed(2)}
            </div>
          </div>
        </div>

        <hr className="divider" />

        <div className="form-actions" style={{ marginBottom: "1.25rem" }}>
          <Link to="/purchases/new" className="ledger-button active" style={{ padding: "0.6rem 1.5rem" }}>
            ✚ Record New Supplier Invoice
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#6b5c4a" }}>Synchronizing ledger entries...</div>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th style={{ width: "12%" }}>Date</th>
                <th style={{ width: "25%" }}>Supplier Entity</th>
                <th style={{ width: "15%" }}>Invoice #</th>
                <th style={{ width: "28%" }}>Status</th>
                <th style={{ width: "10%", textAlign: "right" }}>Total Gross</th>
              </tr>
            </thead>
            <tbody>
              {compiledInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#6b5c4a", padding: "2rem" }}>
                    🍃 No incoming supplier invoices or parts orders recorded yet.
                  </td>
                </tr>
              ) : (
                compiledInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.date}</td>
                    <td><strong>{inv.supplierName}</strong></td>
                    <td><code>{inv.invoiceNumber}</code></td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{ 
                        fontWeight: "bold",
                        fontSize: "0.85rem",
                        color: inv.status === "Paid" ? "#2e6f40" : inv.status === "Part Paid" ? "#bca380" : "#7a1f1f"
                      }}>
                        ● {inv.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "bold", color: "#4a3f35" }}>
                      £{inv.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}