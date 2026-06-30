// src/pages/Accounting/Journal.tsx
import React, { useState, useMemo } from "react";
import { useAccounting } from "./AccountingContext";
import type { Department, JournalLine } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";


interface DraftLine {
  accountId: number | "";
  debit: string;
  credit: string;
  department: Department;
  customerId?: number | "";
}

const createInitialRow = (): DraftLine => ({
  accountId: "",
  debit: "",
  credit: "",
  department: "Watch Studio"
});

export default function Journal() {
  const { accounts, customers, addJournalEntry } = useAccounting();

  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([createInitialRow(), createInitialRow()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // High-precision accumulator values using epsilon matching rules
  const totalDebit = useMemo(() => {
    return lines.reduce((sum, l) => sum + (Math.round(parseFloat(l.debit || "0") * 100) / 100 || 0), 0);
  }, [lines]);

  const totalCredit = useMemo(() => {
    return lines.reduce((sum, l) => sum + (Math.round(parseFloat(l.credit || "0") * 100) / 100 || 0), 0);
  }, [lines]);

  const balancingVariance = Math.abs(totalDebit - totalCredit);
  const isEquationBalanced = balancingVariance < 0.005 && totalDebit > 0;

  const handleLineChange = (index: number, patch: Partial<DraftLine>) => {
    setLines(prev =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const updatedRow = { ...l, ...patch };

        // Mutual Lockout Guardrail: Entering a Debit clears Credit values instantly
        if (patch.debit !== undefined && parseFloat(patch.debit) > 0) {
          updatedRow.credit = "";
        }
        // Entering a Credit clears Debit values instantly
        if (patch.credit !== undefined && parseFloat(patch.credit) > 0) {
          updatedRow.debit = "";
        }

        return updatedRow;
      })
    );
  };

  const addLine = () => setLines(prev => [...prev, createInitialRow()]);
  const removeLine = (index: number) => setLines(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      alert("Bookkeeping Violation: Debits and Credits must accurately balance to zero variance.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Correctly map out complete properties to satisfy full JournalLine definition
      const journalLines: Omit<JournalLine, "id">[] = lines
        .filter(l => l.accountId && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0))
        .map((l) => {
          const matchingAccount = accounts.find(a => a.id === l.accountId);
          return {
            accountId: l.accountId as number,
            accountCode: matchingAccount ? matchingAccount.code : "UNMAPPED",
            description: description.trim(),
            debit: Math.round(parseFloat(l.debit || "0") * 100) / 100 || 0,
            credit: Math.round(parseFloat(l.credit || "0") * 100) / 100 || 0,
            department: l.department
          };
        });

      if (journalLines.length < 2) {
        alert("A valid entry requires a minimum of two rows linked to ledger account IDs.");
        setIsSubmitting(false);
        return;
      }

      await addJournalEntry({
        date,
        description: description.trim(),
        // Fixed: Ensure a concrete fallback string is always handed over to the context contract
        reference: reference.trim() || `JV-${Date.now()}`,
        lines: journalLines as JournalLine[]
      });

      setDescription("");
      setReference("");
      setLines([createInitialRow(), createInitialRow()]);
      alert("🎉 Double-entry journal transaction posted successfully.");
    } catch (err) {
      console.error("Critical entry exception:", err);
      alert("Failed to write balancing lines to your accounts backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        <h1 className="accounting-title">Manual Journal Ledger</h1>
        <p className="accounting-subtitle">
          Inscribe standard double-entry balancing lines mapped straight to workshop tracking accounts.
        </p>

        <hr className="divider" />

        <form className="journal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Transaction Booking Date
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required disabled={isSubmitting} />
            </label>

            <label>
              Audit Reference Code / Document Number
              <input type="text" placeholder="e.g. TRF-4029" value={reference} onChange={e => setReference(e.target.value)} disabled={isSubmitting} />
            </label>
          </div>

          <div className="form-row">
            <label className="notes-label">
              Detailed Transaction Description Narrative
              <textarea placeholder="Write clear audit trail memo details explaining this balancing entry..." value={description} onChange={e => setDescription(e.target.value)} rows={2} required disabled={isSubmitting} />
            </label>
          </div>

          {/* --- TRANSACTION LINE BALANCING SUBTABLE --- */}
          <table className="ledger-table" style={{ marginTop: "1rem", width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ width: "30%", textAlign: "left" }}>Target Ledger Account</th>
                <th style={{ width: "20%", textAlign: "left" }}>Department Link</th>
                <th style={{ width: "20%", textAlign: "left" }}>Subledger Customer Link</th>
                <th style={{ width: "13%", textAlign: "right" }}>Debit Amount</th>
                <th style={{ width: "13%", textAlign: "right" }}>Credit Amount</th>
                <th style={{ width: "4%" }}></th>
              </tr>
            </thead>

            <tbody>
              {lines.map((line, index) => (
                <tr key={index}>
                  {/* ACCOUNT SELECTOR */}
                  <td>
                    <select
                      value={line.accountId}
                      onChange={e => handleLineChange(index, { accountId: e.target.value ? Number(e.target.value) : "" })}
                      required
                      disabled={isSubmitting}
                      style={{ width: "100%" }}
                    >
                      <option value="">Select account parameters…</option>
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                      ))}
                    </select>
                  </td>

                  {/* DEPARTMENT TARGETING */}
                  <td>
                    <select
                      value={line.department}
                      onChange={e => handleLineChange(index, { department: e.target.value as Department })}
                      disabled={isSubmitting}
                      style={{ width: "100%" }}
                    >
                      <option value="Watch Studio">Watch Studio</option>
                      <option value="Clock Workshop">Clock Workshop</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>

                  {/* OPTIONAL SUBSIDIARY CUSTOMER MAPPING */}
                  <td>
                    <select
                      value={line.customerId ?? ""}
                      onChange={e => handleLineChange(index, { customerId: e.target.value ? Number(e.target.value) : undefined })}
                      disabled={isSubmitting}
                      style={{ width: "100%" }}
                    >
                      <option value="">— Independent Overhead —</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </td>

                  {/* DEBIT ENTRY */}
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      min="0.00"
                      placeholder="£0.00"
                      value={line.debit}
                      onChange={e => handleLineChange(index, { debit: e.target.value })}
                      disabled={isSubmitting || !!line.credit}
                      style={{ width: "100%", textAlign: "right", fontWeight: line.debit ? "bold" : "normal" }}
                    />
                  </td>

                  {/* CREDIT ENTRY */}
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      min="0.00"
                      placeholder="£0.00"
                      value={line.credit}
                      onChange={e => handleLineChange(index, { credit: e.target.value })}
                      disabled={isSubmitting || !!line.debit}
                      style={{ width: "100%", textAlign: "right", fontWeight: line.credit ? "bold" : "normal" }}
                    />
                  </td>

                  {/* REMOVE ACTIVE ROW ELEMENT */}
                  <td style={{ textAlign: "center" }}>
                    {lines.length > 2 && (
                      <button type="button" className="small-button danger" onClick={() => removeLine(index)} disabled={isSubmitting}>✕</button>
                    )}
                  </td>
                </tr>
              ))}

              {/* ACTION: ROW INSTANTIATION TRIGGERS */}
              <tr>
                <td colSpan={6} style={{ background: "#fdfbf7", padding: "0.5rem" }}>
                  <button type="button" className="small-button active" onClick={addLine} disabled={isSubmitting}>
                    ✚ Append New Entry Line
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          {/* --- BOTTOM CALCULATION LEDGER METRICS BLOCK --- */}
          <div 
            className="journal-totals" 
            style={{ 
              display: "flex", 
              justifyContent: "flex-end", 
              alignItems: "center", 
              gap: "2rem", 
              marginTop: "1.5rem", 
              padding: "0.75rem", 
              background: isEquationBalanced ? "#edf7ed" : "#fff5f5", 
              borderRadius: "4px", 
              border: isEquationBalanced ? "1px solid #c3e6cb" : "1px solid #c27a7a" 
            }}
          >
            <span style={{ color: "#4a3f35", fontSize: "0.9rem" }}>
              Total Debit Sum: <strong>£{totalDebit.toFixed(2)}</strong>
            </span>
            <span style={{ color: "#4a3f35", fontSize: "0.9rem" }}>
              Total Credit Sum: <strong>£{totalCredit.toFixed(2)}</strong>
            </span>
            <div style={{ marginLeft: "1rem" }}>
              {isEquationBalanced ? (
                <span style={{ color: "#1e4620", fontWeight: "bold", fontSize: "0.9rem" }}>✓ Ledger Entry Balanced</span>
              ) : (
                <span style={{ color: "#7a1f1f", fontWeight: "bold", fontSize: "0.9rem" }}>
                  {balancingVariance > 0 ? `⚠️ Variance: £${balancingVariance.toFixed(2)}` : "⚠️ Values Required"}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button
              type="submit"
              className={`ledger-button ${isEquationBalanced && !isSubmitting ? "active" : ""}`}
              style={{ padding: "0.55rem 1.5rem" }}
              disabled={!isEquationBalanced || isSubmitting}
            >
              {isSubmitting ? "Committing Entry..." : "⚡ Post Balancing Entry"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}