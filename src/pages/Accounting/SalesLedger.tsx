import { useMemo, useState } from "react";
import { useAccounting } from "./AccountingContext";
import type { JournalEntry, JournalLine } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";
import "./Accounting.css";

export default function SalesLedger() {
  const { accounts, customers, journalEntries } = useAccounting();

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );

  // -----------------------------
  // CALCULATE CUSTOMER BALANCES
  // -----------------------------
  const customerBalances = useMemo(() => {
    const map = new Map<number, number>();

    for (const entry of journalEntries) {
      for (const line of entry.lines) {
        if (!line.customerId) continue;

        const account = accounts.find(a => a.id === line.accountId);
        if (!account) continue;

        // We assume customer accounts are Assets (Debtors)
        const prev = map.get(line.customerId) ?? 0;
        map.set(line.customerId, prev + line.debit - line.credit);
      }
    }

    return map;
  }, [journalEntries, accounts]);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // -----------------------------
  // BUILD CUSTOMER ACCOUNT HISTORY
  // -----------------------------
  const selectedCustomerLines = useMemo(() => {
    if (!selectedCustomer) return [];

    const lines: {
      date: string;
      description: string;
      reference?: string;
      debit: number;
      credit: number;
      balance: number;
    }[] = [];

    let running = 0;

    const allLines = journalEntries
      .flatMap(entry =>
        entry.lines
          .filter(l => l.customerId === selectedCustomer.id)
          .map(l => ({
            entry,
            line: l
          }))
      )
      .sort((a, b) => a.entry.date.localeCompare(b.entry.date));

    for (const { entry, line } of allLines) {
      running += line.debit - line.credit;

      lines.push({
        date: entry.date,
        description: entry.description,
        reference: entry.reference,
        debit: line.debit,
        credit: line.credit,
        balance: running
      });
    }

    return lines;
  }, [selectedCustomer, journalEntries]);

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        <h1 className="accounting-title">Sales Ledger</h1>
        <p className="accounting-subtitle">
          Customer balances and detailed account history.
        </p>

        <hr className="divider" />

        {/* ---------------------- */}
        {/* CUSTOMER LIST */}
        {/* ---------------------- */}
        <h2 className="section-title">Customers</h2>

        <table className="ledger-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Balance</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan={3}>No customers found.</td>
              </tr>
            )}

            {customers.map(c => {
              const balance = customerBalances.get(c.id) ?? 0;

              return (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>
                    {balance === 0
                      ? "£0.00"
                      : `£${balance.toFixed(2)} ${balance > 0 ? "DR" : "CR"}`}
                  </td>
                  <td>
                    <button
                      className="small-button"
                      type="button"
                      onClick={() => setSelectedCustomerId(c.id)}
                    >
                      View Account
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ---------------------- */}
        {/* CUSTOMER ACCOUNT VIEW */}
        {/* ---------------------- */}
        {selectedCustomer && (
          <>
            <hr className="divider" />

            <h2 className="section-title">
              Account: {selectedCustomer.name}
            </h2>

            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Ref</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Balance</th>
                </tr>
              </thead>

              <tbody>
                {selectedCustomerLines.length === 0 && (
                  <tr>
                    <td colSpan={6}>No transactions for this customer.</td>
                  </tr>
                )}

                {selectedCustomerLines.map((l, idx) => (
                  <tr key={idx}>
                    <td>{l.date}</td>
                    <td>{l.description}</td>
                    <td>{l.reference || "—"}</td>
                    <td>{l.debit ? `£${l.debit.toFixed(2)}` : ""}</td>
                    <td>{l.credit ? `£${l.credit.toFixed(2)}` : ""}</td>
                    <td>{`£${l.balance.toFixed(2)}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
