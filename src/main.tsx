import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom"; // 👈 added
import { router } from "./router"; // 👈 import your router
import "./index.css"; // optional, keep your global styles

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

// ✅ Render the RouterProvider instead of <App />
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} /> {/* 👈 provides routing context */}
  </React.StrictMode>
);
