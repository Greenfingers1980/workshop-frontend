import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom"; // 👈 provides routing context
import { router } from "./router"; // 👈 your router file
import "./index.css"; // keep your global styles (includes William Morris wallpaper)

// Hide print buttons on Android
if (/Android/i.test(navigator.userAgent)) {
  document.querySelectorAll(".print-button").forEach((el) => {
    (el as HTMLElement).style.display = "none";
  });
}

// Example job type (optional, for local testing)
type Job = {
  id: number;
  description: string;
  status: string;
};

// ✅ Render RouterProvider instead of <App />
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} /> {/* 👈 this fixes the context error */}
  </React.StrictMode>
);