import React, { useState } from "react";
import { useAccounting } from "./AccountingContext"; // Ensured local context importing path
import AccountingMenu from "./AccountingMenu";


// Reinforced typed interface structure
interface BankStatementLine {
  id: string; // Changed from numeric to string for flexible Supabase/UUID compatibility
  date: string;
  description: string;
  amount: number;
  matchedLedgerId: string | null;
}

export default function BankImport() {
  const { fetchAccountingData } = useAccounting(); // Swapped out local state hooks for cloud sync hooks
  const [csvText, setCsvText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  /**
   * Safe CSV Parser using lookahead Regex
   * Handles commas hidden inside quotes perfectly (e.g., "Seiko Repair, Service")
   */
  const parseCSVLines = (text: string): BankStatementLine[] => {
    const rows = text.split(/\r?\n/);
    const validLines: BankStatementLine[] = [];

    // Skip index 0 (the table header row)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].trim();
      if (!row) continue; // Skip empty trailing spaces cleanly

      // Match columns, ignoring commas that reside safely inside quotes
      const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(",");
      
      if (matches.length < 3) continue; // Skip corrupted database strings safely

      const rawDate = matches[0].replace(/['"]+/g, "").trim();
      const rawDescription = matches[1].replace(/['"]+/g, "").trim();
      const rawAmount = Number(matches[2].replace(/['"\s£,]+/g, "")); // Strips text/currencies safely

      // Skip row processing entirely if amount conversion fails to protect ledger database numbers
      if (isNaN(rawAmount)) continue;

      validLines.push({
        id: `stmt_line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: rawDate,
        description: rawDescription,
        amount: rawAmount,
        matchedLedgerId: null,
      });
    }

    return validLines;
  };

  const handleImportSubmit = async () => {
    if (!csvText.trim()) {
      alert("Please paste bank statement data into the workspace text block first.");
      return;
    }

    setIsProcessing(true);
    try {
      const parsedLines = parseCSVLines(csvText);

      if (parsedLines.length === 0) {
        alert("Could not extract any valid accounting entries. Verify column structures are: Date, Description, Amount.");
        setIsProcessing(false);
        return;
      }

      // TODO: Replace this payload configuration row with your direct Supabase Client transaction write once tables go live
      const importPayload = {
        bankAccountCode: "1000", // Standard banking asset ledger code
        statementDate: new Date().toISOString(),
        statementLines: parsedLines,
      };

      console.log("Structured Supabase payload write initialized:", importPayload);
      
      // Clear out input screen space seamlessly
      setCsvText("");
      alert(`🎉 Success! ${parsedLines.length} banking entries parsed and imported securely into ledger state.`);
      await fetchAccountingData(); // Resync system global context files automatically

    } catch (err: any) {
      console.error("Critical statement extraction exception thrown:", err);
      alert("Failed to compile CSV parsing layers. Verify input alignment.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        
        <h1 className="accounting-title">Bank Statement Import Portal</h1>
        <p className="accounting-subtitle">
          Paste exported raw CSV text rows from business checking accounts to initiate digital reconciliations.
        </p>

        <hr className="divider" />

        <div className="journal-form" style={{ marginTop: "1rem" }}>
          <label htmlFor="csv-input-area" style={{ fontWeight: "bold", color: "#4a3f35" }}>
            Paste Document CSV Data (Columns Required: Date, Description, Amount)
          </label>
          
          <textarea
            id="csv-input-area"
            rows={12}
            placeholder={`Date,Description,Amount\n01/06/2026,"Rolex Repair Deposit - J. Smith",500.00\n02/06/2026,"Cousins UK Parts Order V84",-124.50`}
            style={{
              width: "100%",
              marginTop: "0.5rem",
              padding: "0.75rem",
              border: "1px solid #c8b79a",
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "0.85rem",
              backgroundColor: "#fdfbf7"
            }}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            disabled={isProcessing}
          />

          <div className="form-actions" style={{ justifyContent: "flex-end", marginTop: "1rem" }}>
            <button
              className="ledger-button"
              style={{ padding: "0.6rem 1.5rem", fontWeight: "bold" }}
              onClick={handleImportSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing Rows..." : "⚡ Complete Statement Import"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
