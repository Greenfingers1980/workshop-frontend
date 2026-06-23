import { useState } from "react";
import { useAccounting } from "./AccountingContext";
import type { Department } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";
import "./Accounting.css";

interface DraftLine {
  accountId: number | "";
  amount: string;
  department: Department;
}

const emptyLine = (): DraftLine => ({
  accountId: "",
  amount: "",
  department: "Admin"
});

export default function NewPurchaseInvoice() {
  const { suppliers, accounts, addPurchaseInvoice } = useAccounting();

  const [supplierId, setSupplierId] = useState<number | "">(
    suppliers[0]?.id ?? ""
  );
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([emptyLine()]);

  const total = lines.reduce(
    (sum, l) => sum + (parseFloat(l.amount || "0") || 0),
    0
  );

  const handleLineChange = (index: number, patch: Partial<DraftLine>) => {
    setLines(prev =>
      prev.map((l, i) => (i === index ? { ...l, ...patch } : l))
    );
  };

  const addLine = () => {
    setLines(prev => [...prev, emptyLine()]);
  };

  const removeLine = (index: number) => {
    setLines(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      alert("Please select a supplier.");
      return;
    }

    const invoiceLines = lines
      .filter(l => l.accountId && l.amount)
      .map(l => ({
        accountId: l.accountId as number,
        amount: parseFloat(l.amount),
        department: l.department
      }));

    if (invoiceLines.length === 0) {
      alert("Please enter at least one line.");
      return;
    }

    addPurchaseInvoice({
      supplierId: supplierId as number,
      date,
      reference: reference.trim(),
      description: description.trim(),
      lines: invoiceLines,
      total
    });

    // Reset form
    setReference("");
    setDescription("");
    setLines([emptyLine()]);
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        <h1 className="accounting-title">New Purchase Invoice</h1>
        <p className="accounting-subtitle">
          Record supplier invoices and automatically post them to the ledger.
        </p>

        <hr className="divider" />

        <form className="journal-form" onSubmit={handleSubmit}>
          {/* ---------------------- */}
          {/* HEADER FIELDS */}
          {/* ---------------------- */}
          <div className="form-row">
            <label>
              Supplier
              <select
                value={supplierId}
                onChange={e =>
                  setSupplierId(e.target.value ? Number(e.target.value) : "")
                }
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Date
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </label>

            <label>
              Reference
              <input
                type="text"
                value={reference}
                onChange={e => setReference(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label className="notes-label">
              Description
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
              />
            </label>
          </div>

          {/* ---------------------- */}
          {/* INVOICE LINES */}
          {/* ---------------------- */}
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Expense / Stock Account</th>
                <th>Department</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {lines.map((line, index) => (
                <tr key={index}>
                  {/* ACCOUNT */}
                  <td>
                    <select
                      value={line.accountId}
                      onChange={e =>
                        handleLineChange(index, {
                          accountId: e.target.value
                            ? Number(e.target.value)
                            : ""
                        })
                      }
                    >
                      <option value="">Select account…</option>
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.code} {a.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* DEPARTMENT */}
                  <td>
                    <select
                      value={line.department}
                      onChange={e =>
                        handleLineChange(index, {
                          department: e.target.value as Department
                        })
                      }
                    >
                      <option value="Watch Studio">Watch Studio</option>
                      <option value="Clock Workshop">Clock Workshop</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>

                  {/* AMOUNT */}
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={line.amount}
                      onChange={e =>
                        handleLineChange(index, { amount: e.target.value })
                      }
                    />
                  </td>

                  {/* REMOVE LINE */}
                  <td>
                    {lines.length > 1 && (
                      <button
                        type="button"
                        className="small-button danger"
                        onClick={() => removeLine(index)}
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {/* ADD LINE BUTTON */}
              <tr>
                <td colSpan={4}>
                  <button
                    type="button"
                    className="small-button"
                    onClick={addLine}
                  >
                    + Add line
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ---------------------- */}
          {/* TOTAL */}
          {/* ---------------------- */}
          <div className="journal-totals">
            <span>Total: £{total.toFixed(2)}</span>
          </div>

          {/* ---------------------- */}
          {/* SUBMIT */}
          {/* ---------------------- */}
          <div className="form-actions">
            <button type="submit" className="ledger-button">
              Save Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
