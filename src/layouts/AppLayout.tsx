// @ts-nocheck
import React from "react";
import { Outlet } from "react-router-dom";
import "./AppLayout.css";

const AppLayout: React.FC = () => {
  return (
    <div className="app-layout">
      <Outlet />
    </div>
  );
};

// ✅ This line is essential
export default AppLayout;
