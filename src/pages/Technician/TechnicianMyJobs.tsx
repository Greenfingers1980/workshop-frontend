import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useJobs } from "../../hooks/useJobs";
import type { Job } from "../../hooks/useJobs";
import { useTechnician } from "./TechnicianContext";
import { TechnicianTiming } from "./TechnicianTiming";

export const TechnicianMyJobs: React.FC = () => {
  const { jobs } = useJobs();
  const { currentTech } = useTechnician();

  // Pull dynamic tech info from context with a fallback safety name
  const activeTechName = currentTech?.name || "Matthew";
  const activeTechRole = currentTech?.role || "Master Watchmaker";

  // Filter jobs explicitly assigned to this bench technician
  const myJobs = useMemo(() => {
    return jobs.filter((j: Job) => j.assignedTechnician === activeTechName);
  }, [jobs, activeTechName]);

  return (
    <div>
      {/* 1. Profile Status Dashboard Card */}
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h2>My Active Workbench Queue</h2>
          <p style={{ color: "var(--text-muted-gold)", fontSize: "0.95rem" }}>
            Technician: <strong>{activeTechName}</strong> ({activeTechRole})
          </p>
        </div>
        <span style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted-gold)" }}>
          {myJobs.length} Tickets Allocated
        </span>
      </header>

      {/* 2. Job Card Matrix Lists */}
      {myJobs.length === 0 ? (
        <div style={{ padding: "2rem", background: "var(--bg-paper-sheet)", border: "1px dashed var(--border-dashed-grid)", textAlign: "center", borderRadius: "var(--radius-studio)", marginBottom: "2rem" }}>
          <p style={{ fontStyle: "italic", color: "var(--text-muted-gold)" }}>No repair tickets currently allocated to your bench station.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2.5rem" }}>
          {myJobs.map((job: Job) => (
            <div
              key={job.id}
              className="studio-stat-card"
              style={{
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.25rem 1.5rem"
              }}
            >
              <div>
                <label style={{ marginBottom: "0.2rem" }}>Job Reference Ticket #{job.id}</label>
                <h4 style={{ margin: 0, fontSize: "1.15rem" }}>{job.customerName}</h4>
                <p style={{ fontSize: "0.9rem", color: "var(--text-deep-charcoal)", marginTop: "0.4rem", opacity: 0.85, lineHeight: "1.4" }}>
                  {job.description || "Routine strip down, clean, reassemble, and time lubrication pass."}
                </p>
              </div>

              <Link to={`/technician/job/${job.id}`} className="btn-primary">
                Open Workspace ›
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 3. Embedded Diagnostics Section */}
      <section style={{ borderTop: "1px dashed var(--border-dashed-grid)", paddingTop: "2rem" }}>
        <header style={{ marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.25rem" }}>🎛️ Digital Caliper & Timegrapher Bridge</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted-gold)" }}>
            Analyze lift angles, beat errors, and line trace trajectories for active mechanical balance escapements.
          </p>
        </header>

        <div style={{ background: "var(--bg-paper-sheet)", border: "1px solid var(--border-studio-line)", padding: "1.5rem", borderRadius: "var(--radius-studio)" }}>
          <TechnicianTiming onSavePosition={() => {}} />
        </div>
      </section>
    </div>
  );
};

export default TechnicianMyJobs;
