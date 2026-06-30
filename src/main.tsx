// src/main.tsx or src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";



/* Context Domain State Providers */
import { AccountingProvider } from "./pages/Accounting/AccountingContext";
import { TechnicianProvider } from "./pages/Technician/TechnicianContext"; // Cleaned extension resolution
import { StockProvider } from "./pages/Stock/StockContext";

/* Robust Android Print UI Filter Enforcement */
if (/Android/i.test(navigator.userAgent)) {
  // Inject a global stylesheet override to block layout shifts dynamically 
  const styleNode = document.createElement("style");
  styleNode.textContent = `.print-button { display: none !important; }`;
  document.head.appendChild(styleNode);
}

/* Render Architecture Root Execution */
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