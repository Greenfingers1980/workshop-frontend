import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAccounting } from "./AccountingContext";
import type { Account } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";


export default function Customers() {
  const { customers, accounts, addCustomer, salesInvoices, loading } = useAccounting();

  // 1. Isolate customer control options safely
  const customerAccounts = useMemo<Account[]>(() => {
    return accounts.filter(a => a.isCustomer);
  }, [accounts]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(""); // Missing critical courier delivery parameter
  const [accountId, setAccountId] = useState<number | "">("");

  // 2. Fix the Stale Initialization Bug: Update selector when cloud sync finishes
  useEffect(() => {
    if (customerAccounts.length > 0 && !accountId) {
      setAccountId(customerAccounts[0].id);
    }
  }, [customerAccounts, accountId]);

  // 3. Performance Hash Optimization: Build an O(1) map for accounts lookup
  const accountMap = useMemo(() => {
    return new Map<number, string>(accounts.map(a => [a.id, `${a.code} ${a.name}`]));
  }, [accounts]);

  // 4. Counts active unpaid/part-paid repair balance tracking values per client
  const activeJobInvoiceCounts = useMemo(() => {
    const countsMap: Record<number, number> = {};
    salesInvoices.forEach(inv => {
      if (inv.status !== "Paid") {
        countsMap[inv.customerId] = (countsMap[inv.customerId] || 0) + 1;
      }
    });
    return countsMap;
  }, [salesInvoices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !accountId) return;

    try {
      await addCustomer({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        accountId: accountId as number
      });

      // Flush fields cleanly upon transaction completion
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
    } catch (err) {
      console.error("Database write rejection exception:", err);
    }
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        <h1 className="accounting-title">Customer Registry</h1>
        <p className="accounting-subtitle">
          Manage client billing profiles, contact points, and shipping records linked to your sales ledgers.
        </p>

        <hr className="divider" />

        {/* --- CUSTOMERS VIEW SHEET --- */}
        <h2 className="section-title">Active Clients</h2>
        
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#6b5c4a" }}>Loading profiles...</div>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Linked Control Ledger</th>
                <th>Contact Details</th>
                <th>Physical Address</th>
                <th style={{ textAlign: "center" }}>Open Tickets</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "#6b5c4a" }}>No customer records found.</td></tr>
              ) : (
                customers.map(c => {
                  const accountLabel = accountMap.get(c.accountId??0) || "—";
                  const openInvoicesCount = activeJobInvoiceCounts[c.id] || 0;

                  return (
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong></td>
                      <td><code>{accountLabel}</code></td>
                      <td style={{ fontSize: "0.85rem", lineHeight: "1.3" }}>
                        <div>✉️ {c.email || <span style={{ color: "#9b8b6f" }}>No email</span>}</div>
                        <div>📞 {c.phone || <span style={{ color: "#9b8b6f" }}>No phone</span>}</div>
                      </td>
                      <td style={{ fontSize: "0.85rem", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.address}>
                        {c.address || "—"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {openInvoicesCount > 0 ? (
                          <span className="small-button danger" style={{ pointerEvents: "none", fontWeight: "bold" }}>
                            {openInvoicesCount} Active
                          </span>
                        ) : (
                          <span style={{ color: "#5b8461", fontSize: "0.85rem" }}>✓ Clear</span>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <Link to={`/customer-view?id=${c.id}`} className="small-button">
                          👁️ View Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        <hr className="divider" />

        {/* --- DOCK INSCRIPTION REGISTRATION FORM --- */}
        <h2 className="section-title">Register New Customer</h2>
        <form className="account-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Full Name / Client Entity
              <input type="text" placeholder="e.g. James Harrison" value={name} onChange={e => setName(e.target.value)} required />
            </label>

            <label>
              Email Contact
              <input type="email" placeholder="e.g. james@harrison.co.uk" value={email} onChange={e => setEmail(e.target.value)} />
            </label>

            <label>
              Phone Contact
              <input type="text" placeholder="e.g. 07123 456789" value={phone} onChange={e => setPhone(e.target.value)} />
            </label>
          </div>

          <div className="form-row">
            <label style={{ flex: 2 }}>
              Secure Shipping & Return Courier Address
              <input type="text" placeholder="e.g. 12 Finchley Road, London, NW3 6AX" value={address} onChange={e => setAddress(e.target.value)} />
            </label>

            <label style={{ flex: 1 }}>
              Control Account Mapping
              <select value={accountId} onChange={e => setAccountId(e.target.value ? Number(e.target.value) : "")} required>
                {customerAccounts.length === 0 && <option value="">No customer control accounts available</option>}
                {customerAccounts.map(a => (
                  <option key={a.id} value={a.id}>{a.code} {a.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-actions" style={{ justifyContent: "flex-end", marginTop: "1rem" }}>
            <button type="submit" className="ledger-button active" style={{ padding: "0.6rem 2rem" }}>
              ✚ Register Client Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
