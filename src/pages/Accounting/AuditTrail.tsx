import { useMemo, useState } from "react";
import { useAccounting } from "./AccountingContext";
import AccountingMenu from "./AccountingMenu";
import "./Accounting.css";

export default function AuditTrail() {
  const { auditLogs } = useAccounting();
  const [selectedAction, setSelectedAction] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Get unique actions
  const actions = useMemo(() => {
    const acts = new Set<string>();
    acts.add("All");
    for (const log of auditLogs) {
      acts.add(log.action);
    }
    return Array.from(acts).sort();
  }, [auditLogs]);

  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    let filtered = auditLogs;

    if (selectedAction !== "All") {
      filtered = filtered.filter((log) => log.action === selectedAction);
    }

    // Sort by timestamp
    const sorted = [...filtered].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

    return sorted;
  }, [auditLogs, selectedAction, sortOrder]);

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        <AccountingMenu />
        <h1 className="accounting-title">Audit Trail</h1>
        <p className="accounting-subtitle">
          Complete log of all accounting actions — who changed what, when, and why.
        </p>

        <hr className="divider" />

        {/* Filters */}
        <div
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center"
          }}
        >
          <div>
            <label
              htmlFor="action-filter"
              style={{
                fontWeight: "bold",
                marginRight: "0.5rem",
                display: "inline-block"
              }}
            >
              Filter by Action:
            </label>
            <select
              id="action-filter"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: "4px",
                border: "1px solid #9b8b6f",
                backgroundColor: "#fff",
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: "4px",
                border: "1px solid #9b8b6f",
                backgroundColor: "#f7f1e3",
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              {sortOrder === "desc" ? "↓ Newest First" : "↑ Oldest First"}
            </button>
          </div>
        </div>

        {/* Logs Table */}
        {filteredLogs.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "#666",
              background: "#f7f1e3",
              borderRadius: "4px"
            }}
          >
            No audit logs recorded yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              className="ledger-table"
              style={{ width: "100%", tableLayout: "auto" }}
            >
              <thead>
                <tr>
                  <th style={{ minWidth: "180px" }}>Timestamp</th>
                  <th style={{ minWidth: "120px" }}>Action</th>
                  <th style={{ minWidth: "100px" }}>Entity</th>
                  <th style={{ minWidth: "150px" }}>Description</th>
                  <th style={{ minWidth: "250px" }}>Changes</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td style={{ fontSize: "0.85rem", color: "#555" }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: "bold", color: "#2c3e50" }}>
                      {log.action}
                    </td>
                    <td style={{ fontSize: "0.9rem", color: "#666" }}>
                      {log.entity}
                    </td>
                    <td style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>
                      {log.description}
                    </td>
                    <td
                      style={{
                        fontSize: "0.8rem",
                        fontFamily: "monospace",
                        backgroundColor: "#f7f1e3",
                        padding: "0.5rem",
                        borderRadius: "4px"
                      }}
                    >
                      <div style={{ maxHeight: "60px", overflowY: "auto" }}>
                        {Object.entries(log.changes).map(
                          ([field, change]: any, i) => (
                            <div key={i} style={{ marginBottom: "0.3rem" }}>
                              <strong>{field}:</strong>
                              <br />
                              <span style={{ color: "#c0504d" }}>
                                ← {JSON.stringify(change.before).substring(0, 30)}
                              </span>
                              <br />
                              <span style={{ color: "#2ecc71" }}>
                                → {JSON.stringify(change.after).substring(0, 30)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Stats */}
        <div
          style={{
            marginTop: "2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1rem"
          }}
        >
          <div
            style={{
              padding: "1rem",
              background: "#f7f1e3",
              borderRadius: "6px",
              border: "1px solid #d2c4a8"
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                color: "#555",
                marginBottom: "0.3rem"
              }}
            >
              Total Changes
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {auditLogs.length}
            </div>
          </div>

          <div
            style={{
              padding: "1rem",
              background: "#e8dcc8",
              borderRadius: "6px",
              border: "1px solid #9b8b6f"
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                color: "#555",
                marginBottom: "0.3rem"
              }}
            >
              Filtered Results
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {filteredLogs.length}
            </div>
          </div>

          <div
            style={{
              padding: "1rem",
              background: "#d4edda",
              borderRadius: "6px",
              border: "1px solid #c3e6cb"
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                color: "#555",
                marginBottom: "0.3rem"
              }}
            >
              Latest Change
            </div>
            <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
              {auditLogs.length > 0
                ? new Date(auditLogs[0].timestamp).toLocaleTimeString()
                : "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
