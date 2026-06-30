import React, { useState, useMemo, useEffect } from "react";
import { useAccounting } from "./AccountingContext";
import type { Department } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";


interface DraftLine {
  accountId: number | "";
  amount: string;
  department: Department;
}

const createInitialRow = (): DraftLine => ({
  accountId: "",
  amount: "",
  department: "Watch Studio"
});

export default function NewPurchaseInvoice() {
  const { suppliers, accounts, addPurchaseInvoice, loading } = useAccounting();

  const [supplierId, setSupplierId] = useState<number | "">("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([createInitialRow()]);
  const [applyStandardVAT, setApplyStandardVAT] = useState(false); // Automated Tax Switch
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fix the Stale Hook Bug: Re-evaluate and bind the selector default when cloud payload lands
  useEffect(() => {
    if (suppliers.length > 0 && !supplierId) {
      setSupplierId(suppliers[0].id);
    }
  }, [suppliers, supplierId]);

  // 2. High Precision Accumulator with Epsilon floating-point safety
  const subtotal = useMemo(() => {
    return lines.reduce((sum, l) => sum + (Math.round(parseFloat(l.amount || "0") * 100) / 100 || 0), 0);
  }, [lines]);

  // Automated 20% UK Standard VAT Calculation
  const vatAmount = useMemo(() => {
    return applyStandardVAT ? Math.round(subtotal * 20) / 100 : 0;
  }, [subtotal, applyStandardVAT]);

  const grandTotal = subtotal + vatAmount;

  const handleLineChange = (index: number, patch: Partial<DraftLine>) => {
    setLines(prev => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const addLine = () => setLines(prev => [...prev, createInitialRow()]);
  const removeLine = (index: number) => setLines(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      alert("Validation Error: Please match this bill to an active supplier profile.");
      return;
    }

    setIsSubmitting(true);

    try {
      const invoiceLines = lines
        .filter(l => l.accountId && parseFloat(l.amount) > 0)
        .map(l => ({
          accountId: l.accountId as number,
          amount: Math.round(parseFloat(l.amount) * 100) / 100,
          department: l.department
        }));

      if (invoiceLines.length === 0) {
        alert("Validation Error: Please assign assets or expense parameters to at least one row.");
        setIsSubmitting(false);
        return;
      }

      // 3. Automated Double-Entry Routing for VAT on submission
      if (applyStandardVAT && vatAmount > 0) {
        // Automatically inject standard Purchase Tax recovery row to code 2200 (VAT Control)
        invoiceLines.push({
          accountId: 2200, // Matches your standard liabilities mapping
          amount: vatAmount,
          department: "Admin"
        });
      }

      // Calculate a reliable 30-day fallback Net due date based on chosen invoice date
      const parsedInvoiceDate = new Date(date);
      parsedInvoiceDate.setDate(parsedInvoiceDate.getDate() + 30);
      const computedDueDate = parsedInvoiceDate.toISOString().slice(0, 10);

      // Submit fully parsed object parameters matching your Omit<PurchaseInvoice, "id"> type signature
      await addPurchaseInvoice({
        supplierId: Number(supplierId), 
        amount: grandTotal, // Pass the total gross cost (Net subtotal + calculated tax)
        status: "Unpaid",
        date: date,
        dueDate: computedDueDate,
        invoiceNumber: reference.trim()
      });

      // Clear input dashboard workspace upon successful commit
      setReference("");
      setDescription("");
      setApplyStandardVAT(false);
      setLines([createInitialRow()]);
      alert("🎉 Purchase invoice successfully posted to payables ledger.");
    } catch (err) {
      console.error("Failed to commit vendor bill entry:", err);
      alert("Database error: Failed to save invoice parameters.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        <h1 className="accounting-title">New Purchase Invoice</h1>
        <p className="accounting-subtitle">
          Record supplier invoices, parts batch acquisitions, and tool costs directly to your ledger accounts.
        </p>

        <hr className="divider" />

        <form className="journal-form" onSubmit={handleSubmit}>
          {/* --- TOP HEADER ROW --- */}
          <div className="form-row" style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <label style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              Supplier / Vendor Entity
              <select value={supplierId} onChange={e => setSupplierId(e.target.value ? Number(e.target.value) : "")} required disabled={isSubmitting || loading}>
                {suppliers.length === 0 && <option value="">No suppliers configured</option>}
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>

            <label style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              Invoice Date
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required disabled={isSubmitting} />
            </label>

            <label style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              Supplier Invoice # / Ref Code
              <input type="text" placeholder="e.g. INV-20394" value={reference} onChange={e => setReference(e.target.value)} required disabled={isSubmitting} />
            </label>
          </div>

          <div className="form-row" style={{ marginBottom: "1rem" }}>
            <label className="notes-label" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
              Invoice Narrative / Material Summary Memo
              <textarea placeholder="e.g. Batch ordering of replacement mainsprings, seals, and cleaning solution barrels..." value={description} onChange={e => setDescription(e.target.value)} rows={2} required disabled={isSubmitting} />
            </label>
          </div>

          {/* --- INVOICE LINE DISTRIBUTION GRID --- */}
          <table className="ledger-table" style={{ marginTop: "1rem", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Expense Account or Stock Target Allocation</th>
                <th style={{ width: "25%" }}>Department Link</th>
                <th style={{ width: "21%", textAlign: "right" }}>Net Amount</th>
                <th style={{ width: "4%" }}></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={index}>
                  <td>
                    <select
                      value={line.accountId}
                      onChange={e => handleLineChange(index, { accountId: e.target.value ? Number(e.target.value) : "" })}
                      required
                      disabled={isSubmitting}
                      style={{ width: "100%" }}
                    >
                      <option value="">Select ledger account destination…</option>
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <select value={line.department} onChange={e => handleLineChange(index, { department: e.target.value as Department })} disabled={isSubmitting} style={{ width: "100%" }}>
                      <option value="Watch Studio">Watch Studio</option>
                      <option value="Clock Workshop">Clock Workshop</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>

                  <td>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="£0.00"
                      value={line.amount}
                      onChange={e => handleLineChange(index, { amount: e.target.value })}
                      required
                      disabled={isSubmitting}
                      style={{ textAlign: "right", width: "100%" }}
                    />
                  </td>

                  <td style={{ textAlign: "center" }}>
                    {lines.length > 1 && (
                      <button type="button" className="small-button danger" onClick={() => removeLine(index)} disabled={isSubmitting}>✕</button>
                    )}
                  </td>
                </tr>
              ))}

              <tr>
                <td colSpan={4} style={{ background: "#fdfbf7" }}>
                  <button type="button" className="small-button" onClick={addLine} disabled={isSubmitting}>
                    ✚ Add New Item Line
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          {/* --- AUTOMATED TAX & CALCULATOR METRICS FOOTER --- */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", padding: "1rem", background: "#fdfbf7", border: "1px solid #d2c4a8", borderRadius: "6px" }}>
            {/* Standard UK VAT Toggle Shortcut */}
            <label className="checkbox-label" style={{ fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={applyStandardVAT}
                onChange={e => setApplyStandardVAT(e.target.checked)}
                disabled={isSubmitting}
              />
              Apply Standard UK VAT Input Recovery (+20%)
            </label>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", textAlign: "right", fontSize: "0.95rem" }}>
              <span style={{ color: "#6b5c4a" }}>Net Subtotal: £{subtotal.toFixed(2)}</span>
              {applyStandardVAT && <span style={{ color: "#a24a4a" }}>Recoverable VAT (Code 2200): £{vatAmount.toFixed(2)}</span>}
              <span style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#4a3f35", borderTop: "1px dashed #c8b79a", paddingTop: "0.25rem", marginTop: "0.25rem" }}>
                Grand Total Payable: £{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="form-actions" style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button 
              type="submit" 
              className={`ledger-button ${grandTotal > 0 && !isSubmitting ? "active" : ""}`} 
              disabled={grandTotal <= 0 || isSubmitting} 
              style={{ padding: "0.6rem 2rem" }}
            >
              {isSubmitting ? "Saving Bill Entry..." : "⚡ Save & Post Purchase Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}