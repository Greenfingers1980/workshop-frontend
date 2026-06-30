import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAccounting } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";


interface SupplierLine {
  date: string;
  description: string;
  reference?: string;
  debit: number;
  credit: number;
  balance: number;
  purchaseInvoiceId?: number;
}

export default function SupplierLedger() {
  const navigate = useNavigate();
  const { suppliers, accounts, journalEntries, loading } = useAccounting();
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);

  // 1. High Performance: Isolate supplier control account IDs to avoid nested .find() scans
  const supplierAccountIdsSet = useMemo(() => {
    return new Set<number>(accounts.filter((a) => a.isSupplier || a.code === "2000").map((a) => a.id));
  }, [accounts]);

  // 2. Linear Runtime Aggregator Map tracking dynamic trade payables (Creditors)
  const supplierBalances = useMemo(() => {
    const map = new Map<number, number>();
    if (!journalEntries) return map;

    journalEntries.forEach((entry) => {
      entry.lines?.forEach((line) => {
        if (!line.supplierId) return;

        // O(1) instant memory lookup
        const isSupplierControlAccount = supplierAccountIdsSet.has(line.accountId);
        if (!isSupplierControlAccount) return;

        const currentBalance = map.get(line.supplierId) ?? 0;
        // Liability balances naturally rise with Credits and fall with Debits
        map.set(line.supplierId, currentBalance + line.credit - line.debit);
      });
    });

    return map;
  }, [journalEntries, supplierAccountIdsSet]);

  const selectedSupplier = useMemo(() => {
    if (!selectedSupplierId) return null;
    return suppliers.find((s) => s.id === selectedSupplierId) || null;
  }, [suppliers, selectedSupplierId]);

  // 3. Chronological Pipeline mapping running balances per ledger row
  const selectedSupplierLines = useMemo<SupplierLine[]>(() => {
    if (!selectedSupplier || !journalEntries) return [];

    const linesArchive: SupplierLine[] = [];
    let cumulativeRunningBalance = 0;

    const targetedHistory = journalEntries
      .flatMap((entry) => {
        const matches = entry.lines?.filter((l) => l.supplierId === selectedSupplier.id && supplierAccountIdsSet.has(l.accountId)) || [];
        return matches.map((line) => ({ entry, line }));
      })
      .sort((a, b) => a.entry.date.localeCompare(b.entry.date));

    targetedHistory.forEach(({ entry, line }) => {
      cumulativeRunningBalance += line.credit - line.debit;

      linesArchive.push({
        date: entry.date,
        description: entry.description,
        reference: entry.reference,
        debit: line.debit,
        credit: line.credit,
        balance: cumulativeRunningBalance,
        purchaseInvoiceId: (line as any).purchaseInvoiceId
      });
    });

    return linesArchive;
  }, [selectedSupplier, journalEntries, supplierAccountIdsSet]);

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        <h1 className="accounting-title">Supplier Ledger Accounts</h1>
        <p className="accounting-subtitle">
          Review dynamic accounts payable statuses, trade creditor statements, and historical parts invoice settlements.
        </p>

        <hr className="divider" />

        {/* --- DUAL PANEL DASHBOARD VIEW --- */}
        <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", marginTop: "1rem" }}>
          
          {/* LEFT COLUMN: PAYABLES REGISTRY */}
          <div style={{ flex: 1, minWidth: "0" }}>
            <h2 className="section-title">Trade Creditors Registry</h2>
            {loading ? (
              <div style={{ padding: "1.5rem", textAlign: "center", color: "#6b5c4a" }}>Querying backend ledgers...</div>
            ) : (
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Supplier Entity</th>
                    <th style={{ textAlign: "right" }}>Net Payables Balance</th>
                    <th style={{ width: "10%" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.length === 0 ? (
                    <tr><td colSpan={3} style={{ color: "#6b5c4a", fontStyle: "italic" }}>No suppliers found.</td></tr>
                  ) : (
                    suppliers.map((s) => {
                      const outstandingDebt = supplierBalances.get(s.id) ?? 0;
                      const isSelectedTarget = selectedSupplierId === s.id;

                      return (
                        <tr key={s.id} style={{ backgroundColor: isSelectedTarget ? "#e9ddc7" : "transparent" }}>
                          <td><strong>{s.name}</strong></td>
                          <td style={{ textAlign: "right", fontWeight: "bold", color: outstandingDebt > 0 ? "#7a1f1f" : outstandingDebt < 0 ? "#2e6f40" : "inherit" }}>
                            {outstandingDebt === 0 ? "£0.00" : `£${Math.abs(outstandingDebt).toFixed(2)} ${outstandingDebt > 0 ? "CR" : "DR"}`}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              className={`small-button ${isSelectedTarget ? "active" : ""}`}
                              type="button"
                              onClick={() => setSelectedSupplierId(isSelectedTarget ? null : s.id)}
                            >
                              {isSelectedTarget ? "Dismiss" : "👁️ Statement"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* RIGHT COLUMN: SUBLEDGER CHRONOLOGICAL TRANSACTIONS STATEMENT */}
          <div style={{ flex: 1.5, minWidth: "0" }}>
            {selectedSupplier ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <h2 className="section-title" style={{ margin: 0 }}>Statement: {selectedSupplier.name}</h2>
                  
                  {/* WORKFLOW SHORTCUT ACCELERATOR LINK */}
                  <button 
                    className="small-button active"
                    onClick={() => navigate(`/supplier-payments?supplierId=${selectedSupplier.id}`)}
                  >
                    💳 Record Payment Outflow
                  </button>
                </div>

                <div style={{ maxHeight: "450px", overflowY: "auto", border: "1px solid #d2c4a8", borderRadius: "4px" }}>
                  <table className="ledger-table" style={{ margin: 0 }}>
                    <thead>
                      <tr style={{ position: "sticky", top: 0, zIndex: 10 }}>
                        <th>Date</th>
                        <th>Transaction Narrative</th>
                        <th>Ref</th>
                        <th style={{ textAlign: "right" }}>Debit (-)</th>
                        <th style={{ textAlign: "right" }}>Credit (+)</th>
                        <th style={{ textAlign: "right" }}>Balance Owed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSupplierLines.length === 0 ? (
                        <tr><td colSpan={6} style={{ color: "#6b5c4a", fontStyle: "italic", textAlign: "center", padding: "1.5rem" }}>No matching transaction history logged.</td></tr>
                      ) : (
                        selectedSupplierLines.map((l, idx) => (
                          <tr key={idx}>
                            <td style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>{l.date}</td>
                            <td style={{ fontSize: "0.85rem" }}>
                              <div>{l.description}</div>
                              {l.purchaseInvoiceId && (
                                <Link to={`/purchases/view/${l.purchaseInvoiceId}`} style={{ display: "inline-block", fontSize: "0.75rem", color: "#4a3f35", textDecoration: "underline", marginTop: "0.15rem" }}>
                                  📄 Open Original Bill Voucher #{l.purchaseInvoiceId}
                                </Link>
                              )}
                            </td>
                            <td><code style={{ fontSize: "0.8rem" }}>{l.reference || "—"}</code></td>
                            <td style={{ textAlign: "right", color: "#2e6f40" }}>{l.debit ? `£${l.debit.toFixed(2)}` : ""}</td>
                            <td style={{ textAlign: "right", color: "#7a1f1f" }}>{l.credit ? `£${l.credit.toFixed(2)}` : ""}</td>
                            <td style={{ textAlign: "right", fontWeight: "bold" }}>£{l.balance.toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div style={{ border: "2px dashed #d2c4a8", padding: "3rem", textAlign: "center", borderRadius: "6px", color: "#6b5c4a", background: "#fdfbf7" }}>
                👈 Select a parts vendor or supplier from the registry sidebar to inspect active accounts statement lines.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
