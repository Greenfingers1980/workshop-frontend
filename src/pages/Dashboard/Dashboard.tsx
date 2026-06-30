import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAccounting } from "../Accounting/AccountingContext";
import { useJobs } from "../../hooks/useJobs";
import "../Dashboard/Dashboard.css"; 

interface StockItem { id: string; stock_level: number; alert_threshold?: number; }

export default function Dashboard() {
  const { jobs } = useJobs();
  const { salesInvoices, salesReceipts, loading: accountingLoading } = useAccounting();
  
  const stockItems: StockItem[] = []; 
  const technicianTasks: any[] = [];

  const receiptTotalsMap = useMemo(() => {
    const sums: Record<number, number> = {};
    if (!salesReceipts) return sums;
    salesReceipts.forEach(r => { sums[r.invoiceId] = (sums[r.invoiceId] || 0) + r.amount; });
    return sums;
  }, [salesReceipts]);

  const outstandingReceivablesValue = useMemo(() => {
    if (!salesInvoices) return 0;
    return salesInvoices.reduce((sum, inv) => {
      const settledAmount = receiptTotalsMap[inv.id] || 0;
      const balanceDue = inv.amount - settledAmount;
      return sum + (balanceDue > 0 ? balanceDue : 0);
    }, 0);
  }, [salesInvoices, receiptTotalsMap]);

  return (
    <div className="dashboard-container">
      {/* Header section (no longer holds the background image) */}
      <header className="dashboard-hero">
        <div className="hero-overlay">
          <h1 className="hero-title">Welcome to the Workshop</h1>
          <p className="hero-subtitle">Horological precision, synchronized.</p>
        </div>
      </header>

      <section className="card">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-row">
          <Link className="action-button" to="/jobs/new">🔧 New Job Ticket</Link>
          <Link className="action-button" to="/accounting/sales-invoice/new">📄 New Sales Invoice</Link>
          <Link className="action-button" to="/accounting/sales-receipts/new">💰 Record Payment</Link>
          <Link className="action-button" to="/stock/adjust">⚡ Adjust Stock</Link>
        </div>
      </section>

      <div className="metrics-grid">
        <div className="card metric-card">
          <h3>Open Tickets</h3>
          <p className="metric-value">{jobs?.length || 0}</p>
          <Link to="/jobs">View Queue →</Link>
        </div>
        <div className="card metric-card">
          <h3>Receivables</h3>
          <p className="metric-value">£{accountingLoading ? "..." : outstandingReceivablesValue.toFixed(2)}</p>
          <Link to="/accounting/sales-ledger">View Ledger →</Link>
        </div>
        <div className="card metric-card">
          <h3>Stock Alerts</h3>
          <p className="metric-value">0</p>
          <Link to="/stock">View Inventory →</Link>
        </div>
      </div>
    </div>
  );
}