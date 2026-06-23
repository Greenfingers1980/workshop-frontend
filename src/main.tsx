import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./index.css";

/* Import all providers */
import { AccountingProvider } from "./pages/Accounting/AccountingContext";
import { TechnicianProvider } from "./pages/Technician/TechnicianContext.tsx"; // 👈 note the .tsx extension
import { StockProvider } from "./pages/Stock/StockContext";

/* Hide print buttons on Android */
if (/Android/i.test(navigator.userAgent)) {
  document.querySelectorAll(".print-button").forEach((el) => {
    (el as HTMLElement).style.display = "none";
  });
}

/* Render router wrapped in all providers */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AccountingProvider>
      <TechnicianProvider>
        <StockProvider>
          <RouterProvider router={router} />
        </StockProvider>
      </TechnicianProvider>
    </AccountingProvider>
  </React.StrictMode>
);
