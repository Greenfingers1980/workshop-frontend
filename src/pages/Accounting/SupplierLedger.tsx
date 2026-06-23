import { useMemo, useState } from "react";
import { useAccounting } from "./AccountingContext";
import type { JournalEntry, JournalLine } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";
import "./Accounting.css";

export default function SupplierLedger() {
  const { suppliers, accounts, journalEntries } = useAccounting();

  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(
    null
  );

  // -----------------------------
  // CALCULATE SUPPLIER BALANCES
  // -----------------------------
  const supplierBalances = useMemo(() => {
    const map = new Map<number, number>();

    for (const entry of journalEntries) {
      for (const line of entry.lines) {
        if (!line.supplierId) continue;

        const account = accounts.find(a => a.id === line.accountId);
        if (!account) continue;

        // Supplier accounts are normally CREDIT balances
        const prev = map.get(line.supplierId) ?? 0;
        map.set(line.supplierId, prev + (line.credit - line.debit));
      }
    }

    return map;
  }, [journalEntries, accounts]);

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  // -----------------------------
  // BUILD SUPPLIER ACCOUNT HISTORY
  // -----------------------------
  const selectedSupplierLines = useMemo(() => {
    if (!selectedSupplier) return [];

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
          .filter(l => l.supplierId === selectedSupplier.id)
          .map(l => ({
            entry,
            line: l
          }))
      )
      .sort((a, b) => a.entry.date.localeCompare(b.entry.date));

    for (const { entry, line } of allLines) {
      running += line.credit - line.debit;

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
  }, [selectedSupplier, journalEntries]);

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        <h1 className="accounting-title">Supplier Ledger</h1>
        <p className="accounting-subtitle">
          Supplier balances and detailed account history.
        </p>

        <hr className="divider" />

        {/* ---------------------- */}
        {/* SUPPLIER LIST */}
        {/* ---------------------- */}
        <h2 className="section-title">Suppliers</h2>

        <table className="ledger-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Balance</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={3}>No suppliers found.</td>
              </tr>
            )}

            {suppliers.map(s => {
              const balance = supplierBalances.get(s.id) ?? 0;

              return (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>
                    {balance === 0
                      ? "£0.00"
                      : `£${balance.toFixed(2)} ${balance > 0 ? "CR" : "DR"}`}
                  </td>
                  <td>
                    <button
                      className="small-button"
                      type="button"
                      onClick={() => setSelectedSupplierId(s.id)}
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
        {/* SUPPLIER ACCOUNT VIEW */}
        {/* ---------------------- */}
        {selectedSupplier && (
          <>
            <hr className="divider" />

            <h2 className="section-title">
              Account: {selectedSupplier.name}
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
                {selectedSupplierLines.length === 0 && (
                  <tr>
                    <td colSpan={6}>No transactions for this supplier.</td>
                  </tr>
                )}

                {selectedSupplierLines.map((l, idx) => (
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

