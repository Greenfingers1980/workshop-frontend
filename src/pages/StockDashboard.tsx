import { useEffect, useState } from "react";
import type { StockItem } from "../lib/stock";
import { getStock } from "../lib/stock";
import "./Dashboard.css";

export default function StockDashboard() {
  const [stock, setStock] = useState<StockItem[]>([]);

  useEffect(() => {
    setStock(getStock());
  }, []);

  // Derived lists
  const lowStock = stock.filter((s) => s.quantity > 0 && s.quantity <= 5);
  const outOfStock = stock.filter((s) => s.quantity === 0);

  // Recently added = newest IDs
  const recentlyAdded = [...stock]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  // Recently used = items with latest history entries
  const recentlyUsed = [...stock]
    .filter((s) => s.history && s.history.length > 0)
    .sort((a, b) => {
      const da = new Date(a.history![a.history!.length - 1].date).getTime();
      const db = new Date(b.history![b.history!.length - 1].date).getTime();
      return db - da;
    })
    .slice(0, 5);

  const totalValue = stock.reduce(
    (sum, item) => sum + item.quantity * item.costPrice,
    0
  );

  return (
    <div className="panel">
      <h1>Stock Dashboard</h1>
      <p className="muted">Workshop inventory overview and alerts.</p>

      {/* Summary Cards */}
      <div className="dashboard-grid">
        <div className="dash-card">
          <h3>Total Stock Items</h3>
          <p className="dash-number">{stock.length}</p>
        </div>

        <div className="dash-card">
          <h3>Total Stock Value</h3>
          <p className="dash-number">£{totalValue.toFixed(2)}</p>
        </div>

        <div className="dash-card warning">
          <h3>Low Stock</h3>
          <p className="dash-number">{lowStock.length}</p>
        </div>

        <div className="dash-card danger">
          <h3>Out of Stock</h3>
          <p className="dash-number">{outOfStock.length}</p>
        </div>
      </div>

      <hr className="divider" />

      {/* Low Stock */}
      <section>
        <h2>Low Stock (≤ 5)</h2>
        {lowStock.length === 0 ? (
          <p className="muted">No low stock items.</p>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.quantity}</td>
                  <td>£{item.costPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <hr className="divider" />

      {/* Out of Stock */}
      <section>
        <h2>Out of Stock</h2>
        {outOfStock.length === 0 ? (
          <p className="muted">No items are fully out of stock.</p>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {outOfStock.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>£{item.costPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <hr className="divider" />

      {/* Recently Added */}
      <section>
        <h2>Recently Added</h2>
        {recentlyAdded.length === 0 ? (
          <p className="muted">No recent additions.</p>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {recentlyAdded.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <hr className="divider" />

      {/* Recently Used */}
      <section>
        <h2>Recently Used</h2>
        {recentlyUsed.length === 0 ? (
          <p className="muted">No recent usage.</p>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Last Movement</th>
                <th>Qty Change</th>
              </tr>
            </thead>
            <tbody>
              {recentlyUsed.map((item) => {
                const last = item.history![item.history!.length - 1];
                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.sku}</td>
                    <td>{new Date(last.date).toLocaleDateString()}</td>
                    <td>{last.qty > 0 ? `+${last.qty}` : last.qty}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

