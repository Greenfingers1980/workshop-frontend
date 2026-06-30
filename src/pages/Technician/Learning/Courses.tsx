import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Import single-page routing engine
import { supabase } from "../../../lib/supabaseClient";


// Define explicit schema typing structures matching Supabase records
interface Course {
  id: number | string;
  title: string;
  description: string;
  created_at: string;
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchTechnicalCourses() {
      try {
        const { data, error } = await supabase
          .from("courses") // Lowercase table targets
          .select("id, title, description, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCourses(data || []);
      } catch (err: any) {
        console.error("Administrative Exception: Failed to poll learning modules:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTechnicalCourses();
  }, []);

  return (
    <div className="accounting-container">
      <div className="parchment-card">
        
        {/* --- LEARNING MANAGEMENT PORTAL HEADER DOCK --- */}
        <div>
          <span style={{ fontSize: "0.8rem", color: "#9b8b6f", fontWeight: "bold", letterSpacing: "0.05em" }}>HOROLOGICAL ACADEMY</span>
          <h1 className="accounting-title" style={{ margin: 0, fontSize: "2.25rem" }}>Available Training Modules</h1>
          <p className="accounting-subtitle" style={{ marginTop: "0.2rem" }}>
            Review, master, and log technical accreditation courses targeting complex escapement calibrations and lubrication standards.
          </p>
        </div>

        <hr className="divider" />

        {/* --- COURSES EXPLORATION SHEET --- */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#6b5c4a" }}>Querying workshop education catalogs...</div>
        ) : courses.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#6b5c4a", border: "2px dashed #d2c4a8", borderRadius: "6px", background: "#fdfbf7" }}>
            🍃 No certification courses have been published to this station queue yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            {courses.map((course) => (
              <div
                key={course.id}
                style={{
                  background: "#fdfbf7",
                  border: "1px solid #d2c4a8",
                  padding: "1.25rem",
                  borderRadius: "6px",
                  boxShadow: "0 2px 5px rgba(74, 63, 53, 0.05)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "2rem"
                }}
              >
                {/* COURSE DETAILS DESCRIPTIONS */}
                <div style={{ flex: 1, minWidth: "0" }}>
                  <h3 className="job-title" style={{ fontSize: "1.25rem", margin: 0 }}>{course.title}</h3>
                  <p style={{ margin: "0.4rem 0 0.5rem 0", color: "#555", fontSize: "0.9rem", lineHeight: "1.4" }}>
                    {course.description}
                  </p>
                  <div style={{ fontSize: "0.75rem", color: "#9b8b6f", fontWeight: "bold" }}>
                    🗓️ INTAKE RECORD ADDED: {new Date(course.created_at).toLocaleDateString("en-GB")}
                  </div>
                </div>

                {/* SINGLE PAGE INTERACTIVE TRANSITION INTERFACE ROUTER */}
                <div style={{ flex: "0 0 auto" }}>
                  <Link
                    to={`/technician/learning/course/${course.id}`} // Correct single-page parameter passing paths
                    className="ledger-button active"
                    style={{ padding: "0.55rem 1.25rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}
                  >
                    View Course Modules →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}