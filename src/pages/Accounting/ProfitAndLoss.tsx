import { useMemo } from "react";
import { useAccounting } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";
import "./Accounting.css";

interface PLRow {
  code: string;
  name: string;
  amount: number;
}

export default function ProfitAndLoss() {
  const { accounts, journalEntries } = useAccounting();

  // -----------------------------
  // BUILD INCOME + EXPENSE TOTALS
  // -----------------------------
  const { incomeRows, expenseRows, totalIncome, totalExpenses } = useMemo(() => {
    const incomeRows: PLRow[] = [];
    const expenseRows: PLRow[] = [];

    const totals = new Map<number, number>(); // accountId → net amount

    // Sum all journal lines by account
    for (const entry of journalEntries) {
      for (const line of entry.lines) {
        const prev = totals.get(line.accountId) ?? 0;
        totals.set(line.accountId, prev + (line.credit - line.debit));
      }
    }

    // Classify accounts
    for (const acc of accounts) {
      const net = totals.get(acc.id) ?? 0;

      if (acc.type === "Income") {
        if (net !== 0) {
          incomeRows.push({
            code: acc.code,
            name: acc.name,
            amount: net // income is normally credit → positive
          });
        }
      }

      if (acc.type === "Expense") {
        if (net !== 0) {
          expenseRows.push({
            code: acc.code,
            name: acc.name,
            amount: -net // expenses are normally debit → negative net
          });
        }
      }
    }

    const totalIncome = incomeRows.reduce((s, r) => s + r.amount, 0);
    const totalExpenses = expenseRows.reduce((s, r) => s + r.amount, 0);

    return { incomeRows, expenseRows, totalIncome, totalExpenses };
  }, [accounts, journalEntries]);

  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        <h1 className="accounting-title">Profit & Loss</h1>
        <p className="accounting-subtitle">
          Income, expenses, and net profit for the period.
        </p>

        <hr className="divider" />

        {/* ---------------------- */}
        {/* INCOME SECTION */}
        {/* ---------------------- */}
        <h2 className="section-title">Income</h2>

        <table className="ledger-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>

          <tbody>
            {incomeRows.length === 0 && (
              <tr>
                <td colSpan={3}>No income recorded.</td>
              </tr>
            )}

            {incomeRows.map((row, idx) => (
              <tr key={idx}>
                <td>{row.code}</td>
                <td>{row.name}</td>
                <td style={{ textAlign: "right" }}>£{row.amount.toFixed(2)}</td>
              </tr>
            ))}

            <tr>
              <th colSpan={2}>Total Income</th>
              <th style={{ textAlign: "right" }}>£{totalIncome.toFixed(2)}</th>
            </tr>
          </tbody>
        </table>

        <hr className="divider" />

        {/* ---------------------- */}
        {/* EXPENSE SECTION */}
        {/* ---------------------- */}
        <h2 className="section-title">Expenses</h2>

        <table className="ledger-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>

          <tbody>
            {expenseRows.length === 0 && (
              <tr>
                <td colSpan={3}>No expenses recorded.</td>
              </tr>
            )}

            {expenseRows.map((row, idx) => (
              <tr key={idx}>
                <td>{row.code}</td>
                <td>{row.name}</td>
                <td style={{ textAlign: "right" }}>£{row.amount.toFixed(2)}</td>
              </tr>
            ))}

            <tr>
              <th colSpan={2}>Total Expenses</th>
              <th style={{ textAlign: "right" }}>£{totalExpenses.toFixed(2)}</th>
            </tr>
          </tbody>
        </table>

        <hr className="divider" />

        {/* ---------------------- */}
        {/* NET PROFIT */}
        {/* ---------------------- */}
        <h2 className="section-title">Net Result</h2>

        <table className="ledger-table">
          <tbody>
            <tr>
              <th>Net {netProfit >= 0 ? "Profit" : "Loss"}</th>
              <th style={{ textAlign: "right" }}>
                £{Math.abs(netProfit).toFixed(2)}
              </th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
