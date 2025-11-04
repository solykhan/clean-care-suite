import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import AddCustomer from "./pages/AddCustomer";
import ServiceAgreements from "./pages/ServiceAgreements";
import CustomerServiceAgreementForm from "./pages/CustomerServiceAgreementForm";
import Runs from "./pages/Runs";
import CustomerServiceReportForm from "./pages/CustomerServiceReportForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customers/new" element={<AddCustomer />} />
                  <Route path="/customers/:id" element={<CustomerDetail />} />
                  <Route path="/service-agreements" element={<ServiceAgreements />} />
                  <Route path="/customer-service-form" element={<CustomerServiceAgreementForm />} />
                  <Route path="/runs" element={<Runs />} />
                  <Route path="/customer-service-report" element={<CustomerServiceReportForm />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
