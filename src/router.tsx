// src/router.tsx
import { createBrowserRouter, useParams, useNavigate } from "react-router-dom";
import App from "./App";
import NotFound from "./pages/NotFound";

/* Dashboard & Root Layouts */
import Dashboard from "./pages/Dashboard/Dashboard";

/* Jobs Management Module */
import Jobs from "./pages/Jobs/Jobs";
import NewJob from "./pages/Jobs/NewJob";
import ViewJob from "./pages/Jobs/ViewJob";

/* Technician Workspace Module */
import TechnicianLayout from "./pages/Technician/TechnicianLayout";
import TechnicianDashboard from "./pages/Technician/TechnicianDashboard";
import { TechnicianMyJobs } from "./pages/Technician/TechnicianMyJobs";
import TechnicianJobView from "./pages/Technician/TechnicianJobView";
import Workbench from "./pages/Technician/Workbench";

/* Accounting Module Components */
import Customers from "./pages/Accounting/Customers";
import CustomerView from "./pages/Accounting/CustomerView";
import SalesLedger from "./pages/Accounting/SalesLedger";
import { NewSalesInvoice } from "./pages/Accounting/NewSalesInvoice";
import NewSalesReceipt from "./pages/Accounting/NewSalesReceipt";
import ChartOfAccounts from "./pages/Accounting/ChartOfAccounts";
import Journal from "./pages/Accounting/Journal";
import ProfitAndLoss from "./pages/Accounting/ProfitAndLoss";
import BalanceSheet from "./pages/Accounting/BalanceSheet";
import AuditTrail from "./pages/Accounting/AuditTrail";
import Suppliers from "./pages/Accounting/Suppliers";
import SupplierLedger from "./pages/Accounting/SupplierLedger";
import SupplierPayments from "./pages/Accounting/SupplierPayments";
import PurchaseInvoices from "./pages/Accounting/PurchaseInvoices";
import NewPurchaseInvoice from "./pages/Accounting/NewPurchaseInvoice";
import PurchaseInvoiceView from "./pages/Accounting/PurchaseInvoiceView";
import TrialBalance from "./pages/Accounting/TrialBalance";
import AgedDebtors from "./pages/Accounting/AgedDebtors";
import YearEnd from "./pages/Accounting/YearEnd";

/* Banking Interfacing Components */
import BankImport from "./pages/Accounting/BankImport";
import BankReconcile from "./pages/Accounting/BankReconcile";

/* Inventory Control Components */
import StockDashboard from "./pages/Stock/StockDashboard";
import StockAdjust from "./pages/Stock/StockAdjust";
import StockHistory from "./pages/Stock/StockHistory";
import StockList from "./pages/Stock/StockList";
import StockItemEditor from "./pages/Stock/StockItemEditor";

/* Settings & Configurations */
import DataTools from "./pages/Settings/data-tools"; // Corrected Import
import Tools from "./pages/Tools/Tools";
import UploadPDF from "./pages/Admin/UploadPDF";
import Login from "./pages/Login";

const PlaceholderView = ({ title }: { title: string }) => (
  <div className="p-6 bg-slate-950 text-slate-400 text-xs font-mono">
    [Registry Node: {title} - View Under Construction]
  </div>
);

/* Wrappers to resolve TypeScript prop requirements */

function StockListWrapper() {
  const navigate = useNavigate();
  return (
    <StockList 
      onAddTrigger={() => navigate("/stock/item/new")}
      onEditTrigger={(id) => navigate(`/stock/item/${id}`)}
      onAdjustTrigger={() => navigate("/stock/adjust")}
      onHistoryTrigger={() => navigate("/stock/history")}
    />
  );
}

function StockAdjustWrapper() {
  const navigate = useNavigate();
  return (
    <StockAdjust 
      itemId={0} 
      onClose={() => navigate("/stock")} 
    />
  );
}

function StockItemEditorWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <StockItemEditor
      itemId={id && id !== "new" ? Number(id) : undefined}
      onClose={() => navigate("/stock")}
    />
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "jobs", element: <Jobs /> },
      { path: "jobs/new", element: <NewJob /> },
      { path: "jobs/:id", element: <ViewJob /> },
      {
        path: "technician",
        element: <TechnicianLayout />,
        children: [
          { index: true, element: <TechnicianDashboard /> },
          { path: "Workbench", element: <Workbench /> },
          { path: "jobs", element: <TechnicianMyJobs /> },
          { path: "job/:id", element: <TechnicianJobView /> },
          { path: "learning/courses", element: <PlaceholderView title="Courses Matrix" /> },
          { path: "learning/schedule", element: <PlaceholderView title="Study Metrics Scheduler" /> },
          { path: "learning/progress", element: <PlaceholderView title="Technician Progress Ledger" /> },
           { path: "login", element: <Login /> },
          { path: "tools", element: <Tools /> },
        ],
      },
      { path: "accounting/customers", element: <Customers /> },
      { path: "accounting/customers/:id", element: <CustomerView /> },
      { path: "accounting/sales-ledger", element: <SalesLedger /> },
      { path: "accounting/sales-invoice/new", element: <NewSalesInvoice /> },
      { path: "accounting/sales-receipts/new", element: <NewSalesReceipt /> },
      { path: "accounting/chart-of-accounts", element: <ChartOfAccounts /> },
      { path: "accounting/journal", element: <Journal /> },
      { path: "accounting/aged-debtors", element: <AgedDebtors /> },
      { path: "accounting/profit-and-loss", element: <ProfitAndLoss /> },
      { path: "accounting/balance-sheet", element: <BalanceSheet /> },
      { path: "accounting/audit-trail", element: <AuditTrail /> },
      { path: "accounting/suppliers", element: <Suppliers /> },
      { path: "accounting/suppliers/:id", element: <SupplierLedger /> },
      { path: "accounting/purchase-invoices", element: <PurchaseInvoices /> },
      { path: "accounting/purchase-invoices/:id", element: <PurchaseInvoiceView /> },
      { path: "accounting/purchase-invoice/new", element: <NewPurchaseInvoice /> },
      { path: "accounting/supplier-payments", element: <SupplierPayments /> },
      { path: "accounting/bank/import", element: <BankImport /> },
      { path: "accounting/bank/reconcile/:id", element: <BankReconcile /> },
      { path: "accounting/trial-balance", element: <TrialBalance /> },
      { path: "accounting/year-end", element: <YearEnd /> },
      { path: "stock", element: <StockListWrapper /> },
      { path: "stock/dashboard", element: <StockDashboard /> },
      { path: "stock/adjust", element: <StockAdjustWrapper /> },
      { path: "stock/history", element: <StockHistory /> },
      { path: "stock/item/:id", element: <StockItemEditorWrapper /> },
      { path: "tools", element: <Tools /> },
      { path: "settings/data-tools", element: <DataTools /> },
      { path: "admin/upload-pdf", element: <UploadPDF /> },
     
      { path: "*", element: <NotFound /> },
    ],
  },
]);