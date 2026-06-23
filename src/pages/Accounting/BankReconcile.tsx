import React from "react";
import { useParams } from "react-router-dom";

import { useAccounting } from "../../hooks/useAccounting";
import type {
  LedgerEntry,
  BankReconciliation,
  BankStatementLine
} from "../../hooks/useAccounting";

const BankReconcile: React.FC = () => {
  const { id } = useParams();
  const {
    ledger,
    reconciliations,
    updateLedgerEntry,
    updateReconciliation
  } = useAccounting();

  // Find reconciliation by ID
  const rec: BankReconciliation | undefined = reconciliations.find(
    (r: BankReconciliation) => r.id === Number(id)
  );

  if (!rec) {
    return <p>Reconciliation not found</p>;
  }

  // Ledger entries for this bank account that are not yet reconciled
  const ledgerEntries: LedgerEntry[] = ledger.filter(
    (l: LedgerEntry) =>
      l.accountCode === rec.bankAccountCode && !l.reconciled
  );

  // Match a ledger entry to a statement line
  const match = (ledgerId: number, statementId: number) => {
    // Mark ledger entry as reconciled
    updateLedgerEntry(ledgerId, { reconciled: true });

    // Update statement lines
    const updatedLines: BankStatementLine[] = rec.statementLines.map(
      (s: BankStatementLine) =>
        s.id === statementId ? { ...s, matchedLedgerId: ledgerId } : s
    );

    updateReconciliation(rec.id, { statementLines: updatedLines });
  };

  return (
    <div style={{ display: "flex", gap: 20, padding: 20 }}>
      {/* Ledger side */}
      <div style={{ flex: 1 }}>
        <h3>Ledger Entries</h3>
        <ul>
          {ledgerEntries.map((l: LedgerEntry) => (
            <li key={l.id}>
              {l.date} — {l.description} — £{l.amount}
            </li>
          ))}
        </ul>
      </div>

      {/* Statement side */}
      <div style={{ flex: 1 }}>
        <h3>Statement Lines</h3>
        <ul>
          {rec.statementLines.map((s: BankStatementLine) => (
            <li key={s.id}>
              {s.date} — {s.description} — £{s.amount}{" "}
              {!s.matchedLedgerId && (
                <button
                  onClick={() => {
                    const matchEntry = ledgerEntries.find(
                      (l: LedgerEntry) => l.amount === s.amount
                    );
                    if (matchEntry) {
                      match(matchEntry.id, s.id);
                    }
                  }}
                >
                  Match
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BankReconcile;
