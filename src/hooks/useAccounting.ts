// src/hooks/useAccounting.ts
import { useState, useEffect } from "react";

export interface LedgerEntry {
  id: number;
  date: string;
  description: string;
  amount: number;
  accountCode: string; // e.g. "BANK"
  reconciled?: boolean;
}

export interface BankStatementLine {
  id: number;
  date: string;
  description: string;
  amount: number;
  matchedLedgerId?: number | null;
}

export interface BankReconciliation {
  id: number;
  bankAccountCode: string;
  statementDate: string;
  openingBalance: number;
  closingBalance: number;
  statementLines: BankStatementLine[];
}

export function useAccounting() {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [reconciliations, setReconciliations] = useState<BankReconciliation[]>([]);

  // -------------------------------------------------------
  // Load from localStorage on startup
  // -------------------------------------------------------
  useEffect(() => {
    const rawLedger = localStorage.getItem("ledger");
    const rawRecs = localStorage.getItem("reconciliations");

    if (rawLedger) {
      try {
        const parsed = JSON.parse(rawLedger);
        if (Array.isArray(parsed)) setLedger(parsed);
      } catch (err) {
        console.error("Failed to parse ledger:", err);
      }
    }

    if (rawRecs) {
      try {
        const parsed = JSON.parse(rawRecs);
        if (Array.isArray(parsed)) setReconciliations(parsed);
      } catch (err) {
        console.error("Failed to parse reconciliations:", err);
      }
    }
  }, []);

  // -------------------------------------------------------
  // Save helpers
  // -------------------------------------------------------
  const saveLedger = (next: LedgerEntry[]) => {
    setLedger(next);
    localStorage.setItem("ledger", JSON.stringify(next));
  };

  const saveReconciliations = (next: BankReconciliation[]) => {
    setReconciliations(next);
    localStorage.setItem("reconciliations", JSON.stringify(next));
  };

  // -------------------------------------------------------
  // Ledger operations
  // -------------------------------------------------------
  const addLedgerEntry = (entry: LedgerEntry) => {
    const next = [...ledger, entry];
    saveLedger(next);
  };

  const updateLedgerEntry = (id: number, patch: Partial<LedgerEntry>) => {
    const next = ledger.map((e) =>
      e.id === id ? { ...e, ...patch } : e
    );
    saveLedger(next);
  };

  // -------------------------------------------------------
  // Reconciliation operations
  // -------------------------------------------------------
  const addReconciliation = (rec: BankReconciliation) => {
    const next = [...reconciliations, rec];
    saveReconciliations(next);
  };

  const updateReconciliation = (id: number, patch: Partial<BankReconciliation>) => {
    const next = reconciliations.map((r) =>
      r.id === id ? { ...r, ...patch } : r
    );
    saveReconciliations(next);
  };

  return {
    ledger,
    reconciliations,
    addLedgerEntry,
    updateLedgerEntry,
    addReconciliation,
    updateReconciliation
  };
}
