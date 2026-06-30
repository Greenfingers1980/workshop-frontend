import { useMemo, useState } from "react";
import { useAccounting } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";


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
  const { accounts, journalEntries, loading } = useAccounting();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");

  // 1. High Performance: Isolate available department filters using single-pass sets
  const departments = useMemo(() => {
    if (!journalEntries) return ["All"];
    const depts = new Set<string>(["All"]);
    journalEntries.forEach(entry => {
      entry.lines?.forEach(line => {
        if (line.department) depts.add(line.department);
      });
    });
    return Array.from(depts).sort();
  }, [journalEntries]);

  // 2. High Precision Account Balancing Pipeline
  const rows = useMemo<TrialBalanceRow[]>(() => {
    const map = new Map<number, { debit: number; credit: number; type: string }>();

    // Seed accounting parameters instantly
    accounts.forEach(acc => {
      map.set(acc.id, { debit: 0, credit: 0, type: acc.type });
    });

    // Populate balances from general journal streams
    journalEntries.forEach(entry => {
      entry.lines?.forEach(line => {
        // Apply department validation checks safely
        if (selectedDepartment !== "All" && line.department !== selectedDepartment) {
          return;
        }

        const current = map.get(line.accountId);
        if (current) {
          map.set(line.accountId, {
            debit: Math.round((current.debit + line.debit) * 100) / 100,
            credit: Math.round((current.credit + line.credit) * 100) / 100,
            type: current.type
          });
        }
      });
    });

    const result: TrialBalanceRow[] = [];
    accounts.forEach(acc => {
      const totals = map.get(acc.id) ?? { debit: 0, credit: 0, type: acc.type };
      const netBalance = totals.debit - totals.credit;

      // Filter out raw inactive accounts cleanly to save screen real estate
      if (totals.debit !== 0 || totals.credit !== 0 || Math.abs(netBalance) > 0.005) {
        result.push({
          accountId: acc.id,
          code: acc.code,
          name: acc.name,
          type: totals.type,
          debit: totals.debit,
          credit: totals.credit,
          balance: netBalance
        });
      }
    });

    return result.sort((a, b) => a.code.localeCompare(b.code));
  }, [accounts, journalEntries, selectedDepartment]);

  // 3. Compute Double-Entry Verification Totals
  const totals = useMemo(() => {
    let rawDebitSum = 0;
    let rawCreditSum = 0;
    let netDebitBalanceSum = 0;
    let netCreditBalanceSum = 0;

    rows.forEach(r => {
      rawDebitSum += r.debit;
      rawCreditSum += r.credit;
      
      if (r.balance > 0) netDebitBalanceSum += r.balance;
      else if (r.balance < 0) netCreditBalanceSum += Math.abs(r.balance);
    });

    return {
      debit: Math.round(rawDebitSum * 100) / 100,
      credit: Math.round(rawCreditSum * 100) / 100,
      balanceDebit: Math.round(netDebitBalanceSum * 100) / 100,
      balanceCredit: Math.round(netCreditBalanceSum * 100) / 100
    };
  }, [rows]);

  // Epsilon validation checks matching financial rounding standards
  const isEquationBalanced =
    Math.abs(totals.debit - totals.credit) < 0.02 &&
    Math.abs(totals.balanceDebit - totals.balanceCredit) < 0.02;

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        
        <h1 className="accounting-title">General Trial Balance</h1>
        <p className="accounting-subtitle">
          Summary compilation of all general ledger activity mapping mathematical balance matching verification points.
        </p>

        <hr className="divider" />

        {/* Dynamic Accounting Context Warning Callout */}
        {selectedDepartment !== "All" && (
          <div style={{ padding: "0.75rem", background: "#fff5f5", border: "1px solid #c27a7a", borderRadius: "4px", marginBottom: "1rem", fontSize: "0.85rem", color: "#7a1f1f" }}>
            <strong>Departmental Context Alert:</strong> Running a trial balance across a subset filter can present matching variances. Central accounts (like liquid banking assets or tax adjustments) operate business-wide and won't offset cleanly out of context.
          </div>
        )}

        {/* Department Filter Navigation Dock */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="dept-filter" style={{ fontWeight: "bold", marginRight: "0.5rem" }}>
            Filter Verification View by Segment:
          </label>
          <select
            id="dept-filter"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            disabled={loading}
            style={{ padding: "0.4rem 0.8rem", borderRadius: "4px", border: "1px solid #c8b79a", fontFamily: "inherit" }}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Main Records Presentation Grid */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#6b5c4a" }}>Compiling account metrics...</div>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th style={{ width: "12%" }}>Account Code</th>
                <th style={{ width: "38%" }}>Ledger Account Title</th>
                <th style={{ width: "15%" }}>Classification Type</th>
                <th style={{ width: "11%", textAlign: "right" }}>Cumulative Debits</th>
                <th style={{ width: "11%", textAlign: "right" }}>Cumulative Credits</th>
                <th style={{ width: "13%", textAlign: "right" }}>Net Status Balance</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={6} style={{ color: "#6b5c4a", fontStyle: "italic", textAlign: "center", padding: "1.5rem" }}>No structural posting records found.</td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.accountId}>
                    <td><strong>{row.code}</strong></td>
                    <td>{row.name}</td>
                    <td>
                      <span className={`badge-type ${row.type.toLowerCase()}`}>
                        {row.type}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>{row.debit ? `£${row.debit.toFixed(2)}` : "—"}</td>
                    <td style={{ textAlign: "right" }}>{row.credit ? `£${row.credit.toFixed(2)}` : "—"}</td>
                    <td style={{ 
                      textAlign: "right", 
                      fontWeight: "bold", 
                      color: row.balance > 0 ? "#2c3e50" : row.balance < 0 ? "#7a1f1f" : "inherit" 
                    }}>
                      {row.balance !== 0 
                        ? `£${Math.abs(row.balance).toFixed(2)} ${row.balance > 0 ? "Dr" : "Cr"}`
                        : "£0.00"
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {rows.length > 0 && (
              <tfoot>
                <tr style={{ background: "#e9ddc7", fontWeight: "bold" }}>
                  <th colSpan={3}>Aggregated Statement Totals</th>
                  <th style={{ textAlign: "right" }}>£{totals.debit.toFixed(2)}</th>
                  <th style={{ textAlign: "right" }}>£{totals.credit.toFixed(2)}</th>
                  <th style={{ textAlign: "right", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    Dr £{totals.balanceDebit.toFixed(2)} / Cr £{totals.balanceCredit.toFixed(2)}
                  </th>
                </tr>
              </tfoot>
            )}
          </table>
        )}

        {/* Integrated Status Engine Notification Panel */}
        {!loading && rows.length > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            {isEquationBalanced ? (
              <div style={{ padding: "0.85rem", background: "#edf7ed", color: "#1e4620", borderRadius: "4px", border: "1px solid #c3e6cb", fontWeight: "bold" }}>
                ✓ General ledger integrity verified. Total debits perfectly offset corresponding credit parameters.
              </div>
            ) : (
              <div style={{ padding: "0.85rem", background: "#fff5f5", color: "#7a1f1f", borderRadius: "4px", border: "1px solid #c27a7a", fontWeight: "bold" }}>
                ✗ Bookkeeping Equation Alert: Trial balance values fail zero-variance validation checks. Review active adjustments.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}