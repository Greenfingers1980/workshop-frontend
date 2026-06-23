import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

interface Lesson {
  id: number;
  title: string;
  content: string;
}

interface LessonListProps {
  courseId: number;
  onSelectLesson: (lesson: Lesson) => void;
  onBack: () => void;
}

export default function LessonList({
  courseId,
  onSelectLesson,
  onBack,
}: LessonListProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLessons() {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, content")
        .eq("course_id", courseId)
        .order("id", { ascending: true });

      if (error) console.error(error.message);
      setLessons(data || []);
      setLoading(false);
    }

    loadLessons();
  }, [courseId]);

  if (loading) return <p>Loading lessons...</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <button onClick={onBack} style={{ marginBottom: "1rem" }}>
        ← Back to Course
      </button>
      <h3>Lessons</h3>
      {lessons.length === 0 ? (
        <p>No lessons found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              style={{
                backgroundColor: "rgba(255,255,255,0.9)",
                marginBottom: "0.5rem",
                padding: "0.75rem",
                borderRadius: "6px",
              }}
              onClick={() => onSelectLesson(lesson)}
            >
              <strong>{lesson.title}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
