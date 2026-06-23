import React, { createContext, useContext, useState } from "react";

type StockContextValue = {
  stockCount: number;
  setStockCount: (count: number) => void;
};

const StockContext = createContext<StockContextValue | undefined>(undefined);

export const StockProvider = ({ children }: { children: React.ReactNode }) => {
  const [stockCount, setStockCount] = useState(0);

  const value = { stockCount, setStockCount };
  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
};

export const useStock = () => {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error("useStock must be used inside <StockProvider>");
  return ctx;
};
