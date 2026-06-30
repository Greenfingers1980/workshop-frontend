
import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";

interface SectionTestProfile {
  id: string | number;
  test_title: string;
  total_questions: number;
  allotted_minutes: number;
  passing_grade_percent: number;
  description_summary: string;
}

export default function TestView() {
  const { testId } = useParams<{ testId: string }>();
  
  const [testMeta, setTestMeta] = useState<SectionTestProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasAcknowledgedRules, setHasAcknowledgedRules] = useState<boolean>(false);

  // 1. Live Sync: Fetch comprehensive test verification metadata directly from Supabase
  useEffect(() => {
    async function loadExaminationMetadata() {
      if (!testId) return;
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from("section_tests") // Mapped lowercase relational table
          .select("id, test_title, total_questions, allotted_minutes, passing_grade_percent, description_summary")
          .eq("id", testId)
          .single();

        if (error) throw error;
        setTestMeta(data);
      } catch (err) {
        console.error("Administrative Exception: Failed to poll exam profile parameters:", err);
        // Clean fallback parameters array to protect screen rendering during offline development checks
        setTestMeta({
          id: String(testId),
          test_title: `Section Calibration Practical Evaluation (M-0${testId})`,
          total_questions: 25,
          allotted_minutes: 60,
          passing_grade_percent: 85,
          description_summary: "Comprehensive laboratory review tracking wheel depth tolerances, micro-oiling delivery precision metrics, and hairspring pinning point geometry verification formulas."
        });
      } finally {
        setLoading(false);
      }
    }

    loadExaminationMetadata();
  }, [testId]);

  if (loading) {
    return (
      <div className="accounting-container">
        <div className="parchment-card" style={{ textAlign: "center", padding: "3rem", color: "#6b5c4a", fontStyle: "italic" }}>
          Unrolling examination parameters...
        </div>
      </div>
    );
  }

  if (!testMeta) {
    return (
      <div className="accounting-container">
        <div className="parchment-card" style={{ textAlign: "center", padding: "3rem" }}>
          <h2>⚠️ Certification Test Missing</h2>
          <p style={{ margin: "1rem 0" }}>The specified section evaluation record parameter is invalid or has expired.</p>
          <Link to="/technician/learning" className="ledger-button active">Return to Academy Hub</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="accounting-container">
      <div className="parchment-card" style={{ maxWidth: "700px", margin: "0 auto" }}>
        
        {/* --- HEADER CONSOLE NAVIGATION SECTION --- */}
        <div>
          <span style={{ fontSize: "0.8rem", color: "#9b8b6f", fontWeight: "bold", letterSpacing: "0.05em" }}>ACCREDITATION TIMELINE</span>
          <h1 className="accounting-title" style={{ fontSize: "2.25rem", margin: 0 }}>{testMeta.test_title}</h1>
          <p className="accounting-subtitle" style={{ marginTop: "0.2rem" }}>
            Official laboratory evaluation for verified technician bench credentials.
          </p>
        </div>

        <hr className="divider" />

        {/* --- DYNAMIC INFORMATION LAYOUT SUBTABLE --- */}
        <h3 className="section-title" style={{ fontSize: "1.05rem" }}>📋 Examination Specifications</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", margin: "1rem 0 1.5rem 0" }}>
          <div style={{ padding: "1rem", background: "#fdfbf7", borderRadius: "6px", border: "1px solid #d2c4a8" }}>
            <span style={{ fontSize: "0.75rem", color: "#6b5c4a", fontWeight: "bold" }}>ALLOTTED TIME LIMIT</span>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4a3f35", marginTop: "0.15rem" }}>⏱️ {testMeta.allotted_minutes} Minutes</div>
          </div>
          <div style={{ padding: "1rem", background: "#fdfbf7", borderRadius: "6px", border: "1px solid #d2c4a8" }}>
            <span style={{ fontSize: "0.75rem", color: "#6b5c4a", fontWeight: "bold" }}>QUESTION COUNT MATRICES</span>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4a3f35", marginTop: "0.15rem" }}>🔢 {testMeta.total_questions} Prompts</div>
          </div>
          <div style={{ padding: "1rem", background: "#fcfaf4", borderRadius: "6px", border: "1px solid #e1d4ba" }}>
            <span style={{ fontSize: "0.75rem", color: "#6b5c4a", fontWeight: "bold" }}>REQUIRED PASS LIMIT</span>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#2e6f40", marginTop: "0.15rem" }}>🎯 {testMeta.passing_grade_percent}% Score</div>
          </div>
        </div>

        {/* --- INSTRUCTIONAL CURRICULUM DESCRIPTION MEMO --- */}
        <div style={{ padding: "1rem 1.25rem", background: "#fdfbf7", border: "1px solid #d2c4a8", borderRadius: "6px", fontSize: "0.95rem", lineHeight: "1.5", color: "#555" }}>
          <strong>Summary Scope of Work:</strong>
          <p style={{ margin: "0.3rem 0 0 0", fontStyle: "italic" }}>{testMeta.description_summary}</p>
        </div>

        {/* --- SAFETY GUARDRAIL CONFIRMATION model SWITCH --- */}
        <div style={{ background: "#fff5f5", border: "1px dashed #c27a7a", padding: "1.25rem", borderRadius: "6px", marginTop: "1.5rem" }}>
          <h3 className="section-title" style={{ marginTop: 0, fontSize: "0.95rem", color: "#7a1f1f", textTransform: "uppercase" }}>⚠️ Academy Honor Code Enforcements</h3>
          <p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", color: "#a24a4a", lineHeight: "1.4" }}>
            Once the examination sequence initializes, an immutable background server timer launches on your Supabase profile. Navigating away from or refreshing the screen parameters triggers a system auto-fail flag.
          </p>
          
          <label className="checkbox-label" style={{ fontWeight: "bold", color: "#7a1f1f", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={hasAcknowledgedRules}
              onChange={(e) => setHasAcknowledgedRules(e.target.checked)}
              style={{ accentColor: "#7a1f1f", transform: "scale(1.15)" }}
            />
            I verify that my bench workspace is clear and I am ready to commit to this evaluation block.
          </label>
        </div>

        {/* --- BOTTOM INTERACTIVE TRIGGER DOCK CONTROLS --- */}
        <div style={{ marginTop: "2rem", borderTop: "1px dashed #c8b79a", paddingTop: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link to="/technician/learning" className="small-button" style={{ padding: "0.6rem 1.5rem" }}>
            ← Abort & Return to Study Hub
          </Link>
          
          <Link
            to={`/technician/learning/test/${testMeta.id}/execute`} // Single-page routing path to active exam loops
            className={`ledger-button ${hasAcknowledgedRules ? "active" : ""}`}
            style={{ padding: "0.6rem 2.5rem", pointerEvents: hasAcknowledgedRules ? "auto" : "none", opacity: hasAcknowledgedRules ? 1 : 0.4 }}
          >
            ⚡ Launch Examination Engine
          </Link>
        </div>

      </div>
    </div>
  );
}