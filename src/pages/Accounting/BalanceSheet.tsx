import { useMemo, useState } from "react";
import { useAccounting } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";


interface BSRow {
  code: string;
  name: string;
  amount: number;
  type: string;
}

interface BalanceSheetData {
  assets: {
    bank: BSRow[];
    stock: BSRow[];
    wip: BSRow[]; // Horological Work-in-Progress Tracking
    other: BSRow[];
    total: number;
  };
  liabilities: {
    vat: BSRow[];
    deposits: BSRow[]; // Unearned Customer Deposits tracking
    other: BSRow[];
    total: number;
  };
  equity: BSRow[];
  totalEquity: number;
}

export default function BalanceSheet() {
  const { accounts, journalEntries } = useAccounting();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");

  // 1. Extract unique departments linearly
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

  // 2. Balance Sheet Computation Pipeline
  const data = useMemo<BalanceSheetData>(() => {
    const totals = new Map<number, number>();

    // Calculate aggregated balances using linear runtimes
    journalEntries.forEach(entry => {
      entry.lines?.forEach(line => {
        // Departmental parsing safety guardrail
        if (selectedDepartment !== "All" && line.department !== selectedDepartment) {
          return;
        }
        const currentBal = totals.get(line.accountId) ?? 0;
        totals.set(line.accountId, currentBal + (line.debit - line.credit));
      });
    });

    const bankAccounts: BSRow[] = [];
    const stockAccounts: BSRow[] = [];
    const wipAccounts: BSRow[] = [];
    const otherAssets: BSRow[] = [];
    const vatLiabilities: BSRow[] = [];
    const depositLiabilities: BSRow[] = [];
    const otherLiabilities: BSRow[] = [];
    const equityAccounts: BSRow[] = [];

    accounts.forEach(acc => {
      const netBalance = totals.get(acc.id) ?? 0;
      if (netBalance === 0) return;

      const lowerName = acc.name.toLowerCase();

      if (acc.type === "Asset") {
        const row: BSRow = { code: acc.code, name: acc.name, amount: netBalance, type: acc.type };
        
        if (acc.code === "1000" || lowerName.includes("bank") || lowerName.includes("cash")) {
          bankAccounts.push(row);
        } else if (acc.code === "1200" || lowerName.includes("stock") || lowerName.includes("parts inventory")) {
          stockAccounts.push(row);
        } else if (lowerName.includes("wip") || lowerName.includes("work in progress")) {
          wipAccounts.push(row);
        } else {
          otherAssets.push(row);
        }
      }

      if (acc.type === "Liability") {
        // Liabilities naturally express as credit values on structural sheets
        const row: BSRow = { code: acc.code, name: acc.name, amount: -netBalance, type: acc.type };
        
        if (acc.code === "2200" || lowerName.includes("vat") || lowerName.includes("tax")) {
          vatLiabilities.push(row);
        } else if (lowerName.includes("deposit") || lowerName.includes("prepayment")) {
          depositLiabilities.push(row);
        } else {
          otherLiabilities.push(row);
        }
      }

      if (acc.type === "Equity") {
        equityAccounts.push({ code: acc.code, name: acc.name, amount: -netBalance, type: acc.type });
      }
    });

    return {
      assets: {
        bank: bankAccounts,
        stock: stockAccounts,
        wip: wipAccounts,
        other: otherAssets,
        total: [...bankAccounts, ...stockAccounts, ...wipAccounts, ...otherAssets].reduce((s, r) => s + r.amount, 0)
      },
      liabilities: {
        vat: vatLiabilities,
        deposits: depositLiabilities,
        other: otherLiabilities,
        total: [...vatLiabilities, ...depositLiabilities, ...otherLiabilities].reduce((s, r) => s + r.amount, 0)
      },
      equity: equityAccounts,
      totalEquity: equityAccounts.reduce((s, r) => s + r.amount, 0)
    };
  }, [accounts, journalEntries, selectedDepartment]);

  // Match Equations Guardrail (Assets = Liabilities + Equity)
  const totalFunding = data.liabilities.total + data.totalEquity;
  const isBalanced = Math.abs(data.assets.total - totalFunding) < 0.01;

  // Reusable sub-row renderer
  const renderBSRows = (rows: BSRow[], emptyMessage: string) => {
    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={3} style={{ color: "#6b5c4a", fontStyle: "italic" }}>
            {emptyMessage}
          </td>
        </tr>
      );
    }
    return rows.map((row, idx) => (
      <tr key={idx}>
        <td>{row.code}</td>
        <td>{row.name}</td>
        <td style={{ textAlign: "right" }}>£{row.amount.toFixed(2)}</td>
      </tr>
    ));
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="accounting-title">Balance Sheet</h1>
            <p className="accounting-subtitle">Statement of financial position — Assets, Liabilities, and Equity.</p>
          </div>
          {/* Dynamic Balanced Indicator Flag */}
          <div className={`badge-balance ${isBalanced ? "balanced" : "unbalanced"}`}>
            {isBalanced ? "✅ Ledger Balanced" : "⚠️ Out of Balance"}
          </div>
        </div>

        <hr className="divider" />

        {/* Warning Callout for Departmental Balance Sheet Filtering */}
        {selectedDepartment !== "All" && (
          <div style={{ padding: "0.75rem", background: "#fff5f5", border: "1px solid #c27a7a", borderRadius: "4px", marginBottom: "1rem", fontSize: "0.85rem", color: "#7a1f1f" }}>
            <strong>Accounting Alert:</strong> Filtering a Balance Sheet by department provides an operational view only. Overhead entries (like central bank accounts or VAT) will not balance properly out of context.
          </div>
        )}

        {/* Department Filter Selector */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="bs-dept-filter" style={{ fontWeight: "bold", marginRight: "0.5rem" }}>
            Filter View by Department:
          </label>
          <select
            id="bs-dept-filter"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            style={{ padding: "0.4rem 0.8rem", borderRadius: "4px", border: "1px solid #c8b79a", fontFamily: "inherit" }}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* --- ASSETS SECTION --- */}
        <h2 className="section-title" style={{ marginTop: "1.5rem", borderBottom: "2px solid #4a3f35" }}>1. Assets</h2>
        
        <h4 style={{ margin: "0.5rem 0 0.2rem 0", color: "#6b5c4a" }}>Liquid Bank Funds</h4>
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account Link</th>
              <th style={{ textAlign: "right" }}>Balance</th>
            </tr>
          </thead>
          <tbody>{renderBSRows(data.assets.bank, "No banking lines logged.")}</tbody>
        </table>

        <h4 style={{ margin: "0.5rem 0 0.2rem 0", color: "#6b5c4a" }}>Stock & Component Inventory</h4>
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account Link</th>
              <th style={{ textAlign: "right" }}>Balance</th>
            </tr>
          </thead>
          <tbody>{renderBSRows(data.assets.stock, "No inventory assets logged.")}</tbody>
        </table>

        <h4 style={{ margin: "0.5rem 0 0.2rem 0", color: "#6b5c4a" }}>Work-In-Progress (Pre-Allocated Job Parts)</h4>
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account Link</th>
              <th style={{ textAlign: "right" }}>Balance</th>
            </tr>
          </thead>
          <tbody>{renderBSRows(data.assets.wip, "No active work-in-progress tracked.")}</tbody>
        </table>

        <div className="summary-row" style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", background: "#e9ddc7", fontWeight: "bold", marginBottom: "1.5rem" }}>
          <span>TOTAL ASSETS (A)</span>
          <span>£{data.assets.total.toFixed(2)}</span>
        </div>

        {/* --- LIABILITIES SECTION --- */}
        <h2 className="section-title" style={{ marginTop: "1.5rem", borderBottom: "2px solid #4a3f35" }}>2. Liabilities</h2>
        
        <h4 style={{ margin: "0.5rem 0 0.2rem 0", color: "#6b5c4a" }}>HMRC VAT Subledger</h4>
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account Link</th>
              <th style={{ textAlign: "right" }}>Balance</th>
            </tr>
          </thead>
          <tbody>{renderBSRows(data.liabilities.vat, "No VAT values logged.")}</tbody>
        </table>

        <h4 style={{ margin: "0.5rem 0 0.2rem 0", color: "#6b5c4a" }}>Customer Repair Deposits (Unearned Funds)</h4>
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account Link</th>
              <th style={{ textAlign: "right" }}>Balance</th>
            </tr>
          </thead>
          <tbody>{renderBSRows(data.liabilities.deposits, "No client repair deposits held.")}</tbody>
        </table>

        <div className="summary-row" style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", background: "#e9ddc7", fontWeight: "bold", marginBottom: "1.5rem" }}>
          <span>TOTAL LIABILITIES (B)</span>
          <span>£{data.liabilities.total.toFixed(2)}</span>
        </div>

        {/* --- EQUITY SECTION --- */}
        <h2 className="section-title" style={{ marginTop: "1.5rem", borderBottom: "2px solid #4a3f35" }}>3. Capital & Equity</h2>
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account Link</th>
              <th style={{ textAlign: "right" }}>Balance</th>
            </tr>
          </thead>
          <tbody>{renderBSRows(data.equity, "No capital lines logged.")}</tbody>
        </table>

        <div className="summary-row" style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", background: "#e9ddc7", fontWeight: "bold", marginBottom: "1.5rem" }}>
          <span>TOTAL EQUITY (C)</span>
          <span>£{data.totalEquity.toFixed(2)}</span>
        </div>

        {/* --- TOTAL FUNDING SUMMARY FOOTER --- */}
        <div 
          className="summary-row" 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            padding: "0.75rem 0.5rem", 
            background: "#4a3f35", 
            color: "#f7f1e3", 
            fontWeight: "bold",
            borderRadius: "4px"
          }}
        >
          <span>TOTAL FUNDING & EQUITY (B + C)</span>
          <span>£{totalFunding.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
