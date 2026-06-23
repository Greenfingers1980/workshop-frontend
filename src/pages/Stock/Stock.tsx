import React, { useState, useEffect } from "react";
import {
  getStock,
  saveStock,
  addStockItem,
  updateStockItem,
  adjustStock,
} from "../../lib/stock";

import type { StockItem } from "../../lib/stock";

export default function Stock() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  useEffect(() => {
    setStock(getStock());
  }, []);

  function handleSave(item: StockItem) {
    if (item.id === 0) {
      item.id = Date.now();
      addStockItem(item);
    } else {
      updateStockItem(item);
    }
    setStock(getStock());
    setShowEditor(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Stock</h1>

      <button
        onClick={() => {
          setEditingItem({
            id: 0,
            name: "",
            sku: "",
            quantity: 0,
            costPrice: 0,
              minStock: 0,
            history: [],
          });
          setShowEditor(true);
        }}
      >
        + Add Stock Item
      </button>

      <table style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Qty</th>
            <th>Cost</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {stock.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.sku}</td>
              <td>{item.quantity}</td>
              <td>£{item.costPrice.toFixed(2)}</td>
              <td>
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setShowEditor(true);
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showEditor && editingItem && (
        <StockEditor item={editingItem} onSave={handleSave} onClose={() => setShowEditor(false)} />
      )}
    </div>
  );
}

function StockEditor({
  item,
  onSave,
  onClose,
}: {
  item: StockItem;
  onSave: (i: StockItem) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(item);

  function update<K extends keyof StockItem>(key: K, value: StockItem[K]) {
    setDraft({ ...draft, [key]: value });
  }

  return (
    <div style={{ padding: 20, background: "#eee", marginTop: 20 }}>
      <h2>{draft.id === 0 ? "Add Stock Item" : "Edit Stock Item"}</h2>

      <label>Name</label>
      <input value={draft.name} onChange={(e) => update("name", e.target.value)} />

      <label>SKU</label>
      <input value={draft.sku} onChange={(e) => update("sku", e.target.value)} />

      <label>Quantity</label>
      <input
        type="number"
        value={draft.quantity}
        onChange={(e) => update("quantity", Number(e.target.value))}
      />

      <label>Cost Price</label>
      <input
        type="number"
        value={draft.costPrice}
        onChange={(e) => update("costPrice", Number(e.target.value))}
      />

      <div style={{ marginTop: 20 }}>
        <button onClick={() => onSave(draft)}>Save</button>
        <button onClick={onClose} style={{ marginLeft: 10 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
