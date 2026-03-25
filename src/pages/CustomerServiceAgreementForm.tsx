import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ServiceAgreementForm } from "@/components/ServiceAgreementForm";
import { EditServiceAgreementDialog } from "@/components/EditServiceAgreementDialog";
import { Search, ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CustomerServiceAgreementForm = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("site_name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: serviceAgreements, isLoading: isLoadingAgreements } = useQuery({
    queryKey: ["service-agreements", selectedCustomerId, refreshKey],
    queryFn: async () => {
      if (!selectedCustomerId) return [];
      const customer = customers?.find(c => c.id === selectedCustomerId);
      if (!customer?.service_id) return [];
      const { data, error } = await supabase
        .from("service_agreements")
        .select("*")
        .eq("service_id", customer.service_id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCustomerId,
  });

  const selectedCustomer = customers?.find(c => c.id === selectedCustomerId);

  const filteredCustomers = customers?.filter((customer) =>
    customer.site_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.service_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.site_suburb?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSuccess = () => setRefreshKey((prev) => prev + 1);

  // Customer list view
  if (!selectedCustomerId) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customer Service Form</h1>
            <p className="text-muted-foreground mt-1">Select a customer to view their service agreements</p>
          </div>
        </div>

        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID or suburb..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoadingCustomers ? (
              <div className="p-6 space-y-2">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold w-16"></TableHead>
                      <TableHead className="font-bold">ID</TableHead>
                      <TableHead className="font-bold">Name of Customer</TableHead>
                      <TableHead className="font-bold">Suburb</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers && filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer, index) => (
                        <TableRow
                          key={customer.id}
                          className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                        >
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-3 text-xs font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                              onClick={() => setSelectedCustomerId(customer.id)}
                            >
                              Go
                            </Button>
                          </TableCell>
                          <TableCell className="font-mono text-sm font-semibold">
                            {customer.service_id}
                          </TableCell>
                          <TableCell className="font-medium">{customer.site_name}</TableCell>
                          <TableCell className="text-muted-foreground">{customer.site_suburb || "-"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No customers found{searchTerm ? ` matching "${searchTerm}"` : ""}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Service agreements detail view
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedCustomerId(null)} className="mt-1">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{selectedCustomer?.site_name}</h1>
            <p className="text-muted-foreground font-mono text-sm mt-1">
              Service ID: {selectedCustomer?.service_id}
            </p>
            {selectedCustomer?.site_suburb && (
              <p className="text-muted-foreground text-sm">{selectedCustomer.site_suburb}</p>
            )}
          </div>
        </div>
        <ServiceAgreementForm
          serviceId={selectedCustomer?.service_id}
          onSuccess={handleSuccess}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Service Agreements</h2>
        {isLoadingAgreements ? (
          <Skeleton className="h-64 w-full" />
        ) : serviceAgreements && serviceAgreements.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold">Products</TableHead>
                      <TableHead className="font-bold">Areas Covered</TableHead>
                      <TableHead className="font-bold">Frequency</TableHead>
                      <TableHead className="font-bold">Invoice Type</TableHead>
                      <TableHead className="font-bold">Unit Price</TableHead>
                      <TableHead className="font-bold">CPM Pricing</TableHead>
                      <TableHead className="font-bold">CPI</TableHead>
                      <TableHead className="font-bold">Total</TableHead>
                      <TableHead className="font-bold">CPM Device</TableHead>
                      <TableHead className="font-bold">Comments</TableHead>
                      <TableHead className="font-bold">Created</TableHead>
                      <TableHead className="font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceAgreements.map((agreement) => (
                      <TableRow key={agreement.id}>
                        <TableCell>
                          <Badge variant={agreement.service_active_inactive === "Active" ? "default" : "secondary"}>
                            {agreement.service_active_inactive || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>{agreement.products || "-"}</TableCell>
                        <TableCell>{agreement.areas_covered || "-"}</TableCell>
                        <TableCell>{agreement.service_frequency || "-"}</TableCell>
                        <TableCell>{agreement.invoice_type || "-"}</TableCell>
                        <TableCell>{agreement.unit_price ? `$${agreement.unit_price}` : "-"}</TableCell>
                        <TableCell>{agreement.cpm_pricing ? `$${agreement.cpm_pricing}` : "-"}</TableCell>
                        <TableCell>{agreement.cpi ? `$${agreement.cpi}` : "-"}</TableCell>
                        <TableCell className="font-semibold">{agreement.total ? `$${agreement.total}` : "-"}</TableCell>
                        <TableCell>{agreement.cpm_device_onsite || "-"}</TableCell>
                        <TableCell className="max-w-xs truncate">{agreement.comments || "-"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {agreement.created_at ? new Date(agreement.created_at).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
                          <EditServiceAgreementDialog agreement={agreement} onSuccess={handleSuccess} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                No service agreements found. Create one using the button above!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerServiceAgreementForm;
