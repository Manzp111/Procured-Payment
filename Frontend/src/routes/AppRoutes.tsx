import { Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import VerifyAccount from "../pages/Auth/VerifyAccount";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./ProtectedRoutes";
import RequestsTable from "../components/RequestList";
import PurchaseRequestForm from "../components/PurchaseRequestForm";
import ReviewedRequestsPage from "../components/ReviewedRequestsPage";  
import DashboardPageSummary from "../components/DashbordSummary";
import SubmitReceipts from "../components/SubmitReciet";
import FinanceInvoicePage from "../components/FinanceInvoiceSubmit";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<VerifyAccount />} />

      {/* Protected Dashboard and All Its Children */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPageSummary />} /> 
        <Route path="my-requests" element={<RequestsTable />} />
        <Route path="add" element={<PurchaseRequestForm />} />
        <Route path="reviewed" element={<ReviewedRequestsPage />} />
        <Route path="requestSummary" element={<DashboardPageSummary />} />
        <Route path="receit/submit" element={<SubmitReceipts />} />
        <Route path="invoice/submit" element={<FinanceInvoicePage />} />
      </Route>
    </Routes>
  );
}
