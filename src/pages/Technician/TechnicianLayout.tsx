import { Outlet } from "react-router-dom";

export default function TechnicianLayout() {
  return (
    <div style={{ padding: "1rem" }}>
      <Outlet />
    </div>
  );
}