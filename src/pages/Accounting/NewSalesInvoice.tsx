import { useState } from "react";
import { useAccounting } from "./AccountingContext"; // Adjust path as needed

export function NewSalesInvoice() {
  const { addSalesInvoice } = useAccounting();
  const [amount, setAmount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSalesInvoice({
      customerId: 1, // Example
      amount: amount,
      status: "Unpaid",
      date: new Date().toISOString(),
    });
    alert("Invoice Created");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>New Sales Invoice</h2>
      <input 
        type="number" 
        value={amount} 
        onChange={(e) => setAmount(Number(e.target.value))} 
        placeholder="Amount" 
      />
      <button type="submit">Create Invoice</button>
    </form>
  );
}