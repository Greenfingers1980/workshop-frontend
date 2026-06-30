import React, { useState, useMemo } from "react";
import { useAccounting } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";


interface YearLockState {
  year: number;
  locked: boolean;
}

export default function YearEnd() {
  const { journalEntries, closeYear, openYear, loading } = useAccounting();
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Mock array track placeholder mirroring backend system parameters until live schemas sync
  // In your final setup, this array list should be populated via your global state provider
  const historicalYearLocks: YearLockState[] = [
    { year: 2024, locked: true },
    { year: 2025, locked: true },
    { year: 2026, locked: false }
  ];

  // 1. High Performance: Isolate a unique drop-down menu array of all years containing transaction records
  const availableLedgerYears = useMemo(() => {
    const yearSet = new Set<number>([new Date().getFullYear()]);
    if (journalEntries) {
      journalEntries.forEach(entry => {
        const entryYear = new Date(entry.date).getFullYear();
        if (!isNaN(entryYear)) yearSet.add(entryYear);
      });
    }
    return Array.from(yearSet).sort((a, b) => b - a); // Order chronological descending
  }, [journalEntries]);

  // Determine lock metrics for the selected dropdown choice
  const activeYearStatus = useMemo(() => {
    const matchedYear = historicalYearLocks.find(y => y.year === selectedYear);
    return matchedYear ? matchedYear.locked : false;
  }, [historicalYearLocks, selectedYear]);

  /**
   * SAFETY ROUTINE: Locking down historical account rows
   */
  const handleLockdownRoutine = async () => {
    const verifyMemo = window.prompt(
      `⚠️ WARNING: You are initiating a strict audit lock for the financial year ${selectedYear}.\n\nThis will freeze all debit/credit rows and roll profits into your Retained Earnings equity lines.\n\nType the year "${selectedYear}" to confirm:`
    );

    if (verifyMemo !== String(selectedYear)) {
      alert("Lockdown aborted. Confirmation sequence mismatch.");
      return;
    }

    setIsProcessing(true);
    try {
      // Execute global context database mutations 
      await closeYear(selectedYear);
      alert(`🎉 Financial year ${selectedYear} has been safely reconciled and closed to further changes.`);
    } catch (err) {
      console.error("Year end isolation failure:", err);
      alert("Database error: Could not complete close routines.");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * ROLLBACK ROUTINE: Unlocking a closed period
   */
  const handleRollbackRoutine = async () => {
    const confirmation = window.confirm(
      `Administrative Notice: Are you certain you want to unlock the financial year ${selectedYear}?\n\nThis allows back-dated modifications into a locked period.`
    );
    if (!confirmation) return;

    setIsProcessing(true);
    try {
      await openYear(selectedYear);
      alert(`🔓 Ledger locks removed for the year ${selectedYear}. Period is now editable.`);
    } catch (err) {
      console.error("Year end unlocking failure:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card" style={{ maxWidth: "650px" }}>
        <AccountingMenu />
        
        <h1 className="accounting-title">Year End Routines</h1>
        <p className="accounting-subtitle">
          Manage corporate accounting period switches, freeze general ledger balances, and enforce compliance lockdown loops.
        </p>

        <hr className="divider" />

        {/* --- SYSTEM INTERFACE CONFIGURATION TOOL --- */}
        <div style={{ background: "#fdfbf7", padding: "1.5rem", border: "1px solid #d2c4a8", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label htmlFor="year-select" style={{ fontWeight: "bold", color: "#4a3f35" }}>
              Target Accounting Term:
            </label>
            
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              disabled={isProcessing || loading}
              style={{ padding: "0.45rem 1rem", border: "1px solid #c8b79a", borderRadius: "4px", fontFamily: "inherit", fontSize: "0.95rem" }}
            >
              {availableLedgerYears.map(yr => (
                <option key={yr} value={yr}>Financial Year {yr}</option>
              ))}
            </select>
          </div>

          {/* Dynamic Period Audit Marker Tag */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed #c8b79a", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
            <span style={{ fontSize: "0.9rem", color: "#6b5c4a" }}>Current Status Line:</span>
            <span style={{ 
              fontWeight: "bold", 
              padding: "0.3rem 0.75rem", 
              borderRadius: "4px",
              fontSize: "0.85rem",
              background: activeYearStatus ? "#fff5f5" : "#edf7ed",
              color: activeYearStatus ? "#7a1f1f" : "#1e4620",
              border: activeYearStatus ? "1px solid #c27a7a" : "1px solid #c3e6cb"
            }}>
              {activeYearStatus ? "🔒 Period Closed & Frozen" : "🔓 Open For Transaction Entries"}
            </span>
          </div>
        </div>

        {/* --- DYNAMIC CONDITIONAL BUTTON WORKSPACE --- */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
          {activeYearStatus ? (
            // Display administrative override unlock button if the period is locked
            <button
              className="small-button"
              style={{ padding: "0.6rem 1.5rem", borderColor: "#c27a7a", color: "#7a1f1f" }}
              onClick={handleRollbackRoutine}
              disabled={isProcessing || loading}
            >
              {isProcessing ? "Releasing Locks..." : "🔓 Unlock Period (Admin Override)"}
            </button>
          ) : (
            // Display normal compliance freeze button if the period is open
            <button
              className="ledger-button active"
              style={{ padding: "0.6rem 2rem", width: "100%" }}
              onClick={handleLockdownRoutine}
              disabled={isProcessing || loading}
            >
              {isProcessing ? "Executing Rollover Calculation..." : `⚡ Finalize & Lock Financial Year ${selectedYear}`}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
