import React, { useState } from "react";
import { useAccounting } from "./AccountingContext";
import type { AccountType } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";


export default function ChartOfAccounts() {
  const { accounts, addAccount } = useAccounting();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("Asset");
  const [isCustomer, setIsCustomer] = useState(false);
  const [isSupplier, setIsSupplier] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Reusable account code standard validation ranges
  const getCodeRangeHint = (accountType: AccountType) => {
    switch (accountType) {
      case "Asset": return "1000 - 1999";
      case "Liability": return "2000 - 2999";
      case "Equity": return "3000 - 3999";
      case "Income": return "4000 - 4999";
      case "Expense": return "5000 - 5999";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanCode = code.trim();
    const cleanName = name.trim();

    if (!cleanCode || !cleanName) return;

    // 1. Safety Guardrail: Prevent duplicate account code entries
    const codeExists = accounts.some(acc => acc.code === cleanCode);
    if (codeExists) {
      setFormError(`Ledger Code "${cleanCode}" is already assigned to an account.`);
      return;
    }

    // 2. Database Sync Write
    try {
      await addAccount({
        code: cleanCode,
        name: cleanName,
        type,
        isCustomer,
        isSupplier
      });

      // Clear input form cleanly upon successful write
      setCode("");
      setName("");
      setIsCustomer(false);
      setIsSupplier(false);
    } catch (err) {
      setFormError("Failed to save the new ledger entry to the database.");
    }
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        
        <h1 className="accounting-title">Chart of Accounts</h1>
        <p className="accounting-subtitle">
          Manage and review the foundational ledger structure tracking your workshop balances.
        </p>

        <hr className="divider" />

        {/* --- ACCOUNTS LISTING DISPLAY --- */}
        <h2 className="section-title">Active General Ledgers</h2>
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account Name</th>
              <th>Classification Type</th>
              <th style={{ textAlign: "center" }}>Customer Subledger</th>
              <th style={{ textAlign: "center" }}>Supplier Subledger</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(acc => (
              <tr key={acc.id}>
                <td><strong>{acc.code}</strong></td>
                <td>{acc.name}</td>
                <td>
                  <span className={`badge-type ${acc.type.toLowerCase()}`}>
                    {acc.type}
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>{acc.isCustomer ? "✓ Yes" : "—"}</td>
                <td style={{ textAlign: "center" }}>{acc.isSupplier ? "✓ Yes" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="divider" />

        {/* --- DEFENSIVE STRUCTURED INPUT ENTRY FORM --- */}
        <h2 className="section-title">Add New Ledger Account</h2>
        
        {formError && (
          <div style={{ padding: "0.75rem", background: "#fff5f5", border: "1px solid #c27a7a", borderRadius: "4px", marginBottom: "1rem", fontSize: "0.85rem", color: "#7a1f1f", fontWeight: "bold" }}>
            ⚠️ Error: {formError}
          </div>
        )}

        <form className="account-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label style={{ position: "relative" }}>
              Code <span style={{ fontSize: "0.75rem", color: "#6b5c4a" }}>({getCodeRangeHint(type)})</span>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 4100"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ""))} // Restricts input to numbers only
                required
              />
            </label>

            <label>
              Account Name
              <input
                type="text"
                placeholder="e.g. Parts Labor Income"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </label>

            <label>
              Classification Type
              <select
                value={type}
                onChange={e => setType(e.target.value as AccountType)}
              >
                <option value="Asset">Asset</option>
                <option value="Liability">Liability</option>
                <option value="Equity">Equity</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </label>
          </div>

          <div className="form-row" style={{ marginTop: "0.5rem" }}>
            {/* Mutual Exclusivity Logic: Customer vs Supplier constraints */}
            <label className="checkbox-label" style={{ opacity: isSupplier ? 0.5 : 1 }}>
              <input
                type="checkbox"
                checked={isCustomer}
                disabled={isSupplier}
                onChange={e => setIsCustomer(e.target.checked)}
              />
              Link Customer Control Account
            </label>

            <label className="checkbox-label" style={{ opacity: isCustomer ? 0.5 : 1 }}>
              <input
                type="checkbox"
                checked={isSupplier}
                disabled={isCustomer}
                onChange={e => setIsSupplier(e.target.checked)}
              />
              Link Supplier Control Account
            </label>
          </div>

          <div className="form-actions" style={{ justifyContent: "flex-end", marginTop: "1rem" }}>
            <button type="submit" className="ledger-button active" style={{ padding: "0.6rem 2rem" }}>
              ✚ Instantiate Ledger Row
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
