import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceAgreementForm } from "@/components/ServiceAgreementForm";
import { Building2, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

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

              {/* Customer Details Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCustomer?.site_street_name && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Address</p>
                        <p className="text-sm">
                          {selectedCustomer.site_street_name}
                          {selectedCustomer.site_suburb && `, ${selectedCustomer.site_suburb}`}
                          {selectedCustomer.site_post_code && ` ${selectedCustomer.site_post_code}`}
                        </p>
                      </div>
                    )}
                    {selectedCustomer?.site_contact_first_name && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                        <p className="text-sm">
                          {selectedCustomer.site_contact_first_name} {selectedCustomer.site_contact_lastname}
                        </p>
                      </div>
                    )}
                    {selectedCustomer?.site_telephone_no1 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p className="text-sm">{selectedCustomer.site_telephone_no1}</p>
                      </div>
                    )}
                    {selectedCustomer?.site_email_address && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="text-sm">{selectedCustomer.site_email_address}</p>
                      </div>
                    )}
                    {selectedCustomer?.contract_date && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Contract Date</p>
                        <p className="text-sm">
                          {new Date(selectedCustomer.contract_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedCustomer?.notes && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Notes</p>
                        <p className="text-sm">{selectedCustomer.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Service Agreements List */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Service Agreements</h2>
                {isLoadingAgreements ? (
                  <Skeleton className="h-64 w-full" />
                ) : serviceAgreements && serviceAgreements.length > 0 ? (
                  <div className="space-y-4">
                    {serviceAgreements.map((agreement) => (
                      <Card key={agreement.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>Service Agreement</CardTitle>
                              <CardDescription className="mt-1">
                                Created: {new Date(agreement.created_at!).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                agreement.service_active_inactive === "Active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {agreement.service_active_inactive || "Unknown"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {agreement.products && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Products</p>
                                <p className="text-sm">{agreement.products}</p>
                              </div>
                            )}
                            {agreement.areas_covered && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Areas Covered</p>
                                <p className="text-sm">{agreement.areas_covered}</p>
                              </div>
                            )}
                            {agreement.service_frequency && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Frequency</p>
                                <p className="text-sm">{agreement.service_frequency}</p>
                              </div>
                            )}
                            {agreement.invoice_type && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Invoice Type</p>
                                <p className="text-sm">{agreement.invoice_type}</p>
                              </div>
                            )}
                            {agreement.unit_price && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Unit Price</p>
                                <p className="text-sm">${agreement.unit_price}</p>
                              </div>
                            )}
                            {agreement.cpm_pricing && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">CPM Pricing</p>
                                <p className="text-sm">${agreement.cpm_pricing}</p>
                              </div>
                            )}
                            {agreement.cpi && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">CPI</p>
                                <p className="text-sm">${agreement.cpi}</p>
                              </div>
                            )}
                            {agreement.total && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Total</p>
                                <p className="text-sm font-semibold">${agreement.total}</p>
                              </div>
                            )}
                            {agreement.cpm_device_onsite && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">CPM Device Onsite</p>
                                <p className="text-sm">{agreement.cpm_device_onsite}</p>
                              </div>
                            )}
                            {agreement.comments && (
                              <div className="md:col-span-2 lg:col-span-3">
                                <p className="text-sm font-medium text-muted-foreground">Comments</p>
                                <p className="text-sm">{agreement.comments}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
