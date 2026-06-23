import { useMemo, useState } from "react";
import { useAccounting } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";
import "./Accounting.css";

interface TrialBalanceRow {
  accountId: number;
  code: string;
  name: string;
  type: string;
  debit: number;
  credit: number;
  balance: number;
}

export default function TrialBalance() {
  const { accounts, journalEntries } = useAccounting();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");

  // Get all unique departments from journal entries
  const departments = useMemo(() => {
    const depts = new Set<string>();
    depts.add("All");
    for (const entry of journalEntries) {
      for (const line of entry.lines) {
        if (line.department) {
          depts.add(line.department);
        }
      }
    }
    return Array.from(depts).sort();
  }, [journalEntries]);

  // Calculate rows with filtering by department
  const rows = useMemo<TrialBalanceRow[]>(() => {
    const map = new Map<
      number,
      { debit: number; credit: number; type: string }
    >();

    // Initialize all accounts with their types
    for (const acc of accounts) {
      map.set(acc.id, { debit: 0, credit: 0, type: acc.type });
    }

    // Sum through journal entries, filtering by department
    for (const entry of journalEntries) {
      for (const line of entry.lines) {
        // Filter by selected department
        if (
          selectedDepartment !== "All" &&
          line.department !== selectedDepartment
        ) {
          continue;
        }

        const current = map.get(line.accountId);
        if (current) {
          map.set(line.accountId, {
            debit: current.debit + line.debit,
            credit: current.credit + line.credit,
            type: current.type
          });
        }
      }
    }

    const result: TrialBalanceRow[] = [];
    for (const acc of accounts) {
      const totals = map.get(acc.id) ?? { debit: 0, credit: 0, type: acc.type };
      const balance = totals.debit - totals.credit;

      // Only show non-zero accounts
      if (totals.debit !== 0 || totals.credit !== 0 || balance !== 0) {
        result.push({
          accountId: acc.id,
          code: acc.code,
          name: acc.name,
          type: totals.type,
          debit: totals.debit,
          credit: totals.credit,
          balance: balance
        });
      }
    }

    // Sort by account code
    return result.sort((a, b) => a.code.localeCompare(b.code));
  }, [accounts, journalEntries, selectedDepartment]);

  // Calculate totals
  const totals = useMemo(
    () => ({
      debit: rows.reduce((sum, r) => sum + r.debit, 0),
      credit: rows.reduce((sum, r) => sum + r.credit, 0),
      balanceDebit: rows
        .filter(r => r.balance > 0)
        .reduce((sum, r) => sum + r.balance, 0),
      balanceCredit: rows
        .filter(r => r.balance < 0)
        .reduce((sum, r) => sum - r.balance, 0)
    }),
    [rows]
  );

  const balanced =
    Math.abs(totals.debit - totals.credit) < 0.005 &&
    Math.abs(totals.balanceDebit - totals.balanceCredit) < 0.005;

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        <h1 className="accounting-title">Trial Balance</h1>
        <p className="accounting-subtitle">
          Summary of all ledger accounts with debit, credit, and balance columns.
        </p>

        <hr className="divider" />

        {/* Department Filter */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            htmlFor="dept-filter"
            style={{
              fontWeight: "bold",
              marginRight: "0.5rem",
              display: "inline-block"
            }}
          >
            Filter by Department:
          </label>
          <select
            id="dept-filter"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "4px",
              border: "1px solid #9b8b6f",
              backgroundColor: "#fff",
              cursor: "pointer",
              fontFamily: "inherit"
            }}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Trial Balance Table */}
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account</th>
              <th>Type</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6}>
                  No postings
                  {selectedDepartment !== "All"
                    ? ` in ${selectedDepartment} department`
                    : ""}{" "}
                  yet.
                </td>
              </tr>
            )}

            {rows.map((row) => (
              <tr key={row.accountId}>
                <td style={{ fontWeight: "bold" }}>{row.code}</td>
                <td>{row.name}</td>
                <td style={{ fontSize: "0.85rem", color: "#555" }}>
                  {row.type}
                </td>
                <td style={{ textAlign: "right" }}>
                  {row.debit ? `£${row.debit.toFixed(2)}` : ""}
                </td>
                <td style={{ textAlign: "right" }}>
                  {row.credit ? `£${row.credit.toFixed(2)}` : ""}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: "bold",
                    color: row.balance > 0 ? "#2c3e50" : "#c0504d"
                  }}
                >
                  {row.balance
                    ? `£${Math.abs(row.balance).toFixed(2)} ${row.balance > 0 ? "Dr" : "Cr"}`
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr style={{ fontWeight: "bold", background: "#e8dcc8" }}>
              <th colSpan={3}>Totals</th>
              <th style={{ textAlign: "right" }}>£{totals.debit.toFixed(2)}</th>
              <th style={{ textAlign: "right" }}>
                £{totals.credit.toFixed(2)}
              </th>
              <th style={{ textAlign: "right" }}>
                Balance: £{totals.balanceDebit.toFixed(2)} Dr / £
                {totals.balanceCredit.toFixed(2)} Cr
              </th>
            </tr>
          </tfoot>
        </table>

        {/* Validation Messages */}
        <div style={{ marginTop: "1.5rem" }}>
          {balanced ? (
            <div
              style={{
                padding: "0.75rem",
                background: "#d4edda",
                color: "#155724",
                borderRadius: "4px",
                border: "1px solid #c3e6cb"
              }}
            >
              ✓ Trial balance is in balance. Debits (£{totals.debit.toFixed(2)}) = Credits (£{totals.credit.toFixed(2)})
            </div>
          ) : (
            <div
              style={{
                padding: "0.75rem",
                background: "#f8d7da",
                color: "#721c24",
                borderRadius: "4px",
                border: "1px solid #f5c6cb"
              }}
            >
              ✗ Trial balance does not agree. Debits (£{totals.debit.toFixed(2)}) ≠ Credits (£{totals.credit.toFixed(2)})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
