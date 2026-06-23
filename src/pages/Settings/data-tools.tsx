import React from "react";

export default function DataTools() {

  // EXPORT DATA
  function exportData() {
    const keys = ["jobs", "customers", "stock", "ledger", "accounts"];
    const data: Record<string, any> = {};

    keys.forEach(key => {
      const value = localStorage.getItem(key);
      data[key] = value ? JSON.parse(value) : null;
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workshop-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // IMPORT DATA
  function importData(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        Object.keys(json).forEach(key => {
          localStorage.setItem(key, JSON.stringify(json[key]));
        });
        alert("Data imported successfully. The app will now reload.");
        window.location.reload();
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  }

  // RESET DATA
  function resetData() {
    if (!window.confirm("Are you sure you want to wipe ALL company data?")) return;
    localStorage.clear();
    alert("All data cleared. The app will now reload.");
    window.location.reload();
  }

  // FACTORY RESET — clears all storage and restores defaults
  function factoryReset() {
    if (!window.confirm("Factory Reset will erase ALL data and restore default accounts. Continue?")) return;

    // Clear every storage layer
    localStorage.clear();
    sessionStorage.clear();
    indexedDB.databases().then(dbs => {
  dbs.forEach(db => {
    if (db.name) indexedDB.deleteDatabase(db.name);
  });
});

    // Recreate default chart of accounts
    const defaultAccounts = [
      { code: "1000", name: "Cash", type: "Asset" },
      { code: "2000", name: "Sales", type: "Income" },
      { code: "3000", name: "Purchases", type: "Expense" }
    ];
    localStorage.setItem("accounts", JSON.stringify(defaultAccounts));

    alert("Factory Reset complete. The app will now reload with default accounts.");
    window.location.reload();
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Data Tools</h1>
      <p>Backup, restore, or reset your workshop data.</p>

      <button onClick={exportData} style={btn}>
        Export Company Data
      </button>

      <div style={{ marginTop: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Import Company Data
        </label>
        <input type="file" accept="application/json" onChange={importData} />
      </div>

      <button
        onClick={resetData}
        style={{ ...btn, background: "#a33", marginTop: "2rem" }}
      >
        Reset ALL Data
      </button>

      <button
        onClick={factoryReset}
        style={{ ...btn, background: "#633", marginTop: "1rem" }}
      >
        Factory Reset (Erase + Restore Defaults)
      </button>
    </div>
  );
}

const btn = {
  padding: "0.7rem 1.2rem",
  background: "#5a4632",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};
