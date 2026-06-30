import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import AccountingMenu from "../Accounting/AccountingMenu";
import StockItemEditor from "./StockItemEditor"; // Clean isolated subcomponent path


export interface StockItem {
  id: string | number; // String/UUID ready for Supabase integration keys
  name: string;
  sku: string;
  quantity: number;
  costPrice: number;
  minStock: number;
  history?: any[];
}

export default function Stock() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  // 1. Live Sync: Pull parts inventory directly out of PostgreSQL tables
  const fetchStockInventory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("parts")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      
      // Map database schema fields (e.g. stock_level -> quantity) smoothly onto our types
      const normalizedData = (data || []).map((row: any) => ({
        id: row.id,
        name: row.part_name || row.name,
        sku: row.mpn || row.sku || "",
        quantity: row.stock_level ?? row.quantity ?? 0,
        costPrice: Number(row.cost_price || row.costPrice || 0),
        minStock: row.alert_threshold ?? row.minStock ?? 5
      }));
      
      setStock(normalizedData);
    } catch (err) {
      console.error("Failed to sync parts ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockInventory();
  }, []);

  // 2. Compute critical inventory depletion alerts linearly
  const criticalAlertsCount = useMemo(() => {
    return stock.filter(item => item.quantity <= item.minStock).length;
  }, [stock]);

  const handleOpenNewItemForm = () => {
    setEditingItem({
      id: 0, // 0 triggers insert branches inside your database managers
      name: "",
      sku: "",
      quantity: 0,
      costPrice: 0,
      minStock: 5
    });
    setShowEditor(true);
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
          <div>
            <h1 className="accounting-title">Material Stock Inventory</h1>
            <p className="accounting-subtitle">Monitor workshop material assets, tracking generic springs, gaskets, and wheels.</p>
          </div>
          
          {/* Active Inventory Alert Banner */}
          {criticalAlertsCount > 0 && (
            <div style={{ padding: "0.5rem 1rem", background: "#fff5f5", border: "1px solid #c27a7a", borderRadius: "4px", fontSize: "0.85rem", color: "#7a1f1f", fontWeight: "bold" }}>
              ⚠️ {criticalAlertsCount} Component Lines Low
            </div>
          )}
        </div>

        <hr className="divider" />

        {/* --- MANAGEMENT CONTROLS --- */}
        <div className="form-actions" style={{ marginBottom: "1.25rem" }}>
          <button onClick={handleOpenNewItemForm} className="ledger-button active" style={{ padding: "0.55rem 1.5rem" }} disabled={loading}>
            ✚ Register New Material Line
          </button>
        </div>

        {/* --- PARTS DATABASE DISCOVERY GRID --- */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#6b5c4a" }}>Querying workshop stock vaults...</div>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th style={{ width: "35%" }}>Component / Material Description</th>
                <th style={{ width: "20%" }}>SKU / MPN Code</th>
                <th style={{ width: "12%", textAlign: "center" }}>Vault Qty</th>
                <th style={{ width: "13%", textAlign: "center" }}>Min Limit</th>
                <th style={{ width: "15%", textAlign: "right" }}>Cost Price</th>
                <th style={{ width: "5%" }}></th>
              </tr>
            </thead>
            <tbody>
              {stock.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "#6b5c4a", padding: "1.5rem" }}>No material assets currently categorized.</td></tr>
              ) : (
                stock.map((item) => {
                  const isDepleted = item.quantity <= item.minStock;
                  return (
                    <tr key={item.id} style={{ backgroundColor: isDepleted ? "#fffdf5" : "transparent" }}>
                      <td>
                        <strong>{item.name}</strong>
                        {isDepleted && <span style={{ display: "block", fontSize: "0.7rem", color: "#bca380", fontWeight: "bold" }}>⚠️ REORDER OPTION CRITICAL</span>}
                      </td>
                      <td><code style={{ fontSize: "0.85rem" }}>{item.sku || "—"}</code></td>
                      <td style={{ textAlign: "center", fontWeight: "bold", color: item.quantity === 0 ? "#7a1f1f" : "inherit" }}>
                        {item.quantity}
                      </td>
                      <td style={{ textAlign: "center", color: "#9b8b6f", fontSize: "0.85rem" }}>{item.minStock}</td>
                      <td style={{ textAlign: "right", fontWeight: "bold" }}>£{item.costPrice.toFixed(2)}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="small-button"
                          onClick={() => {
                            setEditingItem(item);
                            setShowEditor(true);
                          }}
                        >
                          ⚙️ Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* --- FLOATING OVERLAY MODAL FORM HOOKS --- */}
{showEditor && editingItem && (
  <StockItemEditor 
    itemId={Number(editingItem.id)} 
    onClose={() => {
      setShowEditor(false);
      setEditingItem(null);
      fetchStockInventory(); // Refresh list after closing
    }} 
  />
)}
    </div>
  );
}
