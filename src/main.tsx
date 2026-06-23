import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
