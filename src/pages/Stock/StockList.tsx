// src/pages/Dashboard/StockList.tsx
import { useEffect, useState, useMemo, type KeyboardEvent } from "react";
import { getStock, getCategories, initStockSystem } from "../../lib/stock";
import type { StockItem } from "../../lib/stock";
import { 
  Search, 
  Layers, 
  Scan, 
  Plus, 
  AlertTriangle, 
  ShieldAlert, 
  Edit3, 
  Sliders, 
  History, 
  CheckCircle2 
} from "lucide-react";

interface CategoryItem {
  id: number;
  name: string;
  parent?: number | null;
}

interface StockListProps {
  onAddTrigger: () => void;
  onEditTrigger: (id: number) => void;
  onAdjustTrigger: (id: number) => void;
  onHistoryTrigger: () => void;
}

export default function StockList({ 
  onAddTrigger, 
  onEditTrigger, 
  onAdjustTrigger, 
  onHistoryTrigger 
}: StockListProps) {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [barcodeInput, setBarcodeInput] = useState("");

  useEffect(() => {
    initStockSystem();
    refresh();
  }, []);

  function refresh() {
    setStock(getStock());
    setCategories(getCategories() as CategoryItem[]);
  }

  // 1. Memoized Filtering Execution Pipeline
  const filteredStock = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();
    
    return stock.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.sku.toLowerCase().includes(normalizedSearch) ||
        (item.barcode && item.barcode.includes(normalizedSearch));

      const matchesCategory =
        categoryFilter === "all" || item.categoryId === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [stock, search, categoryFilter]);

  // 2. High-Performance Category Hashmap Dictionary Lookup
  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c.name]));
  }, [categories]);

  // 3. Hardware Intercepting Barcode Capture
  function handleBarcodeScan(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault(); // Halt systemic event bubbling
      const code = barcodeInput.trim();
      if (!code) return;

      const found = stock.find((i) => i.barcode === code);
      if (found) {
        alert(`Asset Located: ${found.name} (SKU: ${found.sku})`);
        onEditTrigger(found.id);
      } else {
        alert(`Operational Failure: Barcode sequence "${code}" is missing from system registries.`);
      }

      setBarcodeInput("");
    }
  }

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Title Registry Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Component Registry</h1>
            <p className="text-xs text-slate-400 font-normal">Real-time asset volumes, critical floor limits, and physical telemetry</p>
          </div>
          <button
            onClick={onAddTrigger}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 rounded-xl shadow-lg shadow-sky-600/10 transition text-white"
          >
            <Plus className="w-4 h-4" /> Register Asset
          </button>
        </div>

        {/* Controls Layout Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-slate-900 border border-slate-850 p-4 rounded-2xl shadow-xl">
          
          {/* Main Search */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by catalog descriptor, SKU codes, or barcodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
          </div>

          {/* Group Classification Select */}
          <div className="relative">
            <Layers className="absolute left-3 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-300 appearance-none focus:outline-none focus:border-sky-500 transition cursor-pointer"
            >
              <option value="all">All Group Categories</option>
              {categories
                .filter((c) => !c.parent)
                .map((cat) => (
                  <optgroup key={cat.id} label={cat.name} className="bg-slate-900 text-slate-400 font-sans">
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
          </div>

          {/* Hardware Laser Barcode Node */}
          <div className="relative">
            <Scan className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none animate-pulse" />
            <input
              type="text"
              placeholder="Awaiting Laser Scan..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleBarcodeScan}
              className="w-full bg-slate-950 border border-sky-500/30 rounded-xl pl-9 pr-4 py-2 text-sm text-sky-400 placeholder-sky-700/60 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
          </div>

        </div>

        {/* Main Operational Table Grid Wrapper */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto container-snap">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold tracking-wider uppercase">
                  <th className="p-4">Component Profile Info</th>
                  <th className="p-4">SKU Code</th>
                  <th className="p-4">Classification</th>
                  <th className="p-4 text-center">Volume Matrix Status</th>
                  <th className="p-4 text-right">Floor Min</th>
                  <th className="p-4 text-right">Unit Cost</th>
                  <th className="p-4 text-center">Operational Directives</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {filteredStock.map((item) => {
                  const isStockout = item.quantity <= 0;
                  const isLowStock = !isStockout && item.quantity <= item.minStock;

                  return (
                    <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                      {/* Name Context Row */}
                      <td className="p-4 font-medium text-slate-200 min-w-[180px]">
                        {item.name}
                      </td>

                      {/* SKU Identity Badge */}
                      <td className="p-4 font-mono text-slate-400 whitespace-nowrap">
                        <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-xs">
                          {item.sku}
                        </span>
                      </td>

                      {/* Category Display Group */}
                      <td className="p-4 text-slate-400 whitespace-nowrap">
                        {categoryMap.get(item.categoryId ?? -1) ?? <span className="text-slate-600 italic">Uncategorised</span>}
                      </td>

                      {/* Quantities Status Container */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`w-14 text-center font-mono font-bold px-2 py-0.5 rounded ${
                            isStockout ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                            isLowStock ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {item.quantity}
                          </span>
                          
                          {/* Volumetric Visual Badges */}
                          {isStockout && (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-rose-500">
                              <ShieldAlert className="w-3.5 h-3.5" /> Deactivated
                            </span>
                          )}
                          {isLowStock && (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-500">
                              <AlertTriangle className="w-3.5 h-3.5" /> Replenish
                            </span>
                          )}
                          {!isStockout && !isLowStock && (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-500">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Nominal
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Minimum Boundary Floor Value */}
                      <td className="p-4 text-right font-mono text-slate-400 whitespace-nowrap">
                        {item.minStock}
                      </td>

                      {/* Pure Fiscal Values Column */}
                      <td className="p-4 text-right font-mono font-medium text-slate-300 whitespace-nowrap">
                        £{item.costPrice.toFixed(2)}
                      </td>

                      {/* Administrative Operational Controls */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditTrigger(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750 transition"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => onAdjustTrigger(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition"
                          >
                            <Sliders className="w-3 h-3" /> Delta
                          </button>
                          <button
                            onClick={onHistoryTrigger}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition"
                          >
                            <History className="w-3 h-3" /> Logs
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Empty State Layout Fallback Row */}
                {filteredStock.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <ShieldAlert className="w-8 h-8 text-slate-700" />
                        <p className="text-xs font-medium">No components registered inside the dashboard system matching current parameters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}