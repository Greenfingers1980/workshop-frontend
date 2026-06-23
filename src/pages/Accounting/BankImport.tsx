import React, { useState } from "react";
import { useAccounting } from "../../hooks/useAccounting";
import type { BankStatementLine } from "../../hooks/useAccounting";

const BankImport: React.FC = () => {
  const { addReconciliation } = useAccounting();
  const [csvText, setCsvText] = useState("");

  // Convert CSV text into BankStatementLine[]
  const parseCSV = (text: string): BankStatementLine[] => {
    return text
      .split("\n")
      .slice(1) // skip header
      .map((line) => {
        const [date, description, amount] = line.split(",");

        return {
          id: Date.now() + Math.random(), // numeric ID
          date,
          description,
          amount: Number(amount),
          matchedLedgerId: null,
        };
      });
  };

  const handleImport = () => {
    const lines = parseCSV(csvText);

    addReconciliation({
      id: Date.now(), // numeric ID
      bankAccountCode: "BANK",
      statementDate: new Date().toISOString(),
      openingBalance: 0,
      closingBalance: 0,
      statementLines: lines,
    });

    alert("Statement imported successfully");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Import Bank Statement</h2>

      <textarea
        rows={10}
        style={{ width: "100%" }}
        value={csvText}
        onChange={(e) => setCsvText(e.target.value)}
      />

      <button onClick={handleImport} style={{ marginTop: 10 }}>
        Import
      </button>
    </div>
  );
};

export default BankImport;
