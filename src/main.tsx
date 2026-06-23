import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AccountingProvider } from "./pages/Accounting/AccountingContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AccountingProvider>
      <RouterProvider router={router} />
    </AccountingProvider>
  </React.StrictMode>
);

