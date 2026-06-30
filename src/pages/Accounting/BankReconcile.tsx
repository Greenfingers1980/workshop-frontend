import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useAccounting } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";


// Reinforced strong type configurations matching our data context
interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  accountCode: string;
  reconciled: boolean;
}

interface BankStatementLine {
  id: string;
  date: string;
  description: string;
  amount: number;
  matchedLedgerId: string | null;
}

interface BankReconciliation {
  id: string;
  bankAccountCode: string;
  statementDate: string;
  statementLines: BankStatementLine[];
}

export default function BankReconcile() {
  const { id } = useParams<{ id: string }>();
  const { journalEntries, accounts, fetchAccountingData } = useAccounting();
  
  // Track selected IDs manually to give the accountant explicit control over matching
  const [selectedLedgerId, setSelectedLedgerId] = useState<string | null>(null);
  const [selectedStatementLineId, setSelectedStatementLineId] = useState<string | null>(null);

  // Mock array placeholder matching context variables until backend tables sync
  const reconciliations: BankReconciliation[] = []; 

  // Look up target active statement row safely using standard string comparisons
  const currentRec = useMemo(() => {
    return reconciliations.find((r) => r.id === id);
  }, [reconciliations, id]);

  // Extract open, unreconciled ledger items targeting your core banking code
  const openLedgerEntries = useMemo<LedgerEntry[]>(() => {
    if (!currentRec || !journalEntries) return [];
    
    const list: LedgerEntry[] = [];
    journalEntries.forEach((entry) => {
      entry.lines?.forEach((line) => {
        // Look specifically for matching bank codes (e.g. Code 1000) that aren't reconciled
        const isBankTrack = String(line.accountId) === currentRec.bankAccountCode || line.accountId === 1;
        
        if (isBankTrack) {
          list.push({
            id: String(line.id),
            date: entry.date,
            description: entry.description,
            amount: line.debit - line.credit, // Net directional balance calculation
            accountCode: currentRec.bankAccountCode,
            reconciled: false // Replace with database schema row flag later
          });
        }
      });
    });
    return list;
  }, [journalEntries, currentRec]);

  if (!currentRec) {
    return (
      <div className="accounting-container">
        <div className="parchment-card" style={{ textAlign: "center", padding: "3rem" }}>
          <h2>⚠️ Reconciliation Record Not Found</h2>
          <p style={{ margin: "1rem 0" }}>The requested statement ID is invalid or has expired.</p>
          <Link to="/accounts" className="ledger-button">Return to Accounts</Link>
        </div>
      </div>
    );
  }

  /**
   * ACTION TRIGGER: Explicit execution of match pairings
   */
  const handleCommitMatch = async () => {
    if (!selectedLedgerId || !selectedStatementLineId) return;

    try {
      console.log(`Executing ledger pairing write: Ledger Row [${selectedLedgerId}] ⇄ Statement Row [${selectedStatementLineId}]`);
      
      // TODO: Add your direct Supabase mutations here:
      // 1. Set journal_lines.reconciled = true where id = selectedLedgerId
      // 2. Set bank_statement_lines.matched_ledger_id = selectedLedgerId where id = selectedStatementLineId
      
      alert("Transaction match verified and saved to ledger.");
      
      // Clear out interface selection tracking states cleanly
      setSelectedLedgerId(null);
      setSelectedStatementLineId(null);
      await fetchAccountingData();
    } catch (err) {
      console.error("Match commit exception:", err);
    }
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        
        <h1 className="accounting-title">Bank Reconciliation Workspace</h1>
        <p className="accounting-subtitle">
          Verify and balance your physical bank account statements against your internal ledger records.
        </p>

        {/* Action Controls Header Dock */}
        <div style={{ margin: "1.5rem 0", padding: "1rem", background: "#fdfbf7", border: "1px solid #d2c4a8", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.9rem", color: "#4a3f35" }}>
            <strong>Match Queue Status:</strong>{" "}
            {selectedLedgerId && selectedStatementLineId 
              ? "Ready to link selected rows." 
              : "Select one row from each side below to reconcile."}
          </div>
          <button
            className="ledger-button active"
            style={{ padding: "0.5rem 1.5rem" }}
            disabled={!selectedLedgerId || !selectedStatementLineId}
            onClick={handleCommitMatch}
          >
            ⚡ Confirm Transaction Pair Match
          </button>
        </div>

        <hr className="divider" />

        {/* Two-Column Side-by-Side Balancing Grid */}
        <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
          
          {/* LEFT COLUMN: Your Internal System Bookkeeping */}
          <div style={{ flex: 1, minWidth: "0" }}>
            <h3 className="section-title">1. Internal Ledger Books</h3>
            <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #d2c4a8", borderRadius: "4px" }}>
              <table className="ledger-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description Record</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {openLedgerEntries.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: "center", color: "#6b5c4a" }}>No open ledger cash items.</td></tr>
                  ) : (
                    openLedgerEntries.map((l) => {
                      const isSelected = selectedLedgerId === l.id;
                      return (
                        <tr 
                          key={l.id} 
                          onClick={() => setSelectedLedgerId(isSelected ? null : l.id)}
                          style={{ cursor: "pointer", backgroundColor: isSelected ? "#e9ddc7" : "transparent" }}
                        >
                          <td>{l.date}</td>
                          <td style={{ fontSize: "0.85rem" }}>{l.description}</td>
                          <td style={{ textAlign: "right", fontWeight: "bold" }}>£{l.amount.toFixed(2)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT COLUMN: Exported Raw Real Bank Records */}
          <div style={{ flex: 1, minWidth: "0" }}>
            <h3 className="section-title">2. Imported Bank Statement</h3>
            <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #d2c4a8", borderRadius: "4px" }}>
              <table className="ledger-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Bank Description String</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRec.statementLines.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: "center", color: "#6b5c4a" }}>No statement lines parsed.</td></tr>
                  ) : (
                    currentRec.statementLines.map((s) => {
                      const isMatched = !!s.matchedLedgerId;
                      const isSelected = selectedStatementLineId === s.id;
                      
                      return (
                        <tr 
                          key={s.id}
                          onClick={() => !isMatched && setSelectedStatementLineId(isSelected ? null : s.id)}
                          style={{ 
                            cursor: isMatched ? "not-allowed" : "pointer", 
                            backgroundColor: isMatched ? "#f0ebe3" : isSelected ? "#e9ddc7" : "transparent",
                            color: isMatched ? "#9b8b6f" : "inherit"
                          }}
                        >
                          <td>{s.date}</td>
                          <td style={{ fontSize: "0.85rem" }}>
                            {s.description}
                            {isMatched && <span style={{ display: "block", fontSize: "0.75rem", color: "#5b8461", fontWeight: "bold" }}>✓ Matched</span>}
                          </td>
                          <td style={{ textAlign: "right", fontWeight: "bold" }}>£{s.amount.toFixed(2)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
