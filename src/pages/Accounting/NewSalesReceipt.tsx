import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccounting } from "./AccountingContext";

export default function NewSalesReceipt() {
  const navigate = useNavigate();
  const { customers, salesInvoices, addSalesReceipt } = useAccounting();

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<string>("Bank Transfer");
  const [reference, setReference] = useState<string>("");

  // Filter invoices for selected customer
  const filteredInvoices = customerId
    ? salesInvoices.filter(inv => inv.customerId === customerId)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !invoiceId || amount <= 0) return;

    addSalesReceipt({
      customerId,
      invoiceId,
      amount,
      date,
      method,
      reference
    });

    navigate(`/accounting/customer/${customerId}`);
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "500px" }}>
      <h1>Record Sales Payment</h1>

      <form onSubmit={handleSubmit}>

        {/* CUSTOMER */}
        <label>Customer</label>
        <select
          value={customerId ?? ""}
          onChange={e => {
            setCustomerId(Number(e.target.value));
            setInvoiceId(null);
          }}
        >
          <option value="">Select customer…</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* INVOICE */}
        <label>Invoice</label>
        <select
          value={invoiceId ?? ""}
          onChange={e => setInvoiceId(Number(e.target.value))}
          disabled={!customerId}
        >
          <option value="">Select invoice…</option>
          {filteredInvoices.map(inv => (
            <option key={inv.id} value={inv.id}>
              Invoice #{inv.id} — £{inv.amount} — {inv.status}
            </option>
          ))}
        </select>

        {/* AMOUNT */}
        <label>Amount Received</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          min="0"
          step="0.01"
        />

        {/* DATE */}
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        {/* METHOD */}
        <label>Payment Method</label>
        <select value={method} onChange={e => setMethod(e.target.value)}>
          <option>Bank Transfer</option>
          <option>Cash</option>
          <option>Card</option>
        </select>

        {/* REFERENCE */}
        <label>Reference (optional)</label>
        <input
          type="text"
          value={reference}
          onChange={e => setReference(e.target.value)}
        />

        <button type="submit" style={{ marginTop: "1rem" }}>
          Record Payment
        </button>
      </form>
    </div>
  );
}
