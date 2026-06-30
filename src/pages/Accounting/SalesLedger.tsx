import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAccounting } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";


// Interface representing a processed row in the customer ledger
interface CustomerLine {
  date: string;
  description: string;
  reference?: string;
  debit: number;
  credit: number;
  balance: number;
  invoiceId?: number;
  jobId?: number;
}

export default function SalesLedger() {
  const { accounts, customers, journalEntries, loading } = useAccounting();
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  // 1. High Performance Indexing: Map accounts to a Set for O(1) existence checks
  const customerAccountIdsSet = useMemo(() => {
    return new Set(accounts.filter((a) => a.isCustomer || a.code === "1100").map((a) => a.id));
  }, [accounts]);

  // 2. Linear runtime aggregator: Calculate current balances for all customers
  const customerBalances = useMemo(() => {
    const map = new Map<number, number>();
    if (!journalEntries) return map;

    journalEntries.forEach((entry) => {
      entry.lines?.forEach((line:any) => {
        // Ensure line has customerId before processing
        if (!line.customerId || !customerAccountIdsSet.has(line.accountId)) return;
        const currentBalance = map.get(line.customerId) ?? 0;
  map.set(line.customerId, currentBalance + line.debit - line.credit);
});
    });
    return map;
  }, [journalEntries, customerAccountIdsSet]);

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // 3. Chronological Pipeline: Generate transaction history for selected customer
  const selectedCustomerLines = useMemo<CustomerLine[]>(() => {
    if (!selectedCustomer || !journalEntries) return [];

    let cumulativeBalance = 0;

    return journalEntries
      .flatMap((entry) => {
        const matches = entry.lines?.filter((l) => l.customerId === selectedCustomer.id && customerAccountIdsSet.has(l.accountId)) || [];
        return matches.map((line) => ({ entry, line }));
      })
      .sort((a, b) => a.entry.date.localeCompare(b.entry.date))
      .map(({ entry, line }) => {
        cumulativeBalance += line.debit - line.credit;
        return {
          date: entry.date,
          description: entry.description,
          reference: entry.reference,
          debit: line.debit,
          credit: line.credit,
          balance: cumulativeBalance,
          invoiceId: (line as any).invoiceId,
          jobId: (line as any).jobId,
        };
      });
  }, [selectedCustomer, journalEntries, customerAccountIdsSet]);

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        <h1 className="accounting-title">Sales Ledger Accounts</h1>
        <p className="accounting-subtitle">
          Review dynamic accounts receivable statements and transaction history.
        </p>

        <hr className="divider" />

        <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", marginTop: "1rem" }}>
          {/* Registry Sidebar */}
          <div style={{ flex: 1, minWidth: "0" }}>
            <h2 className="section-title">Receivables Registry</h2>
            {loading ? (
              <div style={{ padding: "1.5rem", textAlign: "center" }}>Loading ledger...</div>
            ) : (
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th style={{ textAlign: "right" }}>Balance</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const balance = customerBalances.get(c.id) ?? 0;
                    const isSelected = selectedCustomerId === c.id;
                    return (
                      <tr key={c.id} style={{ backgroundColor: isSelected ? "#e9ddc7" : "transparent" }}>
                        <td><strong>{c.name}</strong></td>
                        <td style={{ textAlign: "right", fontWeight: "bold", color: balance > 0 ? "#7a1f1f" : balance < 0 ? "#2e6f40" : "inherit" }}>
                          {balance === 0 ? "£0.00" : `£${Math.abs(balance).toFixed(2)} ${balance > 0 ? "DR" : "CR"}`}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button className="small-button" onClick={() => setSelectedCustomerId(isSelected ? null : c.id)}>
                            {isSelected ? "Dismiss" : "View"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Statement View Panel */}
          <div style={{ flex: 1.5, minWidth: "0" }}>
            {selectedCustomer ? (
              <>
                <h2 className="section-title">Statement: {selectedCustomer.name}</h2>
                <div style={{ maxHeight: "450px", overflowY: "auto", border: "1px solid #d2c4a8", borderRadius: "4px" }}>
                  <table className="ledger-table" style={{ margin: 0 }}>
                    <thead>
                      <tr style={{ position: "sticky", top: 0, zIndex: 10 }}>
                        <th>Date</th>
                        <th>Narrative</th>
                        <th>Ref</th>
                        <th style={{ textAlign: "right" }}>Debit</th>
                        <th style={{ textAlign: "right" }}>Credit</th>
                        <th style={{ textAlign: "right" }}>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustomerLines.map((l, idx) => (
                        <tr key={idx}>
                          <td>{l.date}</td>
                          <td>
                            {l.description}
                            {l.jobId && <div style={{ fontSize: "0.75rem" }}>🔧 Ticket #{l.jobId}</div>}
                          </td>
                          <td><code>{l.reference || "-"}</code></td>
                          <td style={{ textAlign: "right" }}>{l.debit ? `£${l.debit.toFixed(2)}` : ""}</td>
                          <td style={{ textAlign: "right" }}>{l.credit ? `£${l.credit.toFixed(2)}` : ""}</td>
                          <td style={{ textAlign: "right", fontWeight: "bold" }}>£{l.balance.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div style={{ border: "2px dashed #d2c4a8", padding: "3rem", textAlign: "center", borderRadius: "6px" }}>
                Select a customer to inspect history.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}