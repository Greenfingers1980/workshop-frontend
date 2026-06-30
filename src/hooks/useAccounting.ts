// src/hooks/useAccounting.ts
import { useAccounting as useGlobalAccounting } from "../pages/Accounting/AccountingContext";

// Re-export the core data types so your pages can still import them from this file
export type { LedgerEntry, BankStatementLine, BankReconciliation } from "../pages/Accounting/AccountingContext";

/**
 * Hook bridge to access the global accounting ledger state.
 * Channelling this through the root provider ensures that data updates 
 * are instantly reactive across all screens on your dashboard.
 */
export function useAccounting() {
  return useGlobalAccounting();
}