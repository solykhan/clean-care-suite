import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import TechnicianDashboard from "./pages/TechnicianDashboard";
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
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <AppSidebar />
                      <main className="flex-1 flex flex-col">
                        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
                          <SidebarTrigger />
                          <h2 className="text-lg font-semibold">Hygiene Facility Management</h2>
                        </header>
                        <div className="flex-1">
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/technician-dashboard" element={<TechnicianDashboard />} />
                            <Route path="/customers" element={<Customers />} />
                            <Route path="/customers/new" element={<AddCustomer />} />
                            <Route path="/customers/:id" element={<CustomerDetail />} />
                            <Route path="/service-agreements" element={<ServiceAgreements />} />
                            <Route path="/customer-service-form" element={<CustomerServiceAgreementForm />} />
                            <Route path="/runs" element={<Runs />} />
                            <Route path="/customer-service-report" element={<CustomerServiceReportForm />} />
                            <Route path="/service-reports" element={<ServiceReports />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </div>
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
