import { useState } from "react";
import { useAccounting } from "./AccountingContext";
import type { Account } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";
import "./Accounting.css";

export default function Suppliers() {
  const { accounts, addSupplier, suppliers } = useAccounting();

  // Filter accounts marked as supplier accounts
  const supplierAccounts: Account[] = accounts.filter(a => a.isSupplier);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accountId, setAccountId] = useState<number | "">(
    supplierAccounts[0]?.id ?? ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !accountId) return;

    addSupplier({
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
        <h1 className="accounting-title">Suppliers</h1>
        <p className="accounting-subtitle">
          Manage supplier accounts linked to your purchase ledger.
        </p>

        <hr className="divider" />

        {/* ---------------------- */}
        {/* SUPPLIER LIST */}
        {/* ---------------------- */}
        <h2 className="section-title">Supplier List</h2>

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
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={4}>No suppliers added yet.</td>
              </tr>
            )}

            {suppliers.map(s => {
              const acc = accounts.find(a => a.id === s.accountId);
              return (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{acc ? `${acc.code} ${acc.name}` : "—"}</td>
                  <td>{s.email || "—"}</td>
                  <td>{s.phone || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <hr className="divider" />

        {/* ---------------------- */}
        {/* ADD SUPPLIER FORM */}
        {/* ---------------------- */}
        <h2 className="section-title">Add Supplier</h2>

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
                {supplierAccounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.code} {a.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="ledger-button">
              Add Supplier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
