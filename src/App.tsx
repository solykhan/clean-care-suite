import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { TechnicianRoute } from "@/components/TechnicianRoute";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import AddCustomer from "./pages/AddCustomer";
import ServiceAgreements from "./pages/ServiceAgreements";
import CustomerServiceAgreementForm from "./pages/CustomerServiceAgreementForm";
import Runs from "./pages/Runs";
import RunsCalendar from "./pages/RunsCalendar";
import CustomerServiceReportForm from "./pages/CustomerServiceReportForm";
import ServiceReports from "./pages/ServiceReports";
import ServiceReportDetail from "./pages/ServiceReportDetail";
import EditServiceReport from "./pages/EditServiceReport";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/auth" element={<Auth />} />

            {/* All authenticated routes share the Layout */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>

              {/* Admin-only routes */}
              <Route path="/" element={<AdminRoute><Index /></AdminRoute>} />
              <Route path="/customers" element={<AdminRoute><Customers /></AdminRoute>} />
              <Route path="/customers/new" element={<AdminRoute><AddCustomer /></AdminRoute>} />
              <Route path="/customers/:id" element={<AdminRoute><CustomerDetail /></AdminRoute>} />
              <Route path="/service-agreements" element={<AdminRoute><ServiceAgreements /></AdminRoute>} />
              <Route path="/customer-service-form" element={<AdminRoute><CustomerServiceAgreementForm /></AdminRoute>} />
              <Route path="/customer-service-report" element={<TechnicianRoute><CustomerServiceReportForm /></TechnicianRoute>} />
              <Route path="/service-reports" element={<AdminRoute><ServiceReports /></AdminRoute>} />
              <Route path="/service-report/:id" element={<AdminRoute><ServiceReportDetail /></AdminRoute>} />
              <Route path="/service-report/:id/edit" element={<AdminRoute><EditServiceReport /></AdminRoute>} />
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUserManagement /></AdminRoute>} />

              {/* Technician + Admin routes */}
              <Route path="/technician-dashboard" element={<TechnicianRoute><TechnicianDashboard /></TechnicianRoute>} />
              <Route path="/runs" element={<TechnicianRoute><Runs /></TechnicianRoute>} />
              <Route path="/runs/calendar" element={<TechnicianRoute><RunsCalendar /></TechnicianRoute>} />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
