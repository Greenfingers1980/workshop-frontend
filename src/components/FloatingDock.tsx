import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./FloatingDock.css";

export default function FloatingDock() {
  const dockRef = useRef<HTMLDivElement>(null);

  // Load saved position, but auto-reset if off-screen
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("floatingDockPos");

    if (saved) {
      const pos = JSON.parse(saved);

      // ⭐ Auto-reset if saved position is off-screen
      if (
        pos.x < 0 ||
        pos.y < 0 ||
        pos.x > window.innerWidth - 100 ||
        pos.y > window.innerHeight - 50
      ) {
        return { x: 50, y: 50 };
      }

      return pos;
    }

    return { x: 50, y: 50 };
  });

  const [mode, setMode] = useState<"float" | "top" | "bottom" | "left" | "right">("float");
  const [dragging, setDragging] = useState(false);

  // Save position
  useEffect(() => {
    localStorage.setItem("floatingDockPos", JSON.stringify(position));
  }, [position]);

  // GLOBAL mouse move + mouse up listeners
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!dragging || mode !== "float") return;

      // ⭐ Clamp position so dock NEVER leaves the screen
      const newX = Math.max(0, Math.min(e.clientX - 80, window.innerWidth - 160));
      const newY = Math.max(0, Math.min(e.clientY - 20, window.innerHeight - 60));

      setPosition({ x: newX, y: newY });
    };

    const handleUp = () => {
      if (!dragging) return;
      setDragging(false);

      const { x, y } = position;

      // ⭐ Dock snapping logic
      if (y < 40) setMode("top");
      else if (y > window.innerHeight - 80) setMode("bottom");
      else if (x < 40) setMode("left");
      else if (x > window.innerWidth - 120) setMode("right");
      else setMode("float");
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, mode, position]);

  return (
    <div
      ref={dockRef}
      className={`floating-dock dock-${mode}`}
      style={mode === "float" ? { left: position.x, top: position.y } : {}}
    >
      <div
        className="dock-handle"
        onMouseDown={() => setDragging(true)}
      >
        ☰
      </div>

      <div className="dock-content">
        <Link to="/technician/learning/courses" className="dock-btn">Courses</Link>
        <Link to="/technician/learning/schedule" className="dock-btn">Schedule</Link>
        <Link to="/technician/learning/progress" className="dock-btn">Progress</Link>
        <Link to="/tools" className="dock-btn">Tools</Link>

        {/* ⭐ NEW: Admin Upload PDF link */}
        <Link to="/admin/upload" className="dock-btn">Upload PDF</Link>
      </div>
    </div>
  );
}
