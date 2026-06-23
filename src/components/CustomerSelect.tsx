import React, { useState } from "react";
import { useAccounting } from "../pages/Accounting/AccountingContext";

interface CustomerSelectProps {
  value: number | null;
  onChange: (customerId: number | null) => void;
  allowCreate?: boolean;
}

export default function CustomerSelect({ value, onChange, allowCreate = true }: CustomerSelectProps) {
  const { customers, addCustomer } = useAccounting();
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    (c.phone ?? "").includes(query) ||
    (c.email ?? "").toLowerCase().includes(query.toLowerCase())
  );

  const selectedCustomer = customers.find(c => c.id === value) || null;

  const handleCreate = () => {
    const name = query.trim();
    if (!name) return;

    const newCustomer = {
      name,
      phone: "",
      email: "",
      accountId: 2 // Trade Debtors
    };

    addCustomer(newCustomer);
    const created = customers[customers.length - 1];
    onChange(created.id);
    setShowCreate(false);
  };

  return (
    <div className="customer-select">
      <label>Customer</label>

      <input
        type="text"
        placeholder="Search customers…"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      {selectedCustomer && (
        <div className="selected-customer">
          <strong>Selected:</strong> {selectedCustomer.name}
        </div>
      )}

      <div className="customer-results">
        {filtered.map(c => (
          <div
            key={c.id}
            className="customer-result"
            onClick={() => onChange(c.id)}
          >
            <strong>{c.name}</strong>
            <div>{c.phone}</div>
            <div>{c.email}</div>
          </div>
        ))}

        {allowCreate && query.length > 2 && filtered.length === 0 && (
          <div className="customer-create" onClick={handleCreate}>
            ➕ Add new customer: <strong>{query}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
