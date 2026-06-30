import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";


interface Lesson {
  id: string;
  course_id: string;
  title: string;
  summary: string;
  learning_objectives: string[];
  content: string;
}

const LessonView: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessonsInCourse, setLessonsInCourse] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFullLessonData = async () => {
      if (!lessonId) return;
      setLoading(true);

      try {
        // 1. Direct Row Fetch targeting current lesson step parameters
        const { data: current, error: lessonError } = await supabase
          .from("lessons")
          .select("*")
          .eq("id", lessonId)
          .single();

        if (lessonError || !current) throw lessonError || new Error("Lesson row null");
        setLesson(current);

        // 2. Linear Course Step Query building navigation structures
        const { data: allLessons, error: courseError } = await supabase
          .from("lessons")
          .select("*")
          .eq("course_id", current.course_id)
          .order("id", { ascending: true }); // Restores standard sequence indexing

        if (!courseError) {
          setLessonsInCourse(allLessons || []);
        }
      } catch (err) {
        console.error("Administrative Exception: Failed to load lesson framework layers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFullLessonData();
  }, [lessonId]);

  // 3. Memoize chronological positioning offsets to protect render runtimes
  const navigation = useMemo(() => {
    if (!lesson || lessonsInCourse.length === 0) return { prev: null, next: null };
    
    const currentIndex = lessonsInCourse.findIndex((l) => String(l.id) === String(lesson.id));
    return {
      prev: currentIndex > 0 ? lessonsInCourse[currentIndex - 1] : null,
      next: currentIndex < lessonsInCourse.length - 1 ? lessonsInCourse[currentIndex + 1] : null
    };
  }, [lesson, lessonsInCourse]);

  if (loading) {
    return (
      <div className="accounting-container">
        <div className="parchment-card" style={{ textAlign: "center", padding: "3rem", color: "#6b5c4a", fontStyle: "italic" }}>
          Unrolling curriculum blueprints...
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="accounting-container">
        <div className="parchment-card" style={{ textAlign: "center", padding: "3rem" }}>
          <h2>⚠️ Curriculum Section Missing</h2>
          <p style={{ margin: "1rem 0" }}>The specified study chapter reference is unavailable or has been archived.</p>
          <Link to="/technician/learning/courses" className="ledger-button active">Return to Academy</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="accounting-container">
      <div className="parchment-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* --- MAIN HEADER TEXT NAVIGATION SECTION --- */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#9b8b6f", fontWeight: "bold", letterSpacing: "0.05em" }}>CHAPTER SUBVIEW</span>
            <h1 className="accounting-title" style={{ fontSize: "2.25rem", margin: 0 }}>{lesson.title}</h1>
          </div>
          <Link to={`/technician/learning/course/${lesson.course_id}`} className="small-button" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}>
            📋 Course Index
          </Link>
        </div>

        <hr className="divider" style={{ marginTop: "1rem" }} />

        {/* --- BRIEF SUMMARY STRIP --- */}
        {lesson.summary && (
          <div style={{ padding: "1rem", background: "#fdfbf7", borderLeft: "4px solid #bca380", borderRadius: "0 6px 6px 0", marginBottom: "1.5rem", fontStyle: "italic", color: "#4a3f35", lineHeight: "1.4" }}>
            {lesson.summary}
          </div>
        )}

        {/* --- GOLD-RIMMED ACCREDITATION OBJECTIVES CHECKLIST --- */}
        {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
          <div style={{ background: "#fcfaf4", border: "1px solid #e1d4ba", padding: "1.25rem", borderRadius: "6px", marginBottom: "2rem" }}>
            <h3 className="section-title" style={{ marginTop: 0, fontSize: "1rem", color: "#6b5c4a", textTransform: "uppercase", letterSpacing: "0.05em" }}>🎯 Core Technical Objectives</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0 0", display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.9rem", color: "#4a3f35" }}>
              {lesson.learning_objectives.map((obj, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <span style={{ color: "#bca380" }}>✔</span> <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* --- INSTRUCTIONAL SCHEMATIC CONTENT CONTAINER --- */}
        <h3 className="section-title" style={{ fontSize: "1.1rem" }}>📖 Lesson Documentation</h3>
        <div 
          style={{ 
            whiteSpace: "pre-line", 
            lineHeight: "1.6", 
            color: "#333", 
            fontFamily: "Georgia, serif", 
            fontSize: "1.05rem",
            padding: "0.5rem 0"
          }}
        >
          {lesson.content}
        </div>

        <hr className="divider" style={{ marginTop: "2rem" }} />

        {/* --- SINGLE PAGE STEP ACCELERATOR NAVIGATION BUTTONS --- */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
          <div>
            {navigation.prev ? (
              <Link to={`/technician/learning/lesson/${navigation.prev.id}`} className="ledger-button" style={{ padding: "0.55rem 1.25rem", fontSize: "0.85rem" }}>
                ← Previous Section
              </Link>
            ) : (
              <span style={{ color: "#9b8b6f", fontSize: "0.85rem", fontStyle: "italic" }}>Start of course module.</span>
            )}
          </div>

          <div>
            {navigation.next ? (
              <Link to={`/technician/learning/lesson/${navigation.next.id}`} className="ledger-button active" style={{ padding: "0.55rem 1.5rem", fontSize: "0.85rem" }}>
                Next Section →
              </Link>
            ) : (
              <span style={{ color: "#2e6f40", fontWeight: "bold", fontSize: "0.85rem" }}>🎉 Final Chapter Reached</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LessonView;