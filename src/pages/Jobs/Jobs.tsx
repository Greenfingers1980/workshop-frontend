import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useJobs } from "../../hooks/useJobs"; // Hook location from your directory tree


// Reinforced typed shape mapping for repair tickets
interface RepairJob {
  id: string | number;
  clockMake?: string;
  clockModel?: string;
  watchMake?: string; // Fallbacks accommodating both clock and watch entry variations
  watchModel?: string;
  customerName: string;
  status: string;
  conditionPhotos?: string[];
}

export default function Jobs() {
  // 1. Safe Global Synchronization: Load real-time workshop tickets directly from the context engine
  const { jobs } = useJobs() as { jobs: RepairJob[] };

  /**
   * WORKFLOW AUTOMATION MATRIX: Maps verbal phases to your custom status badge classes
   */
  const resolveBadgeStatus = (statusString: string): string => {
    const status = (statusString || "").toLowerCase();
    if (status.includes("part") || status.includes("order")) return "parts";
    if (status.includes("qc") || status.includes("check") || status.includes("complete")) return "qc";
    if (status.includes("bench") || status.includes("progress") || status.includes("repair")) return "bench";
    return "intake"; // Default fallback visual state wrapper
  };

  // Memoize ticket listings sorting by chronological ID placement values to keep views stable
  const compiledJobsList = useMemo(() => {
    if (!jobs || !Array.isArray(jobs)) return [];
    return [...jobs].sort((a, b) => String(b.id).localeCompare(String(a.id)));
  }, [jobs]);

  return (
    <div className="jobs-page">
      {/* HEADER CONTROLS DOCK */}
      <div className="parchment-card jobs-header" style={{ padding: "1.5rem" }}>
        <div>
          <h1 className="accounting-title" style={{ margin: 0 }}>Workshop Repair Tickets</h1>
          <p className="accounting-subtitle" style={{ margin: "0.25rem 0 0 0" }}>
            Review, filter, and track active, pending, and completed timepiece overhauls.
          </p>
        </div>

        <Link className="ledger-button active" to="/jobs/new" style={{ padding: "0.6rem 1.5rem" }}>
          ✚ Initialize New Ticket
        </Link>
      </div>

      {/* COMPACT INTERACTIVE REPAIR CARD GRID */}
      <div className="jobs-grid">
        {compiledJobsList.length === 0 ? (
          <div className="parchment-card" style={{ gridColumn: "1 / -1", padding: "3rem", textAlign: "center", color: "#6b5c4a" }}>
            🍃 Excellent! The workshop queue is currently entirely clear. Click above to check in a timepiece.
          </div>
        ) : (
          compiledJobsList.map((job) => {
            // Accommodate alternative naming properties cleanly
            const manufacturer = job.watchMake || job.clockMake || "Unknown Make";
            const designVariant = job.watchModel || job.clockModel || "Caliber Variant";
            const badgeClass = resolveBadgeStatus(job.status);

            return (
              <Link 
                to={`/jobs/view/${job.id}`} 
                key={job.id} 
                className="job-card parchment-card"
                style={{ padding: "1.25rem" }}
              >
                {/* CARD TOP LINE */}
                <div className="job-card-header">
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#9b8b6f", display: "block" }}>TICKET REFERENCE</span>
                    <strong style={{ fontSize: "1.1rem", color: "#4a3f35" }}># {job.id}</strong>
                  </div>
                  
                  {/* Dynamic Status Engine Badge */}
                  <span className={`job-status-badge ${badgeClass}`}>
                    ● {job.status}
                  </span>
                </div>

                <hr className="divider" style={{ margin: "0.5rem 0" }} />

                {/* MATERIAL DETAILS SPECIFICATION */}
                <div>
                  <h3 className="job-title">{manufacturer}</h3>
                  <span style={{ fontSize: "0.85rem", color: "#6b5c4a", display: "block", marginTop: "0.15rem" }}>
                    {designVariant}
                  </span>
                </div>

                <div style={{ fontSize: "0.85rem", color: "#4a3f35", marginTop: "0.25rem" }}>
                  <strong>Client Link:</strong> {job.customerName || "Walk-in Consignment"}
                </div>

                {/* OPTICAL PREVIEW THUMBNAIL SWITCH CASE */}
                {job.conditionPhotos?.[0] ? (
                  <img
                    src={job.conditionPhotos[0]}
                    alt={`${manufacturer} Diagnostic Intake`}
                    className="job-thumb"
                  />
                ) : (
                  <div className="job-thumb-placeholder">
                    <span>🔎 No Intake Photo Linked</span>
                    <span style={{ fontSize: "0.7rem", opacity: 0.75 }}>Awaiting technician upload</span>
                  </div>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}