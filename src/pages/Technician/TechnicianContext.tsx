import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

// 1. Structured definition for a real workshop technician
export type TechUser = {
  id: string;
  name: string;
  role: 'Junior' | 'Senior' | 'Master Watchmaker';
  hourly_rate: number;
};

// 2. Active timer state tracking for the bench stopwatch
export type ActiveTimer = {
  jobId: number;
  startTime: number; // Unix timestamp
  isRunning: boolean;
};

type TechnicianContextValue = {
  currentTech: TechUser | null;
  setCurrentTech: (tech: TechUser | null) => void;
  activeTimer: ActiveTimer | null;
  startJobTimer: (jobId: number) => void;
  stopJobTimer: (jobId: number, technicianNotes: string) => Promise<void>;
  isLoading: boolean;
};

const TechnicianContext = createContext<TechnicianContextValue | undefined>(undefined);

export const TechnicianProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTech, setCurrentTech] = useState<TechUser | null>(null);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback default user for offline/initial building
  useEffect(() => {
    setCurrentTech({
      id: "tech-01",
      name: "Alex Mercer",
      role: "Master Watchmaker",
      hourly_rate: 45.00
    });
    setIsLoading(false);
  }, []);

  // 3. Start timing a repair job
  const startJobTimer = (jobId: number) => {
    setActiveTimer({
      jobId,
      startTime: Date.now(),
      isRunning: true
    });
  };

  // 4. Stop timing and log labour/notes directly to Supabase
  const stopJobTimer = async (jobId: number, technicianNotes: string) => {
    if (!activeTimer || activeTimer.jobId !== jobId) return;

    const elapsedSeconds = Math.round((Date.now() - activeTimer.startTime) / 1000);
    const elapsedHours = elapsedSeconds / 3600;
    const computedLabourCost = Math.round((elapsedHours * (currentTech?.hourly_rate || 0)) * 100) / 100;

    try {
      // Update job record directly with notes and elapsed calculations
      const { error: jobError } = await supabase
        .from("jobs")
        .update({
          status: "QC", // Automatically push to Quality Control stage
          technician_notes: technicianNotes,
          assigned_technician: currentTech?.name
        })
        .eq("id", jobId);

      if (jobError) throw jobError;

      // Proactive Accounting Trigger: Log calculated labour to the double-entry table
      if (computedLabourCost > 0) {
        const { data: journal, error: journalError } = await supabase
          .from("journal_entries")
          .insert({
            description: `Labour allocated to Job #${jobId} by ${currentTech?.name}`,
            reference: `JOB-${jobId}-LABOUR`
          })
          .select()
          .single();

        if (journalError) throw journalError;

        await supabase.from("journal_lines").insert([
          {
            journal_entry_id: journal.id,
            account_id: 5, // Custom account ID map (e.g., Cost of Goods Sold - Labour Expense)
            debit: computedLabourCost,
            department: "Watch Studio",
            job_id: jobId
          },
          {
            journal_entry_id: journal.id,
            account_id: 6, // Custom account ID map (e.g., Accrued Labour Liabilities)
            credit: computedLabourCost,
            department: "Watch Studio",
            job_id: jobId
          }
        ]);
      }

      // Reset local stopwatch state
      setActiveTimer(null);
    } catch (err) {
      console.error("Failed to commit timer closure to Supabase:", err);
    }
  };

  const value = { 
    currentTech, 
    setCurrentTech, 
    activeTimer, 
    startJobTimer, 
    stopJobTimer, 
    isLoading 
  };

  return <TechnicianContext.Provider value={value}>{children}</TechnicianContext.Provider>;
};

export const useTechnician = () => {
  const ctx = useContext(TechnicianContext);
  if (!ctx) throw new Error("useTechnician must be used inside <TechnicianProvider>");
  return ctx;
};