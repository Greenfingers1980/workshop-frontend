import { useMemo, useState } from "react";
import { useAccounting } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";
import "./Accounting.css";

interface BSRow {
  code: string;
  name: string;
  amount: number;
  type?: string;
}

interface BalanceSheetData {
  assets: {
    bank: BSRow[];
    stock: BSRow[];
    other: BSRow[];
    total: number;
  };
  liabilities: {
    vat: BSRow[];
    other: BSRow[];
    total: number;
  };
  equity: BSRow[];
  totalEquity: number;
  stockValue: number;
  vatLiability: number;
}

export default function BalanceSheet() {
  const { accounts, journalEntries } = useAccounting();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set<string>();
    depts.add("All");
    for (const entry of journalEntries) {
      for (const line of entry.lines) {
        if (line.department) depts.add(line.department);
      }
    }
    return Array.from(depts).sort();
  }, [journalEntries]);

  // Calculate balance sheet data
  const data = useMemo<BalanceSheetData>(() => {
    const totals = new Map<number, number>(); // accountId → net balance

    // Sum journal lines by department filter
    for (const entry of journalEntries) {
      for (const line of entry.lines) {
        if (
          selectedDepartment !== "All" &&
          line.department !== selectedDepartment
        ) {
          continue;
        }
        const prev = totals.get(line.accountId) ?? 0;
        totals.set(line.accountId, prev + (line.debit - line.credit));
      }
    }

    const bankAccounts: BSRow[] = [];
    const stockAccounts: BSRow[] = [];
    const otherAssets: BSRow[] = [];
    const vatLiabilities: BSRow[] = [];
    const otherLiabilities: BSRow[] = [];
    const equityAccounts: BSRow[] = [];

    let stockValue = 0;
    let vatLiability = 0;

    for (const acc of accounts) {
      const bal = totals.get(acc.id) ?? 0;
      if (bal === 0) continue;

      if (acc.type === "Asset") {
        const row = {
          code: acc.code,
          name: acc.name,
          amount: bal,
          type: acc.type
        };

        // Categorize assets
        if (
          acc.code === "1000" ||
          acc.name.toLowerCase().includes("bank")
        ) {
          bankAccounts.push(row);
        } else if (
          acc.code === "1200" ||
          acc.name.toLowerCase().includes("stock")
        ) {
          stockAccounts.push(row);
          stockValue += bal;
        } else {
          otherAssets.push(row);
        }
      }

      if (acc.type === "Liability") {
        const row = {
          code: acc.code,
          name: acc.name,
          amount: -bal,
          type: acc.type
        };

        // Categorize liabilities
        if (acc.code === "2200" || acc.name.toLowerCase().includes("vat")) {
          vatLiabilities.push(row);
          vatLiability += -bal;
        } else {
          otherLiabilities.push(row);
        }
      }

      if (acc.type === "Equity") {
        if (bal !== 0) {
          equityAccounts.push({
            code: acc.code,
            name: acc.name,
            amount: -bal,
            type: acc.type
          });
        }
      }
    }

    const bankTotal = bankAccounts.reduce((s, r) => s + r.amount, 0);
    const stockTotal = stockAccounts.reduce((s, r) => s + r.amount, 0);
    const otherAssetsTotal = otherAssets.reduce((s, r) => s + r.amount, 0);
    const totalAssets = bankTotal + stockTotal + otherAssetsTotal;

    const vatTotal = vatLiabilities.reduce((s, r) => s + r.amount, 0);
    const otherLiabilitiesTotal = otherLiabilities.reduce(
      (s, r) => s + r.amount,
      0
    );
    const totalLiabilities = vatTotal + otherLiabilitiesTotal;

    const totalEquity = equityAccounts.reduce((s, r) => s + r.amount, 0);

    return {
      assets: {
        bank: bankAccounts,
        stock: stockAccounts,
        other: otherAssets,
        total: totalAssets
      },
      liabilities: {
        vat: vatLiabilities,
        other: otherLiabilities,
        total: totalLiabilities
      },
      equity: equityAccounts,
      totalEquity: totalEquity,
      stockValue: stockValue,
      vatLiability: vatLiability
    };
  }, [accounts, journalEntries, selectedDepartment]);

  const balanced =
    Math.abs(
      data.assets.total - (data.liabilities.total + data.totalEquity)
    ) < 0.005;

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        <h1 className="accounting-title">Balance Sheet</h1>
        <p className="accounting-subtitle">
          Statement of financial position — Assets, Liabilities, and Equity.
        </p>

        <hr className="divider" />

        {/* Department Filter */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            htmlFor="bs-dept-filter"
            style={{
              fontWeight: "bold",
              marginRight: "0.5rem",
              display: "inline-block"
            }}
          >
            Filter by Department:
          </label>
          <select
            id="bs-dept-filter"
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

        {/* ASSETS */}
        <h2 className="section-title" style={{ marginTop: "2rem" }}>
          Assets
        </h2>

        {/* Bank Accounts Subsection */}
        <h3
          style={{
            marginTop: "1rem",
            fontSize: "1rem",
            color: "#555",
            borderBottom: "1px solid #d2c4a8",
            paddingBottom: "0.5rem"
          }}
        >
          Bank Accounts
        </h3>
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.assets.bank.length === 0 ? (
              <tr>
                <td colSpan={3}>No bank accounts recorded.</td>
              </tr>
            ) : (
              <>
                {data.assets.bank.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.code}</td>
                    <td>{row.name}</td>
                    <td style={{ textAlign: "right" }}>
                      £{row.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "#f0ebe3", fontWeight: "bold" }}>
                  <td colSpan={2}>Bank Total</td>
                  <td style={{ textAlign: "right" }}>
                    £{data.assets.bank.reduce((s, r) => s + r.amount, 0).toFixed(2)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {/* Stock Valuation Subsection */}
        <h3
          style={{
            marginTop: "1rem",
            fontSize: "1rem",
            color: "#555",
            borderBottom: "1px solid #d2c4a8",
            paddingBottom: "0.5rem"
          }}
        >
          Stock & Inventory
        </h3>
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.assets.stock.length === 0 ? (
              <tr>
                <td colSpan={3}>No stock accounts recorded.</td>
              </tr>
            ) : (
              <>
                {data.assets.stock.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.code}</td>
                    <td>{row.name}</td>
                    <td style={{ textAlign: "right" }}>
                      £{row.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "#f0ebe3", fontWeight: "bold" }}>
                  <td colSpan={2}>Stock Total</td>
                  <td style={{ textAlign: "right" }}>
                    £{data.assets.stock.reduce((s, r) => s + r.amount, 0).toFixed(2)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {/* Other Assets Subsection */}
        {data.assets.other.length > 0 && (
          <>
            <h3
              style={{
                marginTop: "1rem",
                fontSize: "1rem",
                color: "#555",
                borderBottom: "1px solid #d2c4a8",
                paddingBottom: "0.5rem"
              }}
            >
              Other Assets
            </h3>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Account</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.assets.other.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.code}</td>
                    <td>{row.name}</td>
                    <td style={{ textAlign: "right" }}>
                      £{row.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "#f0ebe3", fontWeight: "bold" }}>
                  <td colSpan={2}>Other Assets Total</td>
                  <td style={{ textAlign: "right" }}>
                    £{data.assets.other.reduce((s, r) => s + r.amount, 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {/* Total Assets */}
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#e8dcc8",
            borderRadius: "4px",
            fontWeight: "bold",
            fontSize: "1.1rem",
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <span>TOTAL ASSETS</span>
          <span>£{data.assets.total.toFixed(2)}</span>
        </div>

        <hr className="divider" />

        {/* LIABILITIES */}
        <h2 className="section-title" style={{ marginTop: "2rem" }}>
          Liabilities
        </h2>

        {/* VAT Liability Subsection */}
        <h3
          style={{
            marginTop: "1rem",
            fontSize: "1rem",
            color: "#c0504d",
            borderBottom: "2px solid #c0504d",
            paddingBottom: "0.5rem"
          }}
        >
          VAT Liability
        </h3>
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.liabilities.vat.length === 0 ? (
              <tr>
                <td colSpan={3}>No VAT recorded.</td>
              </tr>
            ) : (
              <>
                {data.liabilities.vat.map((row, idx) => (
                  <tr key={idx} style={{ background: "#fde8e6" }}>
                    <td>{row.code}</td>
                    <td>{row.name}</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      £{row.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr
                  style={{
                    background: "#f5c6cb",
                    fontWeight: "bold",
                    color: "#721c24"
                  }}
                >
                  <td colSpan={2}>VAT Total</td>
                  <td style={{ textAlign: "right" }}>
                    £{data.liabilities.vat.reduce((s, r) => s + r.amount, 0).toFixed(2)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {/* Other Liabilities Subsection */}
        {data.liabilities.other.length > 0 && (
          <>
            <h3
              style={{
                marginTop: "1rem",
                fontSize: "1rem",
                color: "#555",
                borderBottom: "1px solid #d2c4a8",
                paddingBottom: "0.5rem"
              }}
            >
              Other Liabilities
            </h3>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Account</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.liabilities.other.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.code}</td>
                    <td>{row.name}</td>
                    <td style={{ textAlign: "right" }}>
                      £{row.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "#f0ebe3", fontWeight: "bold" }}>
                  <td colSpan={2}>Other Liabilities Total</td>
                  <td style={{ textAlign: "right" }}>
                    £{data.liabilities.other.reduce((s, r) => s + r.amount, 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {/* Total Liabilities */}
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#f8e6e3",
            borderRadius: "4px",
            fontWeight: "bold",
            fontSize: "1.1rem",
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <span>TOTAL LIABILITIES</span>
          <span>£{data.liabilities.total.toFixed(2)}</span>
        </div>

        <hr className="divider" />

        {/* EQUITY */}
        <h2 className="section-title" style={{ marginTop: "2rem" }}>
          Equity
        </h2>

        <table className="ledger-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.equity.length === 0 ? (
              <tr>
                <td colSpan={3}>No equity balances recorded.</td>
              </tr>
            ) : (
              <>
                {data.equity.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.code}</td>
                    <td>{row.name}</td>
                    <td style={{ textAlign: "right" }}>
                      £{row.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "#f0ebe3", fontWeight: "bold" }}>
                  <td colSpan={2}>Total Equity</td>
                  <td style={{ textAlign: "right" }}>
                    £{data.totalEquity.toFixed(2)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        <hr className="divider" />

        {/* VALIDATION */}
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
              ✓ Balance Sheet balances correctly. Assets (£
              {data.assets.total.toFixed(2)}) = Liabilities (£
              {data.liabilities.total.toFixed(2)}) + Equity (£
              {data.totalEquity.toFixed(2)})
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
              ✗ Balance Sheet does not balance — check postings.
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div
          style={{
            marginTop: "2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem"
          }}
        >
          <div
            style={{
              padding: "1rem",
              background: "#f7f1e3",
              borderRadius: "6px",
              border: "1px solid #d2c4a8"
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: "0.3rem" }}>
              Stock Valuation
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              £{data.stockValue.toFixed(2)}
            </div>
          </div>

          <div
            style={{
              padding: "1rem",
              background: "#fde8e6",
              borderRadius: "6px",
              border: "2px solid #c0504d"
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: "0.3rem" }}>
              VAT Liability
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#c0504d" }}>
              £{data.vatLiability.toFixed(2)}
            </div>
          </div>

          <div
            style={{
              padding: "1rem",
              background: "#e8dcc8",
              borderRadius: "6px",
              border: "1px solid #9b8b6f"
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: "0.3rem" }}>
              Net Working Capital
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              £
              {(
                data.assets.total - data.liabilities.total
              ).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
