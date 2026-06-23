import React, { createContext, useContext, useState } from "react";

type TechnicianContextValue = {
  technicianName: string;
  setTechnicianName: (name: string) => void;
};

const TechnicianContext = createContext<TechnicianContextValue | undefined>(undefined);

export const TechnicianProvider = ({ children }: { children: React.ReactNode }) => {
  const [technicianName, setTechnicianName] = useState("Technician");

  const value = { technicianName, setTechnicianName };
  return <TechnicianContext.Provider value={value}>{children}</TechnicianContext.Provider>;
};

export const useTechnician = () => {
  const ctx = useContext(TechnicianContext);
  if (!ctx) throw new Error("useTechnician must be used inside <TechnicianProvider>");
  return ctx;
};
