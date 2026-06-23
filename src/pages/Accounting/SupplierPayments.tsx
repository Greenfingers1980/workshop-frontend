import { useState } from "react";
import { useAccounting } from "./AccountingContext";
import type { Supplier } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";
import "./Accounting.css";

export default function SupplierPayments() {
  const { suppliers, accounts, addSupplierPayment } = useAccounting();

  // Bank accounts = Asset accounts
  const bankAccounts = accounts.filter(a => a.type === "Asset");

  const [supplierId, setSupplierId] = useState<number | "">(
    suppliers[0]?.id ?? ""
  );
  const [bankAccountId, setBankAccountId] = useState<number | "">(
    bankAccounts[0]?.id ?? ""
  );
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId || !bankAccountId || !amount.trim()) {
      alert("Please complete all fields.");
      return;
    }

    addSupplierPayment({
      supplierId: supplierId as number,
      bankAccountId: bankAccountId as number,
      date,
      amount: parseFloat(amount)
    });

    setAmount("");
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        <h1 className="accounting-title">Supplier Payments</h1>
        <p className="accounting-subtitle">
          Record payments made to suppliers and automatically post them to the ledger.
        </p>

        <hr className="divider" />

        {/* ---------------------- */}
        {/* PAYMENT FORM */}
        {/* ---------------------- */}
        <h2 className="section-title">Record Payment</h2>

        <form className="account-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Supplier
              <select
                value={supplierId}
                onChange={e =>
                  setSupplierId(e.target.value ? Number(e.target.value) : "")
                }
              >
                {suppliers.map((s: Supplier) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Bank Account
              <select
                value={bankAccountId}
                onChange={e =>
                  setBankAccountId(e.target.value ? Number(e.target.value) : "")
                }
              >
                {bankAccounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.code} {a.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Date
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Amount
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="ledger-button">
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
