import React, { useState } from "react";
import { useAccounting } from "../Accounting/AccountingContext";
import { useJobs } from "../../hooks/useJobs";
import { supabase } from "../../lib/supabaseClient";


// Ensure the export name matches your router.tsx import exactly
export default function DataTools() {
  const { accounts, customers, suppliers, journalEntries, fetchAccountingData } = useAccounting();
  const { jobs, refreshJobsData } = useJobs() as any;
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * 1. EXPORT CENTER: Compiles your entire live cloud database into a portable JSON snapshot
   */
  function handleExportCloudBackup() {
    const comprehensiveSnapshot = {
      exportedAt: new Date().toISOString(),
      engineVersion: "2.0.0-Supabase",
      accounts,
      customers,
      suppliers,
      journalEntries,
      jobs
    };

    const dataBlob = new Blob([JSON.stringify(comprehensiveSnapshot, null, 2)], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(dataBlob);
    
    const domesticAnchor = document.createElement("a");
    domesticAnchor.href = downloadUrl;
    domesticAnchor.download = `workshop-cloud-backup-${new Date().toISOString().slice(0, 10)}.json`;
    domesticAnchor.click();
    
    URL.revokeObjectURL(downloadUrl);
  }

  /**
   * 2. DATA IMPORT & SEEDING CENTER
   */
  async function handleImportCloudBackup(event: React.ChangeEvent<HTMLInputElement>) {
    const backupFile = event.target.files?.[0];
    if (!backupFile) return;

    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      setIsProcessing(true);
      try {
        const structuralJson = JSON.parse(e.target?.result as string);
        
        if (!structuralJson.accounts || !Array.isArray(structuralJson.accounts)) {
          throw new Error("Invalid database schema footprint: Missing core Chart of Accounts array.");
        }

        const confirmSeeding = window.confirm(
          `Parsed backup file safely.\n\nDetected records:\n- Accounts: ${structuralJson.accounts.length}\n- Customers: ${structuralJson.customers?.length || 0}\n- Job Cards: ${structuralJson.jobs?.length || 0}\n\nProceed to seed cloud database tables?`
        );
        if (!confirmSeeding) {
          setIsProcessing(false);
          return;
        }

        if (structuralJson.accounts.length > 0) {
          await supabase.from("accounts").upsert(structuralJson.accounts);
        }
        if (structuralJson.customers?.length > 0) {
          await supabase.from("customers").upsert(structuralJson.customers);
        }
        if (structuralJson.jobs?.length > 0) {
          await supabase.from("jobs").upsert(structuralJson.jobs);
        }

        alert("🎉 Cloud database tables seeded and synchronized successfully.");
        await fetchAccountingData();
        if (refreshJobsData) await refreshJobsData();

      } catch (err: any) {
        alert(`Parsing Exception Abort: ${err.message || "Invalid JSON array footprint."}`);
      } finally {
        setIsProcessing(false);
        if (event.target) event.target.value = "";
      }
    };
    fileReader.readAsText(backupFile);
  }

  /**
   * 3. COMPLIANCE PURGING CENTER
   */
  async function handleResetCloudLedgers() {
    const confirmationString = "WIPE LIVE DATABASE";
    const verificationMemo = window.prompt(
      `🚨 EXTREME ADMINISTRATIVE WARNING! 🚨\n\nYou are executing a command to wipe ALL corporate history records from the cloud tables.\n\nType "${confirmationString}" to confirm:`
    );

    if (verificationMemo !== confirmationString) {
      alert("Purge sequence aborted. Mismatch verification parameters.");
      return;
    }

    setIsProcessing(true);
    try {
      await supabase.from("journal_entries").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("sales_invoices").delete().neq("id", 0);
      await supabase.from("jobs").delete().neq("id", 0);

      alert("✓ Transaction histories cleared from live production tables.");
      await fetchAccountingData();
      if (refreshJobsData) await refreshJobsData();
    } catch (err) {
      console.error("Purge failure:", err);
      alert("Security Exception: Failed to clear cloud database records.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="accounting-container">
      <div className="parchment-card" style={{ maxWidth: "650px" }}>
        <h1 className="accounting-title">Administrative Data Tools</h1>
        <p className="accounting-subtitle">
          Execute full system backup exports, seed tables via JSON migration files, or purge ledger transactions.
        </p>

        <hr className="divider" />

        <h3 className="section-title">1. Operational Ledger Backups</h3>
        <div style={{ background: "#fdfbf7", padding: "1.25rem", border: "1px solid #d2c4a8", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b5c4a", lineHeight: "1.4" }}>
            Generate a local, unencrypted JSON backup file containing your complete general ledger logs, customer databases, material stock logs, and active workshop tickets.
          </p>
          <button 
            onClick={handleExportCloudBackup} 
            className="ledger-button active" 
            style={{ padding: "0.55rem 1.5rem", fontSize: "0.9rem" }}
            disabled={isProcessing}
          >
            📥 Export Portable JSON Backup
          </button>
        </div>

        <h3 className="section-title" style={{ marginTop: "2rem" }}>2. Ingest Historical Seed Snapshot</h3>
        <div style={{ background: "#fdfbf7", padding: "1.25rem", border: "1px solid #d2c4a8", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b5c4a", lineHeight: "1.4" }}>
            Select a verified system migration backup file to seed or populate empty database tables. Existing duplicate IDs will be safely updated in place.
          </p>
          <input 
            type="file" 
            accept=".json" 
            onChange={handleImportCloudBackup} 
            disabled={isProcessing}
            style={{ fontSize: "0.85rem", color: "#4a3f35" }}
          />
        </div>

        <h3 className="section-title" style={{ marginTop: "2.5rem", color: "#7a1f1f" }}>3. Destructive Emergency Resets</h3>
        <div style={{ background: "#fff5f5", padding: "1.25rem", border: "1px dashed #c27a7a", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#7a1f1f", lineHeight: "1.4" }}>
            <strong>CRITICAL RECOVERY NOTICE:</strong> Executing this reset sequence will permanently delete all live customer invoices, manual journals, and job card logs across the business network. This action cannot be undone.
          </p>
          <button 
            onClick={handleResetCloudLedgers} 
            className="small-button danger" 
            style={{ padding: "0.6rem 2rem", fontWeight: "bold" }}
            disabled={isProcessing}
          >
            {isProcessing ? "Executing Sequence..." : "💥 Purge Live Cloud Database Transactions"}
          </button>
        </div>
      </div>
    </div>
  );
}