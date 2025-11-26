import { Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import VerifyAccount from "../pages/Auth/VerifyAccount";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./ProtectedRoutes";
import HomePage from "../Features/HomePage";
import AboutPage from "../Features/Aboutbage";
import ServicesPage from "../Features/ServicePage";
import ContactPage from "../Features/ContactPage";
import RequestsTable from "../components/RequestList";
import PurchaseRequestForm from "../components/PurchaseRequestForm";
import ReviewedRequestsPage from "../components/ReviewedRequestsPage";  
import DashboardPageSummary from "../components/DashbordSummary";
import SubmitReceipts from "../components/SubmitReciet";
// import RequestDetailPage from "../components/RequestDetailPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<VerifyAccount />} />
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<DashboardPageSummary />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="my-requests" element={<RequestsTable />} />
        <Route path="add" element={<PurchaseRequestForm />} />
        <Route path="reviewed" element={<ReviewedRequestsPage />} />
          <Route path="requestSummary" element={<DashboardPageSummary />} />
          <Route path="receit/submit" element={<SubmitReceipts />} />
        {/* <Route path="requests/:id" element={<RequestDetailPage />} /> */}
      
      </Route>

      {/* Dashboard is protected and has nested children */}
      {/* <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      /> */}
    </Routes>
  );
}
