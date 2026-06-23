import { createBrowserRouter } from "react-router-dom";
import App from "./App";

/* Dashboard */
import Dashboard from "./pages/Dashboard/Dashboard";

/* Jobs */
import Jobs from "./pages/Jobs/Jobs";
import NewJob from "./pages/Jobs/NewJob";
import ViewJob from "./pages/Jobs/ViewJob";

/* Technician */
import TechnicianLayout from "./pages/Technician/TechnicianLayout";
import TechnicianDashboard from "./pages/Technician/TechnicianDashboard";
import { TechnicianMyJobs } from "./pages/Technician/TechnicianMyJobs";
import TechnicianJobView from "./pages/Technician/TechnicianJobView";

/* Accounting */
import Customers from "./pages/Accounting/Customers";
import CustomerView from "./pages/Accounting/CustomerView";
import SalesLedger from "./pages/Accounting/SalesLedger";
import NewSalesInvoice from "./pages/Accounting/NewSalesInvoice";
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

/* Bank */
import BankImport from "./pages/Accounting/BankImport";
import BankReconcile from "./pages/Accounting/BankReconcile";

/* Stock */
import StockDashboard from "./pages/StockDashboard";
import StockAdjust from "./pages/StockAdjust";
import StockHistory from "./pages/StockHistory";
import StockList from "./pages/StockList";
import StockItemEditor from "./pages/StockItemEditor";
import DataTools from "./pages/Settings/data-tools";

/* Tools */
import Tools from "./pages/Tools/Tools";

/* Admin */
import UploadPDF from "./pages/Admin/UploadPDF";

/* Auth */
import Login from "./pages/Login";

/* Error Page */
import NotFound from "./pages/NotFound";

/* Wrapper for Stock Item Editor */
import { useParams, useNavigate } from "react-router-dom";

function StockItemEditorWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <StockItemEditor
      itemId={id ? Number(id) : undefined}
      onClose={() => navigate("/stock/list")}
    />
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />, // 👈 Custom error page
    children: [
      { index: true, element: <Dashboard /> },

      /* Jobs */
      { path: "jobs", element: <Jobs /> },
      { path: "jobs/new", element: <NewJob /> },
      { path: "jobs/:id", element: <ViewJob /> },

      /* Technician */
      {
        path: "technician",
        element: <TechnicianLayout />,
        children: [
          { index: true, element: <TechnicianDashboard /> },
          { path: "my-jobs", element: <TechnicianMyJobs /> },
          { path: "job/:id", element: <TechnicianJobView /> },
          { path: "tools", element: <Tools /> },
        ],
      },

      /* Accounting */
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

      /* Stock */
      { path: "stock", element: <StockDashboard /> },
      { path: "stock/adjust", element: <StockAdjust /> },
      { path: "stock/history", element: <StockHistory /> },
      { path: "stock/list", element: <StockList /> },
      { path: "stock/item/:id", element: <StockItemEditorWrapper /> },

      /* Tools */
      { path: "tools", element: <Tools /> },

      /* Settings */
      { path: "settings/data-tools", element: <DataTools /> },

      /* Admin */
      { path: "admin/upload-pdf", element: <UploadPDF /> },

      /* Auth */
      { path: "login", element: <Login /> },
    ],
  },
]);
