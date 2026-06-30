// src/components/StockItemEditor.tsx
import { useEffect, useState } from "react";
import {
  getCategories,
  getStock,
  addStockItem,
  updateStockItem,
  generateSKU,
  generateBarcode
} from "../../lib/stock";
import type { StockItem } from "../../lib/stock";
import { 
  Package, 
  QrCode, 
  Barcode, 
  FolderPlus, 
  Truck, 
  MapPin, 
  Calendar, 
  FileText,
  X,
  Save
} from "lucide-react";

// Explicit structural typing interfaces
interface CategoryItem {
  id: number;
  name: string;
  parent?: number | null;
}

type Props = {
  itemId?: number; 
  onClose: () => void;
};

export default function StockItemEditor({ itemId, onClose }: Props) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [form, setForm] = useState<Partial<StockItem>>({
    name: "",
    sku: "",
    barcode: "",
    quantity: 0,
    minStock: 0,
    costPrice: 0,
    supplier: "",
    supplierContact: "",
    location: "",
    purchaseDate: "",
    expiryDate: "",
    notes: ""
  });

  useEffect(() => {
    // Cast module resolution cleanly into type-safe domains
    setCategories(getCategories() as CategoryItem[]);

    if (itemId) {
      const stock = getStock();
      const found = stock.find((s) => s.id === itemId);
      if (found) setForm(found);
    }
  }, [itemId]);

  function updateField<K extends keyof StockItem>(key: K, value: StockItem[K]) {
    setIsDirty(true);
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));
  }

  function handleGenerateSKU() {
    const name = form.name ?? "";
    if (!name.trim()) {
      return;
    }
    updateField("sku", generateSKU(name));
  }

  function handleGenerateBarcode() {
    updateField("barcode", generateBarcode());
  }

  function handleCancelGuard() {
    if (isDirty) {
      const confirmDiscard = window.confirm("You have unsaved changes. Are you sure you want to exit?");
      if (!confirmDiscard) return;
    }
    onClose();
  }

  function handleSave() {
    const name = form.name ?? "";
    const sku = form.sku ?? "";

    if (!name.trim() || !sku.trim()) return;

    const base: Omit<StockItem, "id"> = {
      name,
      sku,
      barcode: form.barcode ?? "",
      categoryId: form.categoryId,
      quantity: form.quantity ?? 0,
      minStock: form.minStock ?? 0,
      costPrice: form.costPrice ?? 0,
      supplier: form.supplier ?? "",
      supplierContact: form.supplierContact ?? "",
      location: form.location ?? "",
      purchaseDate: form.purchaseDate ?? "",
      expiryDate: form.expiryDate ?? "",
      notes: form.notes ?? "",
      history: form.history ?? []
    };

    if (itemId) {
      updateStockItem({ ...base, id: itemId });
    } else {
      addStockItem(base);
    }

    onClose();
  }

  const isInvalid = !form.name?.trim() || !form.sku?.trim();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full mx-auto shadow-2xl overflow-hidden text-slate-100 font-sans">
      
      {/* Header Guard Banner */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-lg">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">{itemId ? "Modify Registry Entry" : "Register New Stock Asset"}</h2>
            <p className="text-[11px] text-slate-400">Ensure all operational metrics map precisely to physical parts</p>
          </div>
        </div>
        <button 
          onClick={handleCancelGuard}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Context Layout */}
      <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto container-snap">
        
        {/* Section 1: Basic Telemetry */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-1">Core Identifiers</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs text-slate-400 font-medium mb-1.5">Asset Component Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                placeholder="e.g., M8 High-Tensile Flanged Bolt"
                value={form.name ?? ""}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
              />
            </div>

            <div className="md:col-span-1.5">
              <label className="block text-xs text-slate-400 font-medium mb-1.5">SKU String <span className="text-rose-500">*</span></label>
              <div className="relative flex rounded-xl overflow-hidden border border-slate-800 focus-within:border-sky-500 transition">
                <input
                  type="text"
                  placeholder="AUTO-GEN-SKU"
                  value={form.sku ?? ""}
                  onChange={(e) => updateField("sku", e.target.value)}
                  className="w-full bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"
                />
                <button 
                  onClick={handleGenerateSKU}
                  disabled={!form.name?.trim()}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed px-3 text-xs font-medium border-l border-slate-800 transition whitespace-nowrap flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5" /> Generate
                </button>
              </div>
            </div>

            <div className="md:col-span-1.5">
              <label className="block text-xs text-slate-400 font-medium mb-1.5">Universal Barcode</label>
              <div className="relative flex rounded-xl overflow-hidden border border-slate-800 focus-within:border-sky-500 transition">
                <input
                  type="text"
                  placeholder="No barcode allocated"
                  value={form.barcode ?? ""}
                  onChange={(e) => updateField("barcode", e.target.value)}
                  className="w-full bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"
                />
                <button 
                  onClick={handleGenerateBarcode}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 px-3 text-xs font-medium border-l border-slate-800 transition whitespace-nowrap flex items-center gap-1"
                >
                  <Barcode className="w-3.5 h-3.5" /> Stamp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Ledger Classification & Quantities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-1">Grouping Taxonomy</h3>
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1.5">System Category Assignation</label>
              <div className="relative">
                <select
                  value={form.categoryId ?? ""}
                  onChange={(e) => updateField("categoryId", e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 appearance-none focus:outline-none focus:border-sky-500 transition cursor-pointer"
                >
                  <option value="">Uncategorised Asset Line</option>
                  {categories
                    .filter((c) => !c.parent)
                    .map((cat) => (
                      <optgroup key={cat.id} label={cat.name} className="bg-slate-900 text-slate-300 font-sans">
                        {categories
                          .filter((c) => c.parent === cat.id)
                          .map((sub) => (
                            <option key={sub.id} value={sub.id} className="text-slate-200">
                              {sub.name}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                </select>
                <FolderPlus className="absolute right-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-1">Volumetric Telemetry</h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">On Hand</label>
                <input
                  type="number"
                  value={form.quantity ?? 0}
                  onChange={(e) => updateField("quantity", Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono text-center focus:outline-none focus:border-sky-500 transition"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Floor Limit</label>
                <input
                  type="number"
                  value={form.minStock ?? 0}
                  onChange={(e) => updateField("minStock", Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono text-center focus:outline-none focus:border-sky-500 transition"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Unit Cost (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.costPrice ?? 0}
                  onChange={(e) => updateField("costPrice", Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono text-center focus:outline-none focus:border-sky-500 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Logistics & Sourcing Chain */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-1">Supply Infrastructure & Logistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1">
                <Truck className="w-3 h-3 text-slate-500" /> Supplier Corporation
              </label>
              <input
                type="text"
                placeholder="Vendor designation"
                value={form.supplier ?? ""}
                onChange={(e) => updateField("supplier", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1.5">Supplier Communications Channel</label>
              <input
                type="text"
                placeholder="Email or point of contact phone"
                value={form.supplierContact ?? ""}
                onChange={(e) => updateField("supplierContact", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" /> Facility Bay Location
              </label>
              <input
                type="text"
                placeholder="e.g., Row G / Shelf 4"
                value={form.location ?? ""}
                onChange={(e) => updateField("location", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Lifecycle Timestamps & Manual Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" /> Procurement Date
            </label>
            <input
              type="date"
              value={form.purchaseDate ?? ""}
              onChange={(e) => updateField("purchaseDate", e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sky-500 transition [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" /> Shelf Life Expiry
            </label>
            <input
              type="date"
              value={form.expiryDate ?? ""}
              onChange={(e) => updateField("expiryDate", e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sky-500 transition [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-500" /> Miscellaneous Operational Logs
            </label>
            <textarea
              placeholder="Record any calibration or modification anomalies here..."
              value={form.notes ?? ""}
              onChange={(e) => updateField("notes", e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-sky-500 transition min-h-[38px] max-h-[120px]"
            />
          </div>
        </div>

      </div>

      {/* Footer Controls Layout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-3">
        <button 
          onClick={handleCancelGuard}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850 transition"
        >
          Discard
        </button>
        <button
          onClick={handleSave}
          disabled={isInvalid}
          className="px-5 py-2 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white flex items-center gap-1.5 shadow-lg shadow-sky-600/10 transition"
        >
          <Save className="w-3.5 h-3.5" /> {itemId ? "Commit Overwrite" : "Initialize Asset"}
        </button>
      </div>

    </div>
  );
}