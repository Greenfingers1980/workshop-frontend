import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAccounting } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";


export default function NewSalesReceipt() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { customers, salesInvoices, salesReceipts, addSalesReceipt, loading } = useAccounting();

  // 1. URL Integration: Proactively check if an invoice or customer ID was passed via query params
  const queryInvoiceId = searchParams.get("invoiceId");
  const queryCustomerId = searchParams.get("customerId");

  const [customerId, setCustomerId] = useState<number | "">("");
  const [invoiceId, setInvoiceId] = useState<number | "">("");
  const [amount, setAmount] = useState<string>("0.00");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<string>("Bank Transfer");
  const [reference, setReference] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill from query parameters if navigating from a specific Job or Client page
  useEffect(() => {
    if (queryCustomerId) setCustomerId(Number(queryCustomerId));
    if (queryInvoiceId) setInvoiceId(Number(queryInvoiceId));
  }, [queryCustomerId, queryInvoiceId]);

  // 2. High-Performance Lookup: Create an O(1) map of accumulated payments per invoice
  const receiptTotalsMap = useMemo(() => {
    const sums: Record<number, number> = {};
    salesReceipts.forEach(r => {
      sums[r.invoiceId] = (sums[r.invoiceId] || 0) + r.amount;
    });
    return sums;
  }, [salesReceipts]);

  // Filter invoices for the chosen customer
  const filteredInvoices = useMemo(() => {
    if (!customerId) return [];
    return salesInvoices.filter(inv => inv.customerId === customerId);
  }, [salesInvoices, customerId]);

  // 3. Live Balance Calculator: Compute outstanding balances to show the user mid-entry
  const activeInvoiceDetails = useMemo(() => {
    if (!invoiceId) return null;
    const inv = salesInvoices.find(i => i.id === invoiceId);
    if (!inv) return null;

    const previousPayments = receiptTotalsMap[inv.id] || 0;
    const remainingBalance = Math.max(0, inv.amount - previousPayments);

    return {
      grossAmount: inv.amount,
      previousPayments,
      remainingBalance
    };
  }, [invoiceId, salesInvoices, receiptTotalsMap]);

  // Auto-populate the input box with the exact remaining balance when an invoice is picked
  useEffect(() => {
    if (activeInvoiceDetails) {
      setAmount(activeInvoiceDetails.remainingBalance.toFixed(2));
    } else {
      setAmount("");
    }
  }, [activeInvoiceDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Math.round(parseFloat(amount) * 100) / 100;

    if (!customerId || !invoiceId || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Validation Error: Please confirm all mandatory transaction elements.");
      return;
    }

    if (activeInvoiceDetails && parsedAmount > activeInvoiceDetails.remainingBalance + 0.01) {
      alert(`Overpayment Guard: Entered amount (£${parsedAmount.toFixed(2)}) exceeds the outstanding balance (£${activeInvoiceDetails.remainingBalance.toFixed(2)}).`);
      return;
    }

    setIsSubmitting(true);

    try {
      await addSalesReceipt({
        customerId: customerId as number,
        invoiceId: invoiceId as number,
        amount: parsedAmount,
        date,
        method,
        reference: reference.trim() || undefined
      });

      alert("🎉 Receipt collection successfully updated to ledgers.");
      // Fixed Route Pattern: Navigates to your correct client details view page
      navigate(`/customer-view?id=${customerId}`);
    } catch (err) {
      console.error("Payment posting exception:", err);
      alert("Database error: Could not log payment parameters.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card" style={{ maxWidth: "600px" }}>
        <AccountingMenu />
        
        <h1 className="accounting-title">Record Sales Payment</h1>
        <p className="accounting-subtitle">
          Log client clearings, repair deposits, and partial down-payments straight into bank subledgers.
        </p>

        <hr className="divider" />

        <form className="account-form" onSubmit={handleSubmit}>
          {/* CUSTOMER SELECTOR */}
          <div className="form-row" style={{ marginBottom: "1rem" }}>
            <label style={{ display: "flex", flexDirection: "column", width: "100%" }}>
              Select Customer
              <select
                value={customerId}
                onChange={e => {
                  setCustomerId(e.target.value ? Number(e.target.value) : "");
                  setInvoiceId("");
                }}
                required
                disabled={isSubmitting || loading}
                style={{ padding: "0.4rem", marginTop: "0.2rem" }}
              >
                <option value="">Select customer profile…</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
          </div>

          {/* INVOICE SELECTOR */}
          <div className="form-row" style={{ marginBottom: "1rem" }}>
            <label style={{ display: "flex", flexDirection: "column", width: "100%" }}>
              Target Invoice Record
              <select
                value={invoiceId}
                onChange={e => setInvoiceId(e.target.value ? Number(e.target.value) : "")}
                disabled={!customerId || isSubmitting}
                required
                style={{ padding: "0.4rem", marginTop: "0.2rem" }}
              >
                <option value="">Select outstanding document…</option>
                {filteredInvoices.map(inv => {
                  const alreadyPaid = receiptTotalsMap[inv.id] || 0;
                  const remaining = Math.max(0, inv.amount - alreadyPaid);
                  return (
                    <option key={inv.id} value={inv.id}>
                      Invoice #{inv.id} (Owed: £{remaining.toFixed(2)} / Total: £{inv.amount.toFixed(2)}) — Status: {inv.status}
                    </option>
                  );
                })}
              </select>
            </label>
          </div>

          {/* LIVE BREAKDOWN LEDGER DISPLAY */}
          {activeInvoiceDetails && (
            <div style={{ background: "#fdfbf7", padding: "1rem", border: "1px dashed #c8b79a", borderRadius: "6px", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "1rem" }}>
              <div>📋 <strong>Invoice Reference Metrics:</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#6b5c4a", marginTop: "0.25rem" }}>
                <span>Original Invoice Total:</span>
                <span>£{activeInvoiceDetails.grossAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#2e6f40" }}>
                <span>Previously Collected:</span>
                <span>- £{activeInvoiceDetails.previousPayments.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", borderTop: "1px dashed #d2c4a8", paddingTop: "0.25rem", marginTop: "0.25rem", color: "#7a1f1f" }}>
                <span>Net Balance Currently Due:</span>
                <span>£{activeInvoiceDetails.remainingBalance.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* AMOUNT & DATE */}
          <div className="form-row" style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <label style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              Amount Received (£)
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                disabled={isSubmitting}
                style={{ padding: "0.4rem", marginTop: "0.2rem" }}
              />
            </label>

            <label style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              Clearing Date
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                disabled={isSubmitting}
                style={{ padding: "0.4rem", marginTop: "0.2rem" }}
              />
            </label>
          </div>

          {/* PAYMENT METHOD & MEMO REFERENCE */}
          <div className="form-row" style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <label style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              Payment Method
              <select value={method} onChange={e => setMethod(e.target.value)} disabled={isSubmitting} style={{ padding: "0.4rem", marginTop: "0.2rem" }}>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card Terminal</option>
                <option value="Cash">Cash Ledger</option>
              </select>
            </label>

            <label style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              Reference / Transaction ID
              <input
                type="text"
                placeholder="e.g. BAC-SMITH-DEPOSIT"
                value={reference}
                onChange={e => setReference(e.target.value)}
                disabled={isSubmitting}
                style={{ padding: "0.4rem", marginTop: "0.2rem" }}
              />
            </label>
          </div>

          {/* SUBMIT TRIGGERS */}
          <div className="form-actions" style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <button
              type="submit"
              className={`ledger-button ${Number(amount) > 0 && invoiceId && !isSubmitting ? "active" : ""}`}
              disabled={Number(amount) <= 0 || !invoiceId || isSubmitting}
              style={{ width: "100%", padding: "0.7rem", fontSize: "1rem" }}
            >
              {isSubmitting ? "Updating Ledger Balances..." : "⚡ Commit Payment Receipt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}