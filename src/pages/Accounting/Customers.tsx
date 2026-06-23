import React, { useState } from "react";
import { useAccounting } from "./AccountingContext";
import type { Account } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";
import "./Accounting.css";

export default function Customers() {
  const { customers, accounts, addCustomer } = useAccounting();

  // Filter accounts that are marked as customer accounts
  const customerAccounts: Account[] = accounts.filter(a => a.isCustomer);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accountId, setAccountId] = useState<number | "">(
    customerAccounts[0]?.id ?? ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !accountId) return;

    addCustomer({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      accountId: accountId as number
    });

    setName("");
    setEmail("");
    setPhone("");
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        <h1 className="accounting-title">Customers</h1>
        <p className="accounting-subtitle">
          Manage customer accounts linked to your sales ledger.
        </p>

        <hr className="divider" />

        {/* ---------------------- */}
        {/* CUSTOMER LIST */}
        {/* ---------------------- */}
        <h2 className="section-title">Customer List</h2>

        <table className="ledger-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Linked Account</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>

          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan={4}>No customers added yet.</td>
              </tr>
            )}

            {customers.map(c => {
              const acc = accounts.find(a => a.id === c.accountId);
              return (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{acc ? `${acc.code} ${acc.name}` : "—"}</td>
                  <td>{c.email || "—"}</td>
                  <td>{c.phone || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <hr className="divider" />

        {/* ---------------------- */}
        {/* ADD CUSTOMER FORM */}
        {/* ---------------------- */}
        <h2 className="section-title">Add Customer</h2>

        <form className="account-form" onSubmit={handleSubmit}>
          <div className="form-row">
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
              Email
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </label>

            <label>
              Phone
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Linked Account
              <select
                value={accountId}
                onChange={e =>
                  setAccountId(e.target.value ? Number(e.target.value) : "")
                }
              >
                {customerAccounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.code} {a.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="ledger-button">
              Add Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
