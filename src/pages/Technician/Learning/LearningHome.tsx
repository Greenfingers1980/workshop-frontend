import React from "react";
import { Link } from "react-router-dom";


const LearningHome: React.FC = () => {
  return (
    <div className="accounting-container">
      <div className="parchment-card" style={{ maxWidth: "750px", margin: "0 auto" }}>
        
        {/* --- HUB NAVIGATION GREETING BANNER --- */}
        <div style={{ marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "0.8rem", color: "#9b8b6f", fontWeight: "bold", letterSpacing: "0.05em" }}>HOROLOGICAL ACADEMY</span>
          <h1 className="accounting-title" style={{ margin: 0, fontSize: "2.25rem" }}>Technician Learning Centre</h1>
          <p className="accounting-subtitle" style={{ marginTop: "0.2rem" }}>
            Refine your skillset, log mandatory training periods, and review your certification progress tracking charts.
          </p>
        </div>

        <hr className="divider" />

        {/* --- GRID LAYOUT DISTRIBUTION LAYER --- */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginTop: "1rem" }}>
          
          {/* LINK CARD 1: COURSES */}
          <div style={{ background: "#fdfbf7", border: "1px solid #d2c4a8", padding: "1.25rem", borderRadius: "6px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <h3 className="job-title" style={{ margin: 0, fontSize: "1.15rem" }}>📚 Training Registry</h3>
              <p style={{ margin: "0.3rem 0 0 0", fontSize: "0.85rem", color: "#6b5c4a", lineHeight: "1.4" }}>
                Browse available accreditation courses covering water-resistance testing, hairspring manipulation, and lubrication schedules.
              </p>
            </div>
            <Link to="/technician/learning/courses" className="ledger-button active" style={{ display: "block", textAlign: "center", fontSize: "0.85rem", padding: "0.5rem" }}>
              Explore Courses →
            </Link>
          </div>

          {/* LINK CARD 2: SCHEDULE */}
          <div style={{ background: "#fdfbf7", border: "1px solid #d2c4a8", padding: "1.25rem", borderRadius: "6px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <h3 className="job-title" style={{ margin: 0, fontSize: "1.15rem" }}>📅 Study Schedule</h3>
              <p style={{ margin: "0.3rem 0 0 0", fontSize: "0.85rem", color: "#6b5c4a", lineHeight: "1.4" }}>
                Organize your continuing clock/watchmaker study hours and plan upcoming quiz review targets around your active bench tasks.
              </p>
            </div>
            <Link to="/technician/learning/schedule" className="ledger-button" style={{ display: "block", textAlign: "center", fontSize: "0.85rem", padding: "0.5rem" }}>
              Open Schedule →
            </Link>
          </div>

          {/* LINK CARD 3: PROGRESS */}
          <div style={{ background: "#fdfbf7", border: "1px solid #d2c4a8", padding: "1.25rem", borderRadius: "6px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <h3 className="job-title" style={{ margin: 0, fontSize: "1.15rem" }}>📈 Progress Tracker</h3>
              <p style={{ margin: "0.3rem 0 0 0", fontSize: "0.85rem", color: "#6b5c4a", lineHeight: "1.4" }}>
                Inspect your verified workshop test grades, passed quiz milestones, and download official laboratory certification receipts.
              </p>
            </div>
            <Link to="/technician/learning/progress" className="ledger-button" style={{ display: "block", textAlign: "center", fontSize: "0.85rem", padding: "0.5rem" }}>
              View Progress →
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LearningHome;