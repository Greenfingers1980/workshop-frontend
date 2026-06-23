import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

// ✅ Define the shape of a course
interface Course {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export default function Courses() {
  // ✅ Explicitly type the state
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      const { data, error } = await supabase
        .from("courses") // ✅ lowercase table name
        .select("id, title, description, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching courses:", error.message);
      } else {
        console.log("Fetched courses:", data);
        setCourses(data || []);
      }
      setLoading(false);
    }

    loadCourses();
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>Available Courses</h2>

      {loading ? (
        <p>Loading courses...</p>
      ) : courses.length === 0 ? (
        <p>No courses found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {courses.map((course) => (
            <li
              key={course.id}
              style={{
                backgroundColor: "rgba(255,255,255,0.9)",
                marginBottom: "0.75rem",
                padding: "1rem",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              <h3 style={{ margin: "0 0 0.5rem 0" }}>{course.title}</h3>
              <p style={{ margin: 0, opacity: 0.8 }}>{course.description}</p>
              <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>
                Added: {new Date(course.created_at).toLocaleDateString()}
              </div>
              {/* ✅ THIS IS THE MISSING LINK */}
  <div style={{ marginTop: "0.5rem" }}>
    <a
      href={`/technician/learning/course/${course.id}`}
      style={{
        display: "inline-block",
        padding: "0.4rem 0.8rem",
        backgroundColor: "#2c3e50",
        color: "white",
        borderRadius: "4px",
        textDecoration: "none",
      }}
    >
      View Course →
    </a>
  </div>
</li>
          
          ))}
        </ul>
      )}
    </div>
  );
}
