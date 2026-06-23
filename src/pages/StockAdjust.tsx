import { useEffect, useState } from "react";
import { getStock, adjustStock } from "../lib/stock";
import type { StockItem } from "../lib/stock";

export default function StockAdjust({ itemId, onClose }: any) {
  const [item, setItem] = useState<StockItem | null>(null);
  const [qtyChange, setQtyChange] = useState(0);
  const [note, setNote] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");

  useEffect(() => {
    const stock = getStock();
    const found = stock.find((s) => s.id === itemId);
    if (found) setItem(found);
  }, [itemId]);

  if (!item) return null;

  // ⭐ Tell TypeScript item is definitely not null now
  const safeItem = item!;

  function handleBarcodeScan(e: any) {
    if (e.key === "Enter") {
      const code = barcodeInput.trim();

      if ((safeItem as any).barcode && code === (safeItem as any).barcode) {
        alert(`Barcode matched: ${safeItem.name}`);
      } else {
        alert("Barcode does not match this item");
      }

      setBarcodeInput("");
    }
  }

  function save() {
    if (qtyChange === 0) {
      alert("Quantity change cannot be zero");
      return;
    }

    adjustStock(safeItem.id, qtyChange, note);

    alert("Stock adjusted");
    onClose();
  }

  return (
    <div
      style={{
        background: "white",
        padding: "1.5rem",
        borderRadius: "8px",
        width: "450px",
        maxWidth: "95%",
        margin: "2rem auto",
        boxShadow: "0 0 12px rgba(0,0,0,0.2)"
      }}
    >
      <h2>Adjust Stock</h2>
      <p>
        <strong>Item:</strong> {safeItem.name}
      </p>
      <p>
        <strong>Current Qty:</strong> {safeItem.quantity}
      </p>

      {/* QUANTITY CHANGE */}
      <label style={{ display: "block", marginTop: "1rem" }}>
        Quantity Change (use negative to remove)
        <input
          type="number"
          value={qtyChange}
          onChange={(e) => setQtyChange(Number(e.target.value))}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            marginTop: "0.3rem"
          }}
        />
      </label>

      {/* BARCODE SCAN */}
      <label style={{ display: "block", marginTop: "1rem" }}>
        Scan Barcode (optional)
        <input
          type="text"
          placeholder="Scan barcode..."
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          onKeyDown={handleBarcodeScan}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            marginTop: "0.3rem"
          }}
        />
      </label>

      {/* NOTE */}
      <label style={{ display: "block", marginTop: "1rem" }}>
        Note (optional)
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{
            width: "100%",
            minHeight: "80px",
            padding: "0.5rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            marginTop: "0.3rem"
          }}
        />
      </label>

      {/* BUTTONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.5rem",
          marginTop: "1.5rem"
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "none",
            background: "#ccc",
            cursor: "pointer"
          }}
        >
          Cancel
        </button>

        <button
          onClick={save}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "none",
            background: "#8a6f3d",
            color: "white",
            cursor: "pointer"
          }}
        >
          Save Adjustment
        </button>
      </div>
    </div>
  );
}
