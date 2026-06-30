import { useState, useEffect } from "react";

export interface Job {
  id: number;
 customerId: number | null;
  customerName: string;      
  description?: string;
  salesPrice?: number; // ADDED
  technician?: string; // ADDED  
  // Clock details
  clockMake: string;
  clockModel: string;
  clockSerial: string;
  clockAge: string;
  watch_make: string;
  watch_model?: string;
  caliber_number?: string;

  // Condition & service
  conditionNotes: string;
  serviceRequested: string;

  // Technician workflow
  status: string;
  assignedTechnician?: string;
  technicianNotes: string;

  // Photos
  conditionPhotos?: string[];
  movementPhotos?: string[];

  // Timing results
  timingResults?: {
    position: string;
    rateSecondsPerDay: number | null;
    beatErrorMs: number | null;
  }[];

  // Calendar scheduling
  scheduledStart?: string;

  // Time tracking
  timeTracking?: {
    isRunning: boolean;
    startTime: number | null;
    totalSeconds: number;
  };

  // Parts & time
  partsUsed: any[];
  timeSpent: any[];

  createdAt: string;
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);

  // Load jobs from localStorage on startup
  useEffect(() => {
    const raw = localStorage.getItem("jobs");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setJobs(parsed);
      } catch (err) {
        console.error("Failed to parse jobs from localStorage:", err);
      }
    }
  }, []);

  // Save jobs to localStorage
  const saveJobs = (next: Job[]) => {
    setJobs(next);
    localStorage.setItem("jobs", JSON.stringify(next));
  };

  // Update a single job by ID
  const updateJob = (id: number, patch: Partial<Job>) => {
    const updated = jobs.map(job =>
      job.id === id ? { ...job, ...patch } : job
    );
    saveJobs(updated);
  };

  // Add a new job with auto ID and timestamp
  const addJob = (job: Omit<Job, "id" | "createdAt">) => {
    const nextJob: Job = {
      ...job,
      id: jobs.length > 0 ? Math.max(...jobs.map(j => j.id)) + 1 : 1,
      createdAt: new Date().toISOString(),
    };
    const next = [...jobs, nextJob];
    saveJobs(next);
  };

  return { jobs, updateJob, addJob };
}
