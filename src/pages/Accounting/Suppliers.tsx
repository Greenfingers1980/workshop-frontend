import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAccounting } from "./AccountingContext";
import type { Supplier } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";


export default function SupplierPayments() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { suppliers, accounts, addSupplierPayment, loading } = useAccounting();

  // 1. Route Interception: Capture pre-filled query IDs routing from the Supplier Ledger shortcuts
  const targetQuerySupplierId = searchParams.get("supplierId");

  const [supplierId, setSupplierId] = useState<number | "">("");
  const [bankAccountId, setBankAccountId] = useState<number | "">("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 2. Strict Account Filtering: Isolate liquid cash assets, excluding physical stock values
  const validBankAccounts = useMemo(() => {
    return accounts.filter(a => 
      a.type === "Asset" && 
      (a.code === "1000" || a.name.toLowerCase().includes("bank") || a.name.toLowerCase().includes("cash"))
    );
  }, [accounts]);

  // 3. Fix Stale Hooks Bug: Repopulate input states smoothly when the cloud payload arrives
  useEffect(() => {
    if (targetQuerySupplierId) {
      setSupplierId(Number(targetQuerySupplierId));
    } else if (suppliers.length > 0 && !supplierId) {
      setSupplierId(suppliers[0].id);
    }
  }, [suppliers, targetQuerySupplierId, supplierId]);

  useEffect(() => {
    if (validBankAccounts.length > 0 && !bankAccountId) {
      setBankAccountId(validBankAccounts[0].id);
    }
  }, [validBankAccounts, bankAccountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Math.round(parseFloat(amount) * 100) / 100;

    if (!supplierId || !bankAccountId || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Validation Error: Please complete all operational form variables with positive numeric amounts.");
      return;
    }

    setIsSubmitting(true);

    try {
      await addSupplierPayment({
  supplierId: supplierId as number,
  invoiceId: 0, // Set to 0 or another default if no invoice is linked
  method: "Bank Transfer", // Provide a default or capture from form
  bankAccountId: Number(bankAccountId) || 0,
  date: date,
  amount: parsedAmount,
  reference: "" // Optional, but good practice
});

      alert("🎉 Cash payment outflow successfully recorded and balanced against trade accounts payable.");
      setAmount("");
      
      // Navigate back to the supplier ledger profile view seamlessly
      navigate("/supplier-ledger");
    } catch (err) {
      console.error("Critical payables posting failure:", err);
      alert("Database error: Could not commit payment parameters to cloud ledger.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card" style={{ maxWidth: "700px" }}>
        <AccountingMenu />
        <h1 className="accounting-title">Supplier Payments Control</h1>
        <p className="accounting-subtitle">
          Record outbound bank wires, card payments, or workshop cash expenditures to reduce your trade trade liabilities.
        </p>

        <hr className="divider" />

        {/* --- ADD TRANSACTION ENTRY FORM --- */}
        <h2 className="section-title">Record Payment Outflow</h2>

        <form className="account-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Target Supplier / Creditor
              <select
                value={supplierId}
                onChange={e => setSupplierId(e.target.value ? Number(e.target.value) : "")}
                disabled={isSubmitting || loading}
                required
              >
                {suppliers.length === 0 && <option value="">No suppliers found</option>}
                {suppliers.map((s: Supplier) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>

            <label>
              Source Liquid Bank Account
              <select
                value={bankAccountId}
                onChange={e => setBankAccountId(e.target.value ? Number(e.target.value) : "")}
                disabled={isSubmitting || loading}
                required
              >
                {validBankAccounts.length === 0 && <option value="">No liquid banking codes found</option>}
                {validBankAccounts.map(a => (
                  <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                ))}
              </select>
            </label>

            <label>
              Transaction Value Date
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label style={{ flex: "0 0 32%" }}>
              Net Settled Amount (£)
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                disabled={isSubmitting}
                required
                style={{ fontWeight: amount ? "bold" : "normal" }}
              />
            </label>
          </div>

          <div className="form-actions" style={{ justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <button 
              type="submit" 
              className={`ledger-button ${Number(amount) > 0 && supplierId && !isSubmitting ? "active" : ""}`}
              disabled={Number(amount) <= 0 || !supplierId || isSubmitting}
              style={{ padding: "0.6rem 2.5rem" }}
            >
              {isSubmitting ? "Processing Payables Transaction..." : "⚡ Commit Outbound Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}