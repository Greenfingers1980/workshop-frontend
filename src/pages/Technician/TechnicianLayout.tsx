import { Outlet } from "react-router-dom";

export default function TechnicianLayout() {
  return (
    <div className="technician-layout">
      <Outlet /> {/* ✅ renders nested routes */}
    </div>
  );
}