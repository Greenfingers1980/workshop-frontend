
import { useMemo, useState } from "react";
import { useAccounting } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";


// Strong definition pattern matching our Supabase schema
interface AuditChange {
  before: any;
  after: any;
}

interface AuditLog {
  timestamp: string;
  action: string;
  entity: string;
  user_email?: string; // Missing critical compliance context variable
  description: string;
  changes: Record<string, AuditChange>;
}

export default function AuditTrail() {
  const { auditLogs } = useAccounting();
  const [selectedAction, setSelectedAction] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // 1. High Performance: Extract unique strings using an efficient linear Set mapping
  const actions = useMemo(() => {
    if (!auditLogs) return ["All"];
    const actionSet = new Set<string>(auditLogs.map((log: AuditLog) => log.action));
    return ["All", ...Array.from(actionSet)].sort();
  }, [auditLogs]);

  // 2. Optimized Filter & Sort mapping pass
  const filteredLogs = useMemo(() => {
    if (!auditLogs) return [];
    
    let result = auditLogs;
    if (selectedAction !== "All") {
      result = result.filter((log: AuditLog) => log.action === selectedAction);
    }

    return [...result].sort((a: AuditLog, b: AuditLog) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });
  }, [auditLogs, selectedAction, sortOrder]);

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        <h1 className="accounting-title">Audit Trail</h1>
        <p className="accounting-subtitle">
          Complete compliance ledger mapping structural adjustments, inventory deductions, and balance shifts.
        </p>

        <hr className="divider" />

        {/* Action Toolbars */}
        <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <label htmlFor="action-filter" style={{ fontWeight: "bold", marginRight: "0.5rem" }}>
              Filter Action:
            </label>
            <select
              id="action-filter"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              style={{ padding: "0.4rem 0.8rem", borderRadius: "4px", border: "1px solid #c8b79a", fontFamily: "inherit" }}
            >
              {actions.map((act) => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>

          <button
            className="small-button"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            style={{ padding: "0.45rem 0.8rem" }}
          >
            {sortOrder === "desc" ? "↓ Newest First" : "↑ Oldest First"}
          </button>
        </div>

        {/* Main Records Presentation Grid */}
        {filteredLogs.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#6b5c4a", background: "#e9ddc7", borderRadius: "4px" }}>
            No matching audit events recorded in database parameters.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Technician/User</th>
                  <th>Target Entity</th>
                  <th>Description</th>
                  <th>Value Changes Grid (Before / After)</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log: AuditLog, idx) => (
                  <tr key={idx}>
                    <td style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                      {new Date(log.timestamp).toLocaleString("en-GB")}
                    </td>
                    <td><span className="badge-action"><strong>{log.action}</strong></span></td>
                    <td style={{ color: "#4a3f35", fontStyle: "italic" }}>
                      {log.user_email || "System Auto-Process"}
                    </td>
                    <td><code>{log.entity}</code></td>
                    <td style={{ fontSize: "0.85rem" }}>{log.description}</td>
                    <td>
                      <div style={{ maxHeight: "80px", overflowY: "auto", fontSize: "0.75rem", fontFamily: "monospace" }}>
                        {log.changes && Object.entries(log.changes).map(([field, change], i) => (
                          <div key={i} style={{ marginBottom: "0.4rem", borderBottom: "1px dashed #d2c4a8" }}>
                            <span style={{ color: "#7a1f1f" }}><strong>{field}:</strong></span>
                            <div style={{ color: "#a24a4a" }}>⁃ Old: {JSON.stringify(change.before)}</div>
                            <div style={{ color: "#2e6f40" }}>✚ New: {JSON.stringify(change.after)}</div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Operational Analytics Metrics Widgets */}
        <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1rem", background: "#fdfbf7", borderRadius: "6px", border: "1px solid #d2c4a8" }}>
            <span style={{ fontSize: "0.8rem", color: "#6b5c4a" }}>Total Ledger Events</span>
            <div style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#4a3f35" }}>{auditLogs.length}</div>
          </div>
          <div style={{ padding: "1rem", background: "#fdfbf7", borderRadius: "6px", border: "1px solid #d2c4a8" }}>
            <span style={{ fontSize: "0.8rem", color: "#6b5c4a" }}>Matching Filter Rules</span>
            <div style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#4a3f35" }}>{filteredLogs.length}</div>
          </div>
          <div style={{ padding: "1rem", background: "#e9ddc7", borderRadius: "6px", border: "1px solid #d2c4a8" }}>
            <span style={{ fontSize: "0.8rem", color: "#6b5c4a" }}>Latest Structural Change</span>
            <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#4a3f35", marginTop: "0.4rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {auditLogs.length > 0 ? `${auditLogs[0].action} (${auditLogs[0].entity})` : "None"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
