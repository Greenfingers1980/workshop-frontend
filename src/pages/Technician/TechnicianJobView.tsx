
import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useJobs } from "../../hooks/useJobs";
import { useTechnician } from "./TechnicianContext";

const TechnicianJobView: React.FC = () => {
  const { id } = useParams();
  const { jobs, updateJob } = useJobs();
  const { activeTimer, startJobTimer, stopJobTimer } = useTechnician();
  const [localNotes, setLocalNotes] = useState("");

  // Safely grab the live job entity from memory
  const job = useMemo(() => {
    return jobs.find((j) => j.id === Number(id));
  }, [jobs, id]);

  // Synchronize local notes state when the job loads
  React.useEffect(() => {
    if (job) {
      setLocalNotes(job.technicianNotes || "");
    }
  }, [job]);

  if (!job) {
    return (
      <div className="studio-content-workbench">
        <header style={{ marginBottom: "1.5rem" }}>
          <h2>Job Not Found</h2>
        </header>
        <p style={{ marginBottom: "1rem" }}>Job #{id} does not exist or has been archived.</p>
        <Link to="/technician" className="btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  const isTimerRunningForThisJob = activeTimer?.isRunning && activeTimer.jobId === job.id;

  // Real-time note synchronization wrapper
  const handleNotesChange = (text: string) => {
    setLocalNotes(text);
    updateJob(job.id, { technicianNotes: text });
  };

  // Safe handler to close out a job and lock labour parameters
  const handleStopTimer = async () => {
    // Passes notes down to trigger the automatic Supabase ledger double-entry sync
    await stopJobTimer(job.id, localNotes);
    alert("Time recorded. Repair status advanced to Quality Control (QC).");
  };

  return (
    <div className="studio-content-workbench">
      {/* 1. Header Block with Status Tags */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid var(--border-studio-line)", paddingBottom: "1rem" }}>
        <div>
          <h2>Repair Ticket #{job.id}</h2>
          <p style={{ color: "var(--text-muted-gold)", fontStyle: "italic" }}>
            {job.watch_make || "Generic Make"} — Caliber {job.caliber_number || "Unspecified"}
          </p>
        </div>
        <span style={{ 
          padding: "0.4rem 0.8rem", 
          background: isTimerRunningForThisJob ? "rgba(205, 162, 85, 0.2)" : "rgba(139, 134, 123, 0.1)",
          border: `1px solid ${isTimerRunningForThisJob ? "var(--accent-gold-burnished)" : "var(--border-studio-line)"}`,
          borderRadius: "4px",
          fontWeight: "bold",
          fontSize: "0.85rem"
        }}>
          {isTimerRunningForThisJob ? "⏱️ ACTIVE ON BENCH" : `STATUS: ${job.status || "In Progress"}`}
        </span>
      </header>

      {/* 2. Main Workbench Interactive Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem" }}>
        
        {/* Left Side: Diagnostics and Documentation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Customer & Description Detail Card */}
          <div style={{ background: "var(--bg-paper-sheet)", padding: "1.5rem", border: "1px dashed var(--border-dashed-grid)", borderRadius: "var(--radius-studio)" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Diagnostics & Customer Intake</h3>
            <p style={{ marginBottom: "0.5rem" }}><strong>Client:</strong> {job.customerName}</p>
            <p style={{ color: "var(--text-deep-charcoal)", lineHeight: "1.5" }}>
              <strong>Fault Description:</strong> {job.description || "No description provided."}
            </p>
          </div>

          {/* Dynamic Workshop Live Timer Panel */}
          <div style={{ background: "var(--bg-paper-sheet)", padding: "1.5rem", border: "1px solid var(--border-studio-line)", borderRadius: "var(--radius-studio)" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Labor Stopwatch</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted-gold)", marginBottom: "1rem" }}>
              Track your exact time spent at the bench to log true profitability and auto-generate ledger expenses.
            </p>
            
            {!isTimerRunningForThisJob ? (
              <button 
                className="btn-primary" 
                onClick={() => startJobTimer(job.id)}
                disabled={activeTimer?.isRunning}
                style={{ opacity: activeTimer?.isRunning ? 0.5 : 1 }}
              >
                ▶ Start Bench Timer
              </button>
            ) : (
              <button 
                className="btn-primary" 
                onClick={handleStopTimer}
                style={{ background: "#8b2c2c", borderColor: "#6b2222", color: "#fff" }}
              >
                ⏹ Stop & Post Labor To Accounting
              </button>
            )}
            {activeTimer?.isRunning && !isTimerRunningForThisJob && (
              <p style={{ color: "#8b2c2c", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                ⚠️ You have another job running. Pause that clock first.
              </p>
            )}
          </div>

          {/* Live Live Technical Notes Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <h3 style={{ fontSize: "1.1rem" }}>Technician Notes (Service History)</h3>
            <textarea
              style={{ minHeight: "150px", resize: "vertical" }}
              placeholder="Record amplitudes, beat errors, replacement parts used, or casing details..."
              value={localNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
            />
          </div>
        </div>

        {/* Right Side: Sidebar Navigation Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ background: "var(--bg-paper-sheet)", padding: "1.5rem", border: "1px solid var(--border-studio-line)", borderRadius: "var(--radius-studio)" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Workbench Options</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link to="/technician" className="btn-primary" style={{ textAlign: "center" }}>
                ‹ Return to Bench Dashboard
              </Link>
              <button 
                className="btn-primary" 
                onClick={() => window.print()}
                style={{ background: "none", color: "var(--text-deep-charcoal)", borderColor: "var(--border-studio-line)", textAlign: "center" }}
              >
                🖨️ Print Job Envelope Tag
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TechnicianJobView;
