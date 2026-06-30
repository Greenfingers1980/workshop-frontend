import React, { useEffect, useState } from "react";
import { getStock, adjustStock } from "../../lib/stock";
import type { StockItem } from "../../lib/stock";
import { Package, Barcode, Clipboard, X, Check } from "lucide-react";

interface StockAdjustProps {
  itemId: string | number;
  onClose: () => void;
}

export default function StockAdjust({ itemId, onClose }: StockAdjustProps) {
  const [item, setItem] = useState<StockItem | null>(null);
  const [qtyChange, setQtyChange] = useState<number>(0);
  const [note, setNote] = useState<string>("");
  const [barcodeInput, setBarcodeInput] = useState<string>("");
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const stock = getStock();
    const found = stock.find((s) => s.id === itemId);
    if (found) {
      setItem(found);
    }
  }, [itemId]);

  function showNotification(message: string, isError = false) {
    setFeedback({ message, isError });
    setTimeout(() => setFeedback(null), 4000);
  }

  function handleBarcodeScan(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const code = barcodeInput.trim();

      if (item?.barcode && code === item.barcode) {
        showNotification(`Barcode matched verified asset: ${item.name}`);
      } else {
        showNotification("Barcode scan mismatch.", true);
      }
      setBarcodeInput("");
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (qtyChange === 0) {
      showNotification("Quantity variance delta cannot be zero.", true);
      return;
    }

    try {
      if (item) {
        adjustStock(item.id, qtyChange, note.trim());
        onClose();
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error occurred:", err.message);
        setFormError(err.message);
      } else {
        console.error("An unexpected error occurred:", err);
        setFormError("An unexpected error occurred.");
      }
    }
  }

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        
        {/* Header Block */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Adjust Inventory Registry</h2>
              <p className="text-xs text-slate-400">Log physical stock delta modifications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 text-slate-500 hover:text-slate-300 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Asset Overview */}
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-400">
          <p className="flex justify-between">
            <span>Component Identity:</span>
            <span className="font-semibold text-slate-200">{item.name}</span>
          </p>
          <p className="flex justify-between">
            <span>Current Running Stock:</span>
            <span className="font-mono font-medium text-sky-400 bg-sky-500/5 px-2 py-0.5 border border-sky-500/10 rounded">
              {item.quantity} units
            </span>
          </p>
        </div>

        {/* Interactive Entry Fields */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Quantity Variance Delta</label>
            <input
              type="number"
              value={qtyChange}
              onChange={(e) => setQtyChange(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Scan Verification Barcode</label>
            <div className="relative">
              <Barcode className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeScan}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Feedback/Error messages */}
          {(feedback || formError) && (
            <div className={`text-xs p-3 rounded-xl border ${feedback?.isError || formError ? "bg-rose-950/20 border-rose-900/40 text-rose-400" : "bg-emerald-950/20 border-emerald-900/40 text-emerald-400"}`}>
              {feedback?.message || formError}
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-850">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition">Dismiss</button>
            <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs rounded-xl shadow-lg transition">
              <Check className="w-3.5 h-3.5" /> Commit Log Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}