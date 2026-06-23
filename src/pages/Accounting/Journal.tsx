import React, { useState } from "react";
import { useAccounting } from "./AccountingContext";
import type { Department, JournalLine } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";
import "./Accounting.css";

interface DraftLine {
  accountId: number | "";
  debit: string;
  credit: string;
  department: Department;
  customerId?: number | "";
}

const emptyLine = (): DraftLine => ({
  accountId: "",
  debit: "",
  credit: "",
  department: "Watch Studio"
});

export default function Journal() {
  const { accounts, customers, addJournalEntry } = useAccounting();

  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([emptyLine(), emptyLine()]);

  const totalDebit = lines.reduce(
    (sum, l) => sum + (parseFloat(l.debit || "0") || 0),
    0
  );
  const totalCredit = lines.reduce(
    (sum, l) => sum + (parseFloat(l.credit || "0") || 0),
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

    if (Math.abs(totalDebit - totalCredit) > 0.0001) {
      alert("Debits and credits must balance.");
      return;
    }

    const journalLines: JournalLine[] = lines
      .filter(l => l.accountId && (l.debit || l.credit))
      .map(l => ({
        id: Date.now() + Math.random(),
        accountId: l.accountId as number,
        debit: parseFloat(l.debit || "0") || 0,
        credit: parseFloat(l.credit || "0") || 0,
        department: l.department,
        customerId: l.customerId ? Number(l.customerId) : undefined
      }));

    if (journalLines.length === 0) return;

    addJournalEntry({
      date,
      description: description.trim(),
      reference: reference.trim() || undefined,
      lines: journalLines
    });

    // Reset form
    setDescription("");
    setReference("");
    setLines([emptyLine(), emptyLine()]);
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        <h1 className="accounting-title">Journal</h1>
        <p className="accounting-subtitle">
          Post double-entry journals with department per line.
        </p>

        <hr className="divider" />

        <form className="journal-form" onSubmit={handleSubmit}>
          {/* ---------------------- */}
          {/* HEADER FIELDS */}
          {/* ---------------------- */}
          <div className="form-row">
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
          {/* JOURNAL LINES */}
          {/* ---------------------- */}
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Department</th>
                <th>Customer</th>
                <th>Debit</th>
                <th>Credit</th>
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

                  {/* CUSTOMER */}
                  <td>
                    <select
                      value={line.customerId ?? ""}
                      onChange={e =>
                        handleLineChange(index, {
                          customerId: e.target.value
                            ? Number(e.target.value)
                            : undefined
                        })
                      }
                    >
                      <option value="">—</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* DEBIT */}
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={line.debit}
                      onChange={e =>
                        handleLineChange(index, { debit: e.target.value })
                      }
                    />
                  </td>

                  {/* CREDIT */}
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={line.credit}
                      onChange={e =>
                        handleLineChange(index, { credit: e.target.value })
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
                <td colSpan={6}>
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
          {/* TOTALS */}
          {/* ---------------------- */}
          <div className="journal-totals">
            <span>Total debit: £{totalDebit.toFixed(2)}</span>
            <span>Total credit: £{totalCredit.toFixed(2)}</span>
          </div>

          {/* ---------------------- */}
          {/* SUBMIT */}
          {/* ---------------------- */}
          <div className="form-actions">
            <button type="submit" className="ledger-button">
              Post Journal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
