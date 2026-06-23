import React, { createContext, useContext, useEffect, useState } from "react";
import { addAudit, getAuditTrail } from "../../lib/audit";

// -----------------------------
// TYPES
// -----------------------------

export type Department = "Watch Studio" | "Clock Workshop" | "Admin";

export type AccountType =
  | "Asset"
  | "Liability"
  | "Equity"
  | "Income"
  | "Expense";

export interface Account {
  id: number;
  code: string;
  name: string;
  type: AccountType;
  isCustomer: boolean;
  isSupplier: boolean;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  accountId: number;
  address?: string;
}

export interface Supplier {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  accountId: number;
}

export interface JournalLine {
  id: number;
  accountId: number;
  debit: number;
  credit: number;
  department: Department;
  customerId?: number;
  supplierId?: number;
  jobId?: number;
}

export interface JournalEntry {
  id: number;
  date: string;
  description: string;
  reference?: string;
  lines: JournalLine[];
}

export interface PurchaseInvoiceLine {
  accountId: number;
  amount: number;
  department: Department;
}

export interface PurchaseInvoice {
  id: number;
  supplierId: number;
  date: string;
  reference: string;
  description: string;
  lines: PurchaseInvoiceLine[];
  total: number;
}

export interface SupplierPayment {
  id: number;
  supplierId: number;
  date: string;
  amount: number;
  bankAccountId: number;
}

export interface SalesInvoice {
  id: number;
  customerId: number;
  jobId: number | null;
  amount: number;
  date: string;
  status: "Unpaid" | "Paid" | "Part Paid";
}

export interface SalesReceipt {
  id: number;
  customerId: number;
  invoiceId: number;
  date: string;
  amount: number;
  method: string;
  reference?: string;
}

interface YearLock {
  year: number;
  locked: boolean;
}

// -----------------------------
// CONTEXT SHAPE
// -----------------------------

interface AccountingContextValue {
  accounts: Account[];
  customers: Customer[];
  suppliers: Supplier[];
  journalEntries: JournalEntry[];
  purchaseInvoices: PurchaseInvoice[];
  supplierPayments: SupplierPayment[];
  salesReceipts: SalesReceipt[];
  salesInvoices: SalesInvoice[];
  auditLogs: any[];

  postJobToLedger: (jobId: number) => void;

  addSalesInvoice: (customerId: number, jobId: number | null, amount: number) => void;
  addSalesReceipt: (receipt: Omit<SalesReceipt, "id">) => void;

  addAccount: (account: Omit<Account, "id">) => void;
  updateAccount: (account: Account) => void;

  addCustomer: (customer: Omit<Customer, "id">) => number;
  updateCustomer: (customer: Customer) => void;

  addSupplier: (supplier: Omit<Supplier, "id">) => void;
  updateSupplier: (supplier: Supplier) => void;

  addJournalEntry: (entry: Omit<JournalEntry, "id">) => void;

  addPurchaseInvoice: (invoice: Omit<PurchaseInvoice, "id">) => void;
  addSupplierPayment: (payment: Omit<SupplierPayment, "id">) => void;

  addAuditLog: typeof addAudit;

  closeYear: (year: number) => void;
  openYear: (year: number) => void;
}

// -----------------------------
// LOCAL STORAGE KEYS
// -----------------------------

const STORAGE_ACCOUNTS = "acc-accounts";
const STORAGE_CUSTOMERS = "acc-customers";
const STORAGE_SUPPLIERS = "acc-suppliers";
const STORAGE_JOURNAL = "acc-journal";
const STORAGE_PURCHASES = "acc-purchases";
const STORAGE_PAYMENTS = "acc-payments";
const STORAGE_SALES_RECEIPTS = "acc-sales-receipts";
const STORAGE_SALES_INVOICES = "acc-sales-invoices";
const STORAGE_YEAR_LOCK = "acc-year-lock";

// -----------------------------
// CONTEXT
// -----------------------------

export const AccountingContext = createContext<AccountingContextValue | undefined>(undefined);

// -----------------------------
// PROVIDER
// -----------------------------

export function AccountingProvider({ children }: { children: React.ReactNode }) {

  // ACCOUNTS
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(STORAGE_ACCOUNTS);
    return saved ? JSON.parse(saved) : [
      { id: 1, code: "1000", name: "Bank", type: "Asset", isCustomer: false, isSupplier: false },
      { id: 2, code: "1100", name: "Trade Debtors", type: "Asset", isCustomer: false, isSupplier: false },
      { id: 3, code: "2000", name: "Trade Creditors", type: "Liability", isCustomer: false, isSupplier: false },
      { id: 4, code: "4000", name: "Sales", type: "Income", isCustomer: false, isSupplier: false },
      { id: 5, code: "5000", name: "Workshop Expenses", type: "Expense", isCustomer: false, isSupplier: false }
    ];
  });

  // CUSTOMERS
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_CUSTOMERS);
    return saved ? JSON.parse(saved) : [];
  });

  // SUPPLIERS
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_SUPPLIERS);
    return saved ? JSON.parse(saved) : [];
  });

  // JOURNAL
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_JOURNAL);
    return saved ? JSON.parse(saved) : [];
  });

  // PURCHASE INVOICES
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_PURCHASES);
    return saved ? JSON.parse(saved) : [];
  });

  // SUPPLIER PAYMENTS
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(() => {
    const saved = localStorage.getItem(STORAGE_PAYMENTS);
    return saved ? JSON.parse(saved) : [];
  });

  // SALES RECEIPTS
  const [salesReceipts, setSalesReceipts] = useState<SalesReceipt[]>(() => {
    const saved = localStorage.getItem(STORAGE_SALES_RECEIPTS);
    return saved ? JSON.parse(saved) : [];
  });

  // SALES INVOICES
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_SALES_INVOICES);
    return saved ? JSON.parse(saved) : [];
  });

  // -----------------------------
  // PERSISTENCE
  // -----------------------------

  useEffect(() => localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(accounts)), [accounts]);
  useEffect(() => localStorage.setItem(STORAGE_CUSTOMERS, JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem(STORAGE_SUPPLIERS, JSON.stringify(suppliers)), [suppliers]);
  useEffect(() => localStorage.setItem(STORAGE_JOURNAL, JSON.stringify(journalEntries)), [journalEntries]);
  useEffect(() => localStorage.setItem(STORAGE_PURCHASES, JSON.stringify(purchaseInvoices)), [purchaseInvoices]);
  useEffect(() => localStorage.setItem(STORAGE_PAYMENTS, JSON.stringify(supplierPayments)), [supplierPayments]);
  useEffect(() => localStorage.setItem(STORAGE_SALES_RECEIPTS, JSON.stringify(salesReceipts)), [salesReceipts]);
  useEffect(() => localStorage.setItem(STORAGE_SALES_INVOICES, JSON.stringify(salesInvoices)), [salesInvoices]);

  // -----------------------------
  // HELPERS
  // -----------------------------

  const getYearLock = (): YearLock | null => {
    const raw = localStorage.getItem(STORAGE_YEAR_LOCK);
    return raw ? JSON.parse(raw) : null;
  };

  const setYearLock = (lock: YearLock) => {
    localStorage.setItem(STORAGE_YEAR_LOCK, JSON.stringify(lock));
  };

  const calculateAccountBalance = (accountId: number): number => {
    return journalEntries.reduce((sum, entry) => {
      const linesForAccount = entry.lines.filter(l => l.accountId === accountId);
      const delta = linesForAccount.reduce(
        (acc, l) => acc + l.debit - l.credit,
        0
      );
      return sum + delta;
    }, 0);
  };

  const ensureYearNotLocked = (date: string) => {
    const lock = getYearLock();
    if (!lock) return;
    const year = Number(date.slice(0, 4));
    if (lock.locked && year === lock.year) {
      throw new Error(`Financial year ${lock.year} is locked.`);
    }
  };

  // -----------------------------
  // ACCOUNT FUNCTIONS
  // -----------------------------

  const addAccount = (account: Omit<Account, "id">) => {
    const newAccount = { ...account, id: Date.now() };
    setAccounts(prev => [...prev, newAccount]);
  };

  const updateAccount = (account: Account) => {
    setAccounts(prev => prev.map(a => (a.id === account.id ? account : a)));
  };

  // -----------------------------
  // CUSTOMER FUNCTIONS
  // -----------------------------

  const addCustomer = (customer: Omit<Customer, "id">) => {
    const newCustomer = { ...customer, id: Date.now() };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer.id;
  };

  const updateCustomer = (customer: Customer) => {
    setCustomers(prev => prev.map(c => (c.id === customer.id ? customer : c)));
  };

  // -----------------------------
  // SUPPLIER FUNCTIONS
  // -----------------------------

  const addSupplier = (supplier: Omit<Supplier, "id">) => {
    const newSupplier = { ...supplier, id: Date.now() };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const updateSupplier = (supplier: Supplier) => {
    setSuppliers(prev => prev.map(s => (s.id === supplier.id ? supplier : s)));
  };

  // -----------------------------
  // PURCHASE INVOICE FUNCTIONS
  // -----------------------------

  const addPurchaseInvoice = (invoice: Omit<PurchaseInvoice, "id">) => {
    ensureYearNotLocked(invoice.date);

    const newInvoice = { ...invoice, id: Date.now() };
    setPurchaseInvoices(prev => [...prev, newInvoice]);

    addAudit({
      action: "NEW_PURCHASE_INVOICE",
      description: `Purchase invoice £${newInvoice.total} for supplier ${newInvoice.supplierId}`,
      supplierId: newInvoice.supplierId,
      debit: newInvoice.total,
      credit: 0,
      before: null,
      after: newInvoice
    });
  };

  // -----------------------------
  // SUPPLIER PAYMENT FUNCTIONS
  // -----------------------------

  const addSupplierPayment = (payment: Omit<SupplierPayment, "id">) => {
    ensureYearNotLocked(payment.date);

    const newPayment = { ...payment, id: Date.now() };
    setSupplierPayments(prev => [...prev, newPayment]);

    addAudit({
      action: "SUPPLIER_PAYMENT",
      description: `Payment £${newPayment.amount} to supplier ${newPayment.supplierId}`,
      supplierId: newPayment.supplierId,
      debit: 0,
      credit: newPayment.amount,
      before: null,
      after: newPayment
    });
  };

  // -----------------------------
  // JOURNAL ENTRY
  // -----------------------------

  const addJournalEntry = (entry: Omit<JournalEntry, "id">) => {
    ensureYearNotLocked(entry.date);

    const newEntry = { ...entry, id: Date.now() };
    setJournalEntries(prev => [...prev, newEntry]);

    addAudit({
      action: "POST_JOURNAL",
      description: entry.description,
      before: null,
      after: newEntry
    });
  };

  // -----------------------------
  // SALES INVOICE POSTING
  // -----------------------------

  const addSalesInvoice = (customerId: number, jobId: number | null, amount: number) => {
    const date = new Date().toISOString().slice(0, 10);
    ensureYearNotLocked(date);

    const id = Date.now();

    const newInvoice: SalesInvoice = {
      id,
      customerId,
      jobId,
      amount,
      date,
      status: "Unpaid"
    };

    setSalesInvoices(prev => [...prev, newInvoice]);

    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const debtorsAccount = accounts.find(a => a.code === "1100");
    const salesAccount = accounts.find(a => a.code === "4000");

    if (!debtorsAccount || !salesAccount) return;

    const lines: JournalLine[] = [
      {
        id: Date.now() + Math.random(),
        accountId: debtorsAccount.id,
        debit: amount,
        credit: 0,
        department: "Admin",
        customerId
      },
      {
        id: Date.now() + Math.random(),
        accountId: salesAccount.id,
        debit: 0,
        credit: amount,
        department: "Admin",
        customerId,
        jobId: jobId ?? undefined
      }
    ];

    addJournalEntry({
      date: newInvoice.date,
      description: jobId ? `Sales Invoice for Job #${jobId}` : `Sales Invoice`,
      reference: jobId ? `INV-${jobId}` : `INV-${id}`,
      lines
    });

    addAudit({
      action: "NEW_SALES_INVOICE",
      description: `Posted sales invoice £${amount} to ${customer.name}`,
      customerId,
      debit: amount,
      credit: 0,
      before: null,
      after: newInvoice
    });
  };

  // -----------------------------
  // SALES RECEIPT POSTING
  // -----------------------------

  const addSalesReceipt = (receiptInput: Omit<SalesReceipt, "id">) => {
    ensureYearNotLocked(receiptInput.date);

    const id = Date.now();

    const receipt: SalesReceipt = { id, ...receiptInput };
    setSalesReceipts(prev => [...prev, receipt]);

    // Update invoice status
    setSalesInvoices(prev =>
      prev.map(inv => {
        if (inv.id !== receipt.invoiceId) return inv;

        const paymentsForInvoice = [...salesReceipts, receipt]
          .filter(p => p.invoiceId === inv.id)
          .reduce((sum, p) => sum + p.amount, 0);

        if (paymentsForInvoice >= inv.amount) {
          return { ...inv, status: "Paid" };
        } else if (paymentsForInvoice > 0) {
          return { ...inv, status: "Part Paid" };
        } else {
          return { ...inv, status: "Unpaid" };
        }
      })
    );

    const customer = customers.find(c => c.id === receipt.customerId);
    if (!customer) return;

    const debtorsAccount = accounts.find(a => a.code === "1100");
    const bankAccount = accounts.find(a => a.code === "1000");

    if (!debtorsAccount || !bankAccount) return;

    const lines: JournalLine[] = [
      {
        id: Date.now() + Math.random(),
        accountId: bankAccount.id,
        debit: receipt.amount,
        credit: 0,
        department: "Admin",
        customerId: receipt.customerId
      },
      {
        id: Date.now() + Math.random(),
        accountId: debtorsAccount.id,
        debit: 0,
        credit: receipt.amount,
        department: "Admin",
        customerId: receipt.customerId
      }
    ];

    addJournalEntry({
      date: receipt.date,
      description: `Receipt for Invoice #${receipt.invoiceId}`,
      reference: `RCPT-${receipt.id}`,
      lines
    });

    addAudit({
      action: "SALES_RECEIPT",
      description: `Received £${receipt.amount} from ${customer.name}`,
      customerId: receipt.customerId,
      debit: receipt.amount,
      credit: 0,
      before: null,
      after: receipt
    });
  };

  // -----------------------------
  // YEAR-END CLOSE & NEW YEAR OPEN
  // -----------------------------

  const closeYear = (year: number) => {
    const retained = accounts.find(a => a.code === "3200");
    if (!retained) {
      throw new Error("Retained Earnings account (code 3200) is missing.");
    }

    const closingLines: JournalLine[] = [];

    accounts.forEach(acc => {
      if (acc.type === "Income" || acc.type === "Expense") {
        const balance = calculateAccountBalance(acc.id);
        if (balance === 0) return;

        if (acc.type === "Income") {
          // Income normally credit; to close, debit income, credit retained
          closingLines.push({
            id: Date.now() + Math.random(),
            accountId: acc.id,
            debit: balance,
            credit: 0,
            department: "Admin"
          });
          closingLines.push({
            id: Date.now() + Math.random(),
            accountId: retained.id,
            debit: 0,
            credit: balance,
            department: "Admin"
          });
        }

        if (acc.type === "Expense") {
          // Expense normally debit; to close, credit expense, debit retained
          closingLines.push({
            id: Date.now() + Math.random(),
            accountId: acc.id,
            debit: 0,
            credit: balance,
            department: "Admin"
          });
          closingLines.push({
            id: Date.now() + Math.random(),
            accountId: retained.id,
            debit: balance,
            credit: 0,
            department: "Admin"
          });
        }
      }
    });

    if (closingLines.length > 0) {
      addJournalEntry({
        date: `${year}-12-31`,
        description: `Year End Closing Entries`,
        reference: `YE-${year}`,
        lines: closingLines
      });
    }

    setYearLock({ year, locked: true });

    addAudit({
      action: "YEAR_END_CLOSE",
      description: `Closed financial year ${year}`,
      before: null,
      after: { year }
    });
  };

  const openYear = (year: number) => {
    setYearLock({ year, locked: false });

    addAudit({
      action: "NEW_YEAR_OPEN",
      description: `Opened financial year ${year}`,
      before: null,
      after: { year }
    });
  };

  // -----------------------------
  // JOB POSTING (STUB)
  // -----------------------------

  const postJobToLedger = (jobId: number) => {
    console.warn("postJobToLedger is not implemented yet");
  };

  // -----------------------------
  // CONTEXT VALUE
  // -----------------------------

  const value: AccountingContextValue = {
    accounts,
    customers,
    suppliers,
    journalEntries,
    purchaseInvoices,
    supplierPayments,
    salesReceipts,
    salesInvoices,

    auditLogs: getAuditTrail(),

    postJobToLedger,
    addSalesInvoice,
    addSalesReceipt,

    addAccount,
    updateAccount,
    addCustomer,
    updateCustomer,
    addSupplier,
    updateSupplier,
    addJournalEntry,
    addPurchaseInvoice,
    addSupplierPayment,

    addAuditLog: addAudit,

    closeYear,
    openYear
  };

  return (
    <AccountingContext.Provider value={value}>
      {children}
    </AccountingContext.Provider>
  );
}

// -----------------------------
// HOOK
// -----------------------------

export function useAccounting() {
  const ctx = useContext(AccountingContext);
  if (!ctx) throw new Error("useAccounting must be used inside <AccountingProvider>");
  return ctx;
}
