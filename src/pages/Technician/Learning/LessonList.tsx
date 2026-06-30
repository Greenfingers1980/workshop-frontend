import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";


// Strong TypeScript shapes mapping out our properties
interface Lesson {
  id: number;
  title: string;
  content: string;
}

interface LessonListProps {
  courseId: number | string;
  onSelectLesson: (lesson: Lesson) => void;
  onBack: () => void;
}

export default function LessonList({
  courseId,
  onSelectLesson,
  onBack,
}: LessonListProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchCourseLessons() {
      try {
        const { data, error } = await supabase
          .from("lessons") // Lowercase relational table name
          .select("id, title, content")
          .eq("course_id", courseId)
          .order("id", { ascending: true }); // Keep chronological layout steps intact

        if (error) throw error;
        setLessons(data || []);
      } catch (err: any) {
        console.error("Administrative Exception: Failed to query lesson rows:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCourseLessons();
  }, [courseId]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#6b5c4a", fontStyle: "italic" }}>
        Assembling instructional logs...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      
      {/* --- BACKWARDS CONTROL LINK CONTROLS --- */}
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <button 
          onClick={onBack} 
          className="small-button" 
          style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}
        >
          ← Back to Course Module Overview
        </button>
      </div>

      <h3 className="section-title" style={{ marginTop: "0.5rem", borderBottom: "1px solid #d2c4a8", paddingBottom: "0.3rem" }}>
        📋 Available Curriculum Chapters
      </h3>

      {/* --- RECONCILED LESSON LIST VIEW --- */}
      {lessons.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#6b5c4a", background: "#fdfbf7", border: "1px dashed #d2c4a8", borderRadius: "6px" }}>
          No written chapters or learning materials have been cataloged for this course target.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => onSelectLesson(lesson)}
              className="job-card" // Inherit card scaling transitions cleanly from your jobs styles
              style={{
                backgroundColor: "#fdfbf7",
                border: "1px solid #d2c4a8",
                padding: "0.85rem 1.25rem",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span style={{ fontSize: "0.95rem", color: "#4a3f35", fontWeight: "600" }}>
                {lesson.title}
              </span>
              
              <span style={{ fontSize: "0.8rem", color: "#9b8b6f", fontWeight: "bold" }}>
                Study Section ➔
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

