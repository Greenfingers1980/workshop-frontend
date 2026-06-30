// src/pages/Dashboard/StockDashboard.tsx
import { useEffect, useState, useMemo } from "react";
import type { StockItem } from "../../lib/stock";
import { getStock } from "../../lib/stock";
import { 
  BarChart3, 
  AlertCircle, 
  TrendingUp, 
  History, 
  PlusCircle, 
  Archive,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function StockDashboard() {
  const [stock, setStock] = useState<StockItem[]>([]);

  useEffect(() => {
    setStock(getStock());
  }, []);

  // 1. Memoized Calculations Matrix
  const dashboardStats = useMemo(() => {
    const low = stock.filter((s) => s.quantity > 0 && s.quantity <= 5);
    const out = stock.filter((s) => s.quantity === 0);
    
    const totalValue = stock.reduce(
      (sum, item) => sum + (item.quantity * (item.costPrice || 0)), 
      0
    );

    // Sort clones cleanly without mutating baseline state array lengths
    const recentAdditions = [...stock]
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, 5);

    const recentUsage = [...stock]
      .filter((s) => s.history && s.history.length > 0)
      .sort((a, b) => {
        const lastA = a.history ? new Date(a.history[a.history.length - 1].date).getTime() : 0;
        const lastB = b.history ? new Date(b.history[b.history.length - 1].date).getTime() : 0;
        return lastB - lastA;
      })
      .slice(0, 5);

    return {
      lowStock: low,
      outOfStock: out,
      totalValue,
      recentlyAdded: recentAdditions,
      recentlyUsed: recentUsage
    };
  }, [stock]);

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Title Block */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Telemetry Dashboard</h1>
            <p className="text-xs text-slate-400">Real-time inventory valuations and systemic alerts</p>
          </div>
        </div>

        {/* Operational Status Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Items</h3>
              <Archive className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-200">{stock.length}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Valuation Ledger</h3>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-400">£{dashboardStats.totalValue.toFixed(2)}</p>
          </div>

          <div className={`bg-slate-900 border rounded-2xl p-4 shadow-xl transition-colors ${
            dashboardStats.lowStock.length > 0 ? "border-amber-500/30 bg-amber-950/5" : "border-slate-800"
          }`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${dashboardStats.lowStock.length > 0 ? "text-amber-400" : "text-slate-500"}`}>Low Stock</h3>
              <AlertCircle className={`w-4 h-4 ${dashboardStats.lowStock.length > 0 ? "text-amber-400" : "text-slate-500"}`} />
            </div>
            <p className={`text-2xl font-bold font-mono ${dashboardStats.lowStock.length > 0 ? "text-amber-400" : "text-slate-200"}`}>
              {dashboardStats.lowStock.length}
            </p>
          </div>

          <div className={`bg-slate-900 border rounded-2xl p-4 shadow-xl transition-colors ${
            dashboardStats.outOfStock.length > 0 ? "border-rose-500/30 bg-rose-950/5" : "border-slate-800"
          }`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${dashboardStats.outOfStock.length > 0 ? "text-rose-400" : "text-slate-500"}`}>Depleted Stock</h3>
              <AlertCircle className={`w-4 h-4 ${dashboardStats.outOfStock.length > 0 ? "text-rose-400" : "text-slate-500"}`} />
            </div>
            <p className={`text-2xl font-bold font-mono ${dashboardStats.outOfStock.length > 0 ? "text-rose-400" : "text-slate-200"}`}>
              {dashboardStats.outOfStock.length}
            </p>
          </div>
        </div>

        {/* Dynamic Warning Alert Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Low Inventory Threshold (≤ 5 Units)
            </h2>
            {dashboardStats.lowStock.length === 0 ? (
              <p className="text-xs italic text-slate-600 py-2">No critical variance metrics logged.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-medium">
                      <th className="pb-2">Asset Name</th>
                      <th className="pb-2">SKU / Identifier</th>
                      <th className="pb-2 text-right">Available Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {dashboardStats.lowStock.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-950/40">
                        <td className="py-2.5 font-medium text-slate-200">{item.name}</td>
                        <td className="py-2.5 font-mono text-slate-500">{item.sku}</td>
                        <td className="py-2.5 text-right font-mono font-semibold text-amber-400">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Fully Depleted Components
            </h2>
            {dashboardStats.outOfStock.length === 0 ? (
              <p className="text-xs italic text-slate-600 py-2">All component lines have active stock tracking allocations.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-medium">
                      <th className="pb-2">Asset Name</th>
                      <th className="pb-2">SKU / Identifier</th>
                      <th className="pb-2 text-right">Procurement Unit Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {dashboardStats.outOfStock.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-950/40">
                        <td className="py-2.5 font-medium text-slate-200">{item.name}</td>
                        <td className="py-2.5 font-mono text-slate-500">{item.sku}</td>
                        <td className="py-2.5 text-right font-mono text-slate-400">£{item.costPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Timeline Log Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-sky-400" /> New Ledger Registers
            </h2>
            {dashboardStats.recentlyAdded.length === 0 ? (
              <p className="text-xs italic text-slate-600 py-2">No new lines registered.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-medium">
                      <th className="pb-2">Asset Name</th>
                      <th className="pb-2">SKU</th>
                      <th className="pb-2 text-right">Inbound Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {dashboardStats.recentlyAdded.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-950/40">
                        <td className="py-2.5 font-medium text-slate-200">{item.name}</td>
                        <td className="py-2.5 font-mono text-slate-500">{item.sku}</td>
                        <td className="py-2.5 text-right font-mono text-slate-400">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <History className="w-4 h-4 text-violet-400" /> Activity Modification Log
            </h2>
            {dashboardStats.recentlyUsed.length === 0 ? (
              <p className="text-xs italic text-slate-600 py-2">No transaction mutations tracked.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-medium">
                      <th className="pb-2">Asset Name</th>
                      <th className="pb-2">Timestamp</th>
                      <th className="pb-2 text-right">Delta Vol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {dashboardStats.recentlyUsed.map((item) => {
                      const lastEntry = item.history![item.history!.length - 1];
                      const isPositive = lastEntry.qty > 0;
                      return (
                        <tr key={item.id} className="hover:bg-slate-950/40">
                          <td className="py-2.5 font-medium text-slate-200">{item.name}</td>
                          <td className="py-2.5 font-mono text-slate-500">
                            {new Date(lastEntry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-2.5 text-right font-mono">
                            <span className={`inline-flex items-center gap-0.5 font-semibold ${
                              isPositive ? "text-emerald-400" : "text-rose-400"
                            }`}>
                              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {isPositive ? `+${lastEntry.qty}` : lastEntry.qty}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}