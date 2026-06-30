import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAccounting } from "./AccountingContext";
import type { Supplier } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";

export default function SupplierPayments() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { suppliers, accounts, addSupplierPayment, loading } = useAccounting();

  const targetQuerySupplierId = searchParams.get("supplierId");

  const [supplierId, setSupplierId] = useState<number | "">("");
  const [bankAccountId, setBankAccountId] = useState<number | "">("");
  const [invoiceId, setInvoiceId] = useState<string>("");
  const [method, setMethod] = useState<string>("Bank Transfer");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validBankAccounts = useMemo(() => {
    return accounts.filter(a => 
      a.type === "Asset" && 
      (a.code === "1000" || a.name.toLowerCase().includes("bank") || a.name.toLowerCase().includes("cash"))
    );
  }, [accounts]);

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
      alert("Validation Error: Please complete all operational form variables.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addSupplierPayment({
        supplierId: supplierId as number,
        invoiceId: Number(invoiceId) || 0,
        method: method,
        bankAccountId: Number(bankAccountId) || 0,
        date: date,
        amount: parsedAmount
      });

      alert("🎉 Payment successfully recorded.");
      navigate("/accounting/supplier-ledger");
    } catch (err) {
      console.error(err);
      alert("Database error: Could not commit payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="accounting-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "2rem" }}>
      {/* Menu is now full-width and outside the card */}
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <AccountingMenu />
      </div>

      {/* Card increased to 900px for a more expansive look */}
      <div className="parchment-card" style={{ width: "100%", maxWidth: "900px", padding: "2rem" }}>
        <h1 className="accounting-title" style={{ textAlign: "center" }}>Supplier Payments Control</h1>
        <hr className="divider" />
        
        <form className="account-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Grid layout for balanced form fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <label>
              Target Supplier
              <select value={supplierId} onChange={e => setSupplierId(Number(e.target.value))} required>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label>
              Payment Method
              <input type="text" value={method} onChange={e => setMethod(e.target.value)} required />
            </label>
            <label>
              Invoice ID (Optional)
              <input type="number" value={invoiceId} onChange={e => setInvoiceId(e.target.value)} placeholder="0" />
            </label>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <label>
              Source Bank Account
              <select value={bankAccountId} onChange={e => setBankAccountId(Number(e.target.value))} required>
                {validBankAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </label>
            <label>
              Amount (£)
              <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
            <button type="submit" className="ledger-button active" disabled={isSubmitting} style={{ padding: "1rem 3rem" }}>
              {isSubmitting ? "Processing..." : "⚡ Commit Outbound Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}