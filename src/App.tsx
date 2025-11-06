import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import AddCustomer from "./pages/AddCustomer";
import ServiceAgreements from "./pages/ServiceAgreements";
import CustomerServiceAgreementForm from "./pages/CustomerServiceAgreementForm";
import Runs from "./pages/Runs";
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
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Index />} />
              <Route path="/technician-dashboard" element={<TechnicianDashboard />} />
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUserManagement /></AdminRoute>} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/new" element={<AddCustomer />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/service-agreements" element={<ServiceAgreements />} />
              <Route path="/customer-service-form" element={<CustomerServiceAgreementForm />} />
              <Route path="/runs" element={<Runs />} />
              <Route path="/customer-service-report" element={<CustomerServiceReportForm />} />
              <Route path="/service-reports" element={<ServiceReports />} />
              <Route path="/service-report/:id" element={<ServiceReportDetail />} />
              <Route path="/service-report/:id/edit" element={<EditServiceReport />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
