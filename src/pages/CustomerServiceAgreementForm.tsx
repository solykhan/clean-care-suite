import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceAgreementForm } from "@/components/ServiceAgreementForm";
import { EditServiceAgreementDialog } from "@/components/EditServiceAgreementDialog";
import { Building2, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
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

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="h-screen flex">
      {/* Left Sidebar - Customer List */}
      <div className="w-80 border-r bg-muted/30">
        <div className="p-4 border-b bg-background">
          <h2 className="text-lg font-semibold">Customer List View</h2>
          <p className="text-sm text-muted-foreground">Select a customer</p>
        </div>
        
        <ScrollArea className="h-[calc(100vh-80px)]">
          {isLoadingCustomers ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {customers?.map((customer) => (
                <Card
                  key={customer.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedCustomerId === customer.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => setSelectedCustomerId(customer.id)}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <Building2 className="h-4 w-4 text-primary" />
                      {customer.delete_tag && (
                        <Badge variant="destructive" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <CardTitle className="text-sm">{customer.site_name}</CardTitle>
                    <CardDescription className="text-xs font-mono">
                      {customer.service_id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-1 text-xs">
                      {customer.site_suburb && (
                        <div className="text-muted-foreground">{customer.site_suburb}</div>
                      )}
                      {customer.site_telephone_no1 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{customer.site_telephone_no1}</span>
                        </div>
                      )}
                      {customer.site_email_address && (
                        <div className="flex items-center gap-1 text-muted-foreground truncate">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{customer.site_email_address}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Main Area - Service Agreement Details */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {!selectedCustomerId ? (
            <Card className="h-96 flex items-center justify-center">
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Select a customer from the list to view and manage their service agreements
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Service Agreement Form</h1>
                    <p className="text-muted-foreground">
                      Detailed view for {selectedCustomer?.site_name}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono mt-1">
                      Service ID: {selectedCustomer?.service_id}
                    </p>
                  </div>
                  <ServiceAgreementForm 
                    serviceId={selectedCustomer?.service_id} 
                    onSuccess={handleSuccess}
                  />
                </div>
              </div>

              {/* Service Agreements List */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Service Agreements</h2>
                {isLoadingAgreements ? (
                  <Skeleton className="h-64 w-full" />
                ) : serviceAgreements && serviceAgreements.length > 0 ? (
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Status</TableHead>
                              <TableHead>Products</TableHead>
                              <TableHead>Areas Covered</TableHead>
                              <TableHead>Service Frequency</TableHead>
                              <TableHead>Invoice Type</TableHead>
                              <TableHead>Unit Price</TableHead>
                              <TableHead>CPM Pricing</TableHead>
                              <TableHead>CPI</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>CPM Device Onsite</TableHead>
                              <TableHead>Comments</TableHead>
                              <TableHead>Created At</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {serviceAgreements.map((agreement) => (
                              <TableRow key={agreement.id}>
                                <TableCell>
                                  <Badge
                                    variant={
                                      agreement.service_active_inactive === "Active"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {agreement.service_active_inactive || "N/A"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{agreement.products || "-"}</TableCell>
                                <TableCell>{agreement.areas_covered || "-"}</TableCell>
                                <TableCell>{agreement.service_frequency || "-"}</TableCell>
                                <TableCell>{agreement.invoice_type || "-"}</TableCell>
                                <TableCell>
                                  {agreement.unit_price ? `$${agreement.unit_price}` : "-"}
                                </TableCell>
                                <TableCell>
                                  {agreement.cpm_pricing ? `$${agreement.cpm_pricing}` : "-"}
                                </TableCell>
                                <TableCell>
                                  {agreement.cpi ? `$${agreement.cpi}` : "-"}
                                </TableCell>
                                <TableCell className="font-semibold">
                                  {agreement.total ? `$${agreement.total}` : "-"}
                                </TableCell>
                                <TableCell>{agreement.cpm_device_onsite || "-"}</TableCell>
                                <TableCell className="max-w-xs truncate">
                                  {agreement.comments || "-"}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {agreement.created_at
                                    ? new Date(agreement.created_at).toLocaleDateString()
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  <EditServiceAgreementDialog 
                                    agreement={agreement}
                                    onSuccess={handleSuccess}
                                  />
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
                        No service agreements found for this customer. Create one using the button above!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceAgreementForm;
