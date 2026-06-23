import React, { useState } from "react";
import { useAccounting } from "./AccountingContext";
import type { AccountType } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";
import "./Accounting.css";

export default function ChartOfAccounts() {
  const { accounts, addAccount } = useAccounting();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("Asset");
  const [isCustomer, setIsCustomer] = useState(false);
  const [isSupplier, setIsSupplier] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || !name.trim()) return;

    addAccount({
      code: code.trim(),
      name: name.trim(),
      type,
      isCustomer,
      isSupplier
    });

    setCode("");
    setName("");
    setIsCustomer(false);
    setIsSupplier(false);
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        <h1 className="accounting-title">Chart of Accounts</h1>
        <p className="accounting-subtitle">
          Core ledger accounts for your workshop.
        </p>

        <hr className="divider" />

        {/* ---------------------- */}
        {/* ACCOUNT LIST */}
        {/* ---------------------- */}
        <h2 className="section-title">Accounts</h2>

        <table className="ledger-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Customer</th>
              <th>Supplier</th>
            </tr>
          </thead>

          <tbody>
            {accounts.map(acc => (
              <tr key={acc.id}>
                <td>{acc.code}</td>
                <td>{acc.name}</td>
                <td>{acc.type}</td>
                <td>{acc.isCustomer ? "Yes" : ""}</td>
                <td>{acc.isSupplier ? "Yes" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="divider" />

        {/* ---------------------- */}
        {/* ADD ACCOUNT FORM */}
        {/* ---------------------- */}
        <h2 className="section-title">Add Account</h2>

        <form className="account-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Code
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
              />
            </label>

            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </label>

            <label>
              Type
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

          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isCustomer}
                onChange={e => setIsCustomer(e.target.checked)}
              />
              Customer account
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isSupplier}
                onChange={e => setIsSupplier(e.target.checked)}
              />
              Supplier account
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="ledger-button">
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
