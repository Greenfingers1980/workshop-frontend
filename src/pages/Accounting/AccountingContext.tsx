import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

// ==========================================
// 1. DOMAIN TYPE DEFINITIONS
// ==========================================

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  accountId?: number;
}

export interface SalesInvoice {
  id: number;
  customerId: number;
  amount: number;
  status: string;
  date: string;
}

export interface SalesReceipt {
  id: number;
  customerId: number;
  invoiceId: number;
  amount: number;
  date: string;
  method: string;
  reference?: string;
}

export interface LedgerEntry {
  id: number;
  date: string;
  description: string;
  amount: number;
  accountCode: string;
  reconciled?: boolean;
  journalEntryId?: number;
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

export interface AuditChange {
  before: any;
  after: any;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  user: string;
  entity: string;
  description: string;
  changes: Record<string, AuditChange>;
}

export type AccountType = "Asset" | "Liability" | "Equity" | "Revenue" | "Income" | "Expense";

export interface Account {
  id: number;
  code: string;
  name: string;
  type: AccountType;
  isCustomer?: boolean;
  isSupplier?: boolean;
}

export interface Supplier {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  accountId?: number;
}

export interface InvoiceLine {
  accountId: number;
  department?: string;
  description: string;
  amount: number;
}

export interface PurchaseInvoice {
  id: number;
  supplierId: number;
  amount: number;
  status: "Draft" | "Unpaid" | "Paid";
  date: string;
  dueDate: string;
  invoiceNumber: string;
  reference?: string;
  description?: string;
  lines?: InvoiceLine[];
}

export interface SupplierPayment {
  id: number;
  supplierId: number;
  invoiceId: number;
  amount: number;
  date: string;
  method: string;
  reference?: string;
  bankAccountId?: number;
}

export type Department = string;

export interface JournalLine {
  id: number;
  accountId: number;
  accountCode: string;
  description: string;
  debit: number;
  credit: number;
  department?: Department;
  customerId?: number;
  supplierId?: number;
}

export interface JournalEntry {
  id: number;
  date: string;
  reference: string;
  description: string;
  lines: JournalLine[];
  customerId?: number;
}

// ==========================================
// 2. CONTEXT INTERFACE
// ==========================================

interface AccountingContextType {
  customers: Customer[];
  suppliers: Supplier[];
  salesInvoices: SalesInvoice[];
  purchaseInvoices: PurchaseInvoice[];
  supplierPayments: SupplierPayment[];
  salesReceipts: SalesReceipt[];
  ledger: LedgerEntry[];
  reconciliations: BankReconciliation[];
  auditLogs: AuditLog[];
  accounts: Account[];
  journalEntries: JournalEntry[];
  loading: boolean;
  addCustomer: (customer: Omit<Customer, "id">) => Promise<number>;
  addSupplier: (data: Omit<Supplier, "id">) => Promise<void>;
  addSalesReceipt: (data: Omit<SalesReceipt, "id">) => Promise<void>;
  addSupplierPayment: (data: Omit<SupplierPayment, "id">) => Promise<void>;
  addLedgerEntry: (data: Omit<LedgerEntry, "id">) => void;
  updateLedgerEntry: (id: number, patch: Partial<LedgerEntry>) => void;
  addReconciliation: (rec: BankReconciliation) => void;
  updateReconciliation: (id: number, patch: Partial<BankReconciliation>) => void;
  fetchAccountingData: () => Promise<void>;
  addAccount: (data: Omit<Account, "id">) => Promise<void>;
  addJournalEntry: (data: Omit<JournalEntry, "id">) => Promise<void>;
  addPurchaseInvoice: (data: Omit<PurchaseInvoice, "id">) => Promise<void>;
  addSalesInvoice: (data: Omit<SalesInvoice, "id">) => Promise<void>;
  closeYear: (year: number) => Promise<void>;
  openYear: (year: number) => Promise<void>;
  postJobToLedger: (jobId: number) => Promise<void>;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

// ==========================================
// 3. STATE PROVIDER
// ==========================================

export function AccountingProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([]);
  const [salesReceipts, setSalesReceipts] = useState<SalesReceipt[]>([]);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [reconciliations, setReconciliations] = useState<BankReconciliation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const saveToStorage = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  const loadDataFromStorage = async () => {
    const dataMap = {
      customers: setCustomers,
      suppliers: setSuppliers,
      salesInvoices: setSalesInvoices,
      purchaseInvoices: setPurchaseInvoices,
      salesReceipts: setSalesReceipts,
      supplierPayments: setSupplierPayments,
      ledger: setLedger,
      reconciliations: setReconciliations,
      auditLogs: setAuditLogs,
      journalEntries: setJournalEntries,
    };

    Object.entries(dataMap).forEach(([key, setter]) => {
      const raw = localStorage.getItem(key);
      if (raw) setter(JSON.parse(raw));
    });

    const rawAccounts = localStorage.getItem("accounts");
    if (rawAccounts) {
      setAccounts(JSON.parse(rawAccounts));
    } else {
      const defaultAccounts: Account[] = [
        { id: 1, code: "1200", name: "Bank Current Account", type: "Asset" },
        { id: 2, code: "1100", name: "Trade Debtors", type: "Asset", isCustomer: true },
        { id: 3, code: "2100", name: "Trade Creditors", type: "Liability", isSupplier: true },
        { id: 4, code: "3000", name: "Retained Earnings", type: "Equity" },
        { id: 5, code: "5000", name: "Workshop Materials", type: "Expense" },
        { id: 6, code: "4000", name: "Service Revenue", type: "Revenue" }
      ];
      setAccounts(defaultAccounts);
      saveToStorage("accounts", defaultAccounts);
    }
  };

  useEffect(() => { loadDataFromStorage().then(() => setLoading(false)); }, []);

  // API Methods
  const addAccount = async (data: Omit<Account, "id">) => {
    setAccounts(prev => { const next = [...prev, { id: Date.now(), ...data }]; saveToStorage("accounts", next); return next; });
  };
  const addJournalEntry = async (data: Omit<JournalEntry, "id">) => {
    setJournalEntries(prev => { const next = [...prev, { id: Date.now(), ...data }]; saveToStorage("journalEntries", next); return next; });
  };
  const addLedgerEntry = (data: Omit<LedgerEntry, "id">) => {
    setLedger(prev => { const next = [...prev, { id: Date.now(), ...data }]; saveToStorage("ledger", next); return next; });
  };
  const addSupplierPayment = async (data: Omit<SupplierPayment, "id">) => {
    setSupplierPayments(prev => { const next = [...prev, { id: Date.now(), ...data }]; saveToStorage("supplierPayments", next); return next; });
  };
  const addCustomer = async (customer: Omit<Customer, "id">): Promise<number> => {
    const newId = Date.now();
    setCustomers(prev => { const next = [...prev, { id: newId, ...customer }]; saveToStorage("customers", next); return next; });
    return newId;
  };
  const addSupplier = async (data: Omit<Supplier, "id">) => {
    setSuppliers(prev => { const next = [...prev, { id: Date.now(), ...data }]; saveToStorage("suppliers", next); return next; });
  };
  const addSalesReceipt = async (data: Omit<SalesReceipt, "id">) => {
    setSalesReceipts(prev => { const next = [...prev, { id: Date.now(), ...data }]; saveToStorage("salesReceipts", next); return next; });
  };
  const addPurchaseInvoice = async (data: Omit<PurchaseInvoice, "id">) => {
    setPurchaseInvoices(prev => { const next = [...prev, { id: Date.now(), ...data }]; saveToStorage("purchaseInvoices", next); return next; });
  };
  const addSalesInvoice = async (data: Omit<SalesInvoice, "id">) => {
    setSalesInvoices(prev => { const next = [...prev, { id: Date.now(), ...data }]; saveToStorage("salesInvoices", next); return next; });
  };
  const updateLedgerEntry = (id: number, patch: Partial<LedgerEntry>) => {
    setLedger(prev => { const next = prev.map(e => e.id === id ? { ...e, ...patch } : e); saveToStorage("ledger", next); return next; });
  };
  const addReconciliation = (rec: BankReconciliation) => {
    setReconciliations(prev => { const next = [...prev, rec]; saveToStorage("reconciliations", next); return next; });
  };
  const updateReconciliation = (id: number, patch: Partial<BankReconciliation>) => {
    setReconciliations(prev => { const next = prev.map(r => r.id === id ? { ...r, ...patch } : r); saveToStorage("reconciliations", next); return next; });
  };
  const closeYear = async (year: number) => { console.log("Year-end process for", year); };
  const openYear = async (year: number) => { console.log("Opening new fiscal year", year); };
  const postJobToLedger = async (jobId: number): Promise<void> => {
    console.log(`Posting job ${jobId} to ledger...`);
  };

  return (
    <AccountingContext.Provider value={{
      customers, suppliers, salesInvoices, purchaseInvoices, supplierPayments, 
      salesReceipts, ledger, reconciliations, auditLogs, accounts, journalEntries, 
      loading, addCustomer, addSupplier, addSalesReceipt, addSupplierPayment, 
      addLedgerEntry, updateLedgerEntry, addReconciliation, updateReconciliation, 
      fetchAccountingData: loadDataFromStorage, addAccount, addJournalEntry, 
      addPurchaseInvoice, addSalesInvoice, closeYear, openYear, postJobToLedger
    }}>
      {children}
    </AccountingContext.Provider>
  );
}

export function useAccounting() {
  const context = useContext(AccountingContext);
  if (!context) throw new Error("useAccounting must be used within AccountingProvider");
  return context;
}