// DashboardLayout.jsx
import { Outlet } from "react-router-dom";
// Note: RequestsTable and PurchaseRequestForm are not needed here if they are only used in AppRoutes
// import RequestsTable from "../components/RequestList"; 
// import PurchaseRequestForm from "../components/PurchaseRequestForm"; 
import DynamicSidebar from "../components/layout/Sidebar";

export default function DashboardLayout() {
  return (
    // DynamicSidebar will render the full layout, including the <Outlet />
    <DynamicSidebar /> 
    
    /* REMOVED CONFLICTING CODE:
    <div className="flex min-h-screen">
      <DynamicSidebar />
      <main className="flex-1 p-8 bg-gray-100">
        <Outlet />
      </main>
    </div>
    */
  );
}