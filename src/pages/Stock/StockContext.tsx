import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { StockItem } from "./Stock";

// Strong definition pattern mapping our global context capabilities
interface StockContextValue {
  stockItems: StockItem[];
  loading: boolean;
  criticalAlertsCount: number;
  refreshStockCache: () => Promise<void>;
  consumePartForJob: (partId: string | number, quantityToDeduct: number) => Promise<{ success: boolean; message: string }>;
}

const StockContext = createContext<StockContextValue | undefined>(undefined);

export const StockProvider = ({ children }: { children: React.ReactNode }) => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * 1. CLOUD SYNCHRONIZATION PIPELINE: Polls active database layers into the state cache
   */
  const refreshStockCache = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("parts")
        .select("*")
        .order("part_name", { ascending: true });

      if (error) throw error;

      // Map database snake_case parameters clean onto our application frontend types
      const normalizedPayload: StockItem[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.part_name || row.name,
        sku: row.mpn || row.sku || "",
        quantity: row.stock_level ?? row.quantity ?? 0,
        costPrice: Number(row.cost_price || row.costPrice || 0),
        minStock: row.alert_threshold ?? row.minStock ?? 5
      }));

      setStockItems(normalizedPayload);
    } catch (err) {
      console.error("Critical failure during stock inventory cache synchronization:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 2. ATOMIC CHECKOUT ENGINE: Deducts part quantities safely without data loss risk
   */
  const consumePartForJob = useCallback(async (
    partId: string | number, 
    quantityToDeduct: number
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // Calls the safe Postgres update function we wrote for your Supabase backend editor earlier
      const { data, error } = await supabase.rpc("deduct_part_stock", { 
        target_part_id: partId,
        deduct_qty: quantityToDeduct
      });

      if (error) throw error;

      if (!data) {
        return { success: false, message: "Transaction abort: Insufficient quantity inside inventory vaults." };
      }

      // Smoothly re-poll local values to show updated balances across matching dashboard cards
      await refreshStockCache();
      return { success: true, message: "Inventory deduction successfully locked to database ledgers." };

    } catch (err: any) {
      console.error("Inventory calculation fault triggered:", err);
      return { success: false, message: err.message || "Failed to commit inventory deduction parameters." };
    }
  }, [refreshStockCache]);

  // 3. Performance Aggregator: Linearly track low inventory line counts
  const criticalAlertsCount = useMemo(() => {
    return stockItems.filter(item => item.quantity <= item.minStock).length;
  }, [stockItems]);

  const value = useMemo(() => ({
    stockItems,
    loading,
    criticalAlertsCount,
    refreshStockCache,
    consumePartForJob
  }), [stockItems, loading, criticalAlertsCount, refreshStockCache, consumePartForJob]);

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
};

export const useStock = () => {
  const ctx = useContext(StockContext);
  if (!ctx) {
    throw new Error("Administrative Exception: useStock hook must be called strictly inside a <StockProvider> wrapper.");
  }
  return ctx;
};
