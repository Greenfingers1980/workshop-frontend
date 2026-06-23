// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";

type Lesson = {
  id: string;
  course_id: string;
  title: string;
  summary: string;
  learning_objectives: string[];
  content: string;
};

const LessonView: React.FC = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessonsInCourse, setLessonsInCourse] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLesson = async () => {
      // Load the current lesson
      const { data: current, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

      if (error) {
        console.error("Error loading lesson:", error);
        setLoading(false);
        return;
      }

      setLesson(current);

      // Load all lessons in this course
      const { data: allLessons } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", current.course_id)
        .order("created_at", { ascending: true });

      setLessonsInCourse(allLessons || []);
      setLoading(false);
    };

    loadLesson();
  }, [lessonId]);

  if (loading) return <p>Loading lesson…</p>;
  if (!lesson) return <p>Lesson not found.</p>;

  // Determine previous/next lesson based on index in array
  const index = lessonsInCourse.findIndex((l) => l.id === lesson.id);
  const prevLesson = index > 0 ? lessonsInCourse[index - 1] : null;
  const nextLesson =
    index < lessonsInCourse.length - 1 ? lessonsInCourse[index + 1] : null;

  return (
    <div>
      <h2>{lesson.title}</h2>

      {/* Summary */}
      {lesson.summary && (
        <>
          <h3>Summary</h3>
          <p>{lesson.summary}</p>
        </>
      )}

      {/* Learning Objectives */}
      {lesson.learning_objectives?.length > 0 && (
        <>
          <h3>Learning Objectives</h3>
          <ul>
            {lesson.learning_objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </>
      )}

      {/* Lesson Content */}
      <h3>Lesson Content</h3>
      <p style={{ whiteSpace: "pre-line" }}>{lesson.content}</p>

      <hr />

      {/* Navigation */}
      <div style={{ display: "flex", gap: "1rem" }}>
        {prevLesson && (
          <Link to={`/technician/learning/lesson/${prevLesson.id}`}>
            ← Previous Lesson
          </Link>
        )}

        {nextLesson && (
          <Link to={`/technician/learning/lesson/${nextLesson.id}`}>
            Next Lesson →
          </Link>
        )}
      </div>

      <p style={{ marginTop: "1rem" }}>
        <Link to={`/technician/learning/course/${lesson.course_id}`}>
          Back to Course
        </Link>
      </p>
    </div>
  );
};

export default LessonView;
