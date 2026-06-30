import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";


interface StudyTask {
  id: string | number;
  task_title: string;
  duration_minutes: number;
  completed: boolean;
  category: "Lesson" | "Quiz" | "Revision";
}

export default function StudySchedule() {
  const [schedule, setSchedule] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // 1. Live Sync: Fetch the current technician's personalized weekly 3-5 hour learning plan
  const fetchWeeklySchedule = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) {
        // Fallback placeholder dataset if user session is not actively authenticated
        setSchedule([
          { id: 1, task_title: "Lesson: Gear Train Depth Theory Basics", duration_minutes: 60, completed: false, category: "Lesson" },
          { id: 2, task_title: "Quiz: Escapement Calculations & Ratios", duration_minutes: 45, completed: false, category: "Quiz" },
          { id: 3, task_title: "Revision: Balance Spring Hairspring Principles", duration_minutes: 90, completed: true, category: "Revision" }
        ]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("technician_schedules")
        .select("id, task_title, duration_minutes, completed, category")
        .eq("technician_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setSchedule(data || []);
    } catch (err) {
      console.error("Failed to sync study schedule cards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklySchedule();
  }, []);

  // 2. Compute Live Cumulative Allocated Time Variables
  const totalAllocatedHours = useMemo(() => {
    const totalMinutes = schedule.reduce((sum, item) => sum + item.duration_minutes, 0);
    return (totalMinutes / 60).toFixed(1);
  }, [schedule]);

  /**
   * ACTION: Toggle task completion status row values inside Supabase
   */
  const handleToggleTaskComplete = async (taskId: string | number, currentStatus: boolean) => {
    setIsUpdating(true);
    // Immediate optimistic local UI transition update
    setSchedule(prev => prev.map(t => t.id === taskId ? { ...t, completed: !currentStatus } : t));

    try {
      const { error } = await supabase
        .from("technician_schedules")
        .update({ completed: !currentStatus })
        .eq("id", taskId);

      if (error) throw error;
    } catch (err) {
      console.error("Failed to commit schedule completion shift:", err);
      // Revert status on failure
      setSchedule(prev => prev.map(t => t.id === taskId ? { ...t, completed: currentStatus } : t));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="accounting-container">
      <div className="parchment-card" style={{ maxWidth: "700px", margin: "0 auto" }}>
        
        {/* --- HEADER CONTROLS DOCK --- */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#9b8b6f", fontWeight: "bold", letterSpacing: "0.05em" }}>CURRICULUM PLANNER</span>
            <h1 className="accounting-title" style={{ fontSize: "2.25rem", margin: 0 }}>Weekly Study Schedule</h1>
            <p className="accounting-subtitle" style={{ marginTop: "0.2rem" }}>
              Personalized study blocks structured around your active bench repair workload allocations.
            </p>
          </div>
          <Link to="/technician/learning" className="small-button" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}>
            🏠 Academy Hub
          </Link>
        </div>

        <hr className="divider" />

        {/* --- ALLOCATED METRICS BANNER --- */}
        <div style={{ background: "#fdfbf7", border: "1px solid #d2c4a8", padding: "1rem", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "0.9rem", color: "#4a3f35" }}>
            ⏱️ <strong>Target Allocation:</strong> Standard 3–5 Hour Weekly Curricular Window
          </span>
          <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#6b5c4a", background: "#e9ddc7", padding: "0.25rem 0.75rem", borderRadius: "4px" }}>
            {totalAllocatedHours} Hours Assigned
          </span>
        </div>

        {/* --- INTERACTIVE TASK LIST DISPLAY LAYOUT --- */}
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#6b5c4a", fontStyle: "italic" }}>Compiling active timeline tracks...</div>
        ) : schedule.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#6b5c4a", border: "2px dashed #d2c4a8", background: "#fdfbf7", borderRadius: "6px" }}>
            🍃 Clear schedule parameters. No curriculum items assigned for the current week.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {schedule.map((task) => (
              <div
                key={task.id}
                style={{
                  background: task.completed ? "#f8f6f0" : "#ffffff",
                  border: "1px solid #d2c4a8",
                  padding: "1rem 1.25rem",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: task.completed ? 0.7 : 1,
                  transition: "opacity 0.2s ease"
                }}
              >
                {/* CHECKBOX AND TEXT PAIRING */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: "0" }}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    disabled={isUpdating}
                    onChange={() => handleToggleTaskComplete(task.id, task.completed)}
                    style={{ transform: "scale(1.2)", cursor: "pointer", accentColor: "#4a3f35" }}
                  />
                  
                  <div style={{ minWidth: "0" }}>
                    <span style={{ 
                      fontSize: "0.95rem", 
                      color: "#4a3f35", 
                      fontWeight: "bold",
                      textDecoration: task.completed ? "line-through" : "none" 
                    }}>
                      {task.task_title}
                    </span>
                    
                    {/* Tiny category metadata badge */}
                    <span 
                      className={`job-status-badge ${task.category === "Quiz" ? "parts" : task.category === "Lesson" ? "bench" : "intake"}`}
                      style={{ marginLeft: "0.75rem", fontSize: "0.65rem", padding: "0.1rem 0.4rem" }}
                    >
                      {task.category}
                    </span>
                  </div>
                </div>

                {/* TASK METRIC VALUE */}
                <div style={{ fontSize: "0.85rem", color: "#9b8b6f", fontWeight: "bold", textAlign: "right" }}>
                  ⏳ {task.duration_minutes} mins
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
