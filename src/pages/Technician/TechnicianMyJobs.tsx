// src/pages/Technician/TechnicianMyJobs.tsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useJobs } from "../../hooks/useJobs";
import type { Job } from "../../hooks/useJobs";
import { TechnicianTiming } from "./TechnicianTiming"

export const TechnicianMyJobs: React.FC = () => {
  const { jobs } = useJobs();

  // ✅ Fixed technician identity — always Matthew
  const technicianName = "Matthew";

  // ✅ Filter jobs assigned to Matthew
  const myJobs = useMemo(() => {
    return jobs.filter((j: Job) => j.assignedTechnician === technicianName);
  }, [jobs]);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>My Jobs</h2>
      <p>Technician: {technicianName}</p>

      {myJobs.length === 0 && <p>No jobs assigned to you.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {myJobs.map((job: Job) => (
          <li
            key={job.id}
            style={{
              padding: "10px",
              marginBottom: "10px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "#fafafa",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>Job #{job.id}</strong> — {job.customerName}
              <br />
              <span style={{ fontSize: "0.9rem", color: "#555" }}>
                {job.description}
              </span>
            </div>

            <Link
              to={`/technician/job/${job.id}`}
              style={{
                padding: "6px 12px",
                background: "#333",
                color: "white",
                borderRadius: "4px",
                textDecoration: "none",
              }}
            >
              Open
            </Link>
          </li>
        ))}
      </ul>

      {/* ✅ Embedded Timegrapher below job list */}
      <div style={{ marginTop: "2rem" }}>
        <h3>Timegrapher</h3>
        <TechnicianTiming onSavePosition={() => {}} />

      </div>
    </div>
  );
};

export default TechnicianMyJobs;
