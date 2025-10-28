import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceAgreementForm } from "@/components/ServiceAgreementForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const ServiceAgreements = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: serviceAgreements, isLoading } = useQuery({
    queryKey: ["service-agreements", refreshKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_agreements")
        .select(`
          *,
          customers!service_agreements_service_id_fkey(
            site_name,
            service_id
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Agreements</h1>
          <p className="text-muted-foreground mt-2">
            Manage all service agreements across customers
          </p>
        </div>
        <ServiceAgreementForm onSuccess={handleSuccess} />
      </div>

      <div className="grid gap-4">
        {serviceAgreements && serviceAgreements.length > 0 ? (
          serviceAgreements.map((agreement) => (
            <Card key={agreement.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {agreement.customers?.site_name || "Unknown Customer"}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Service ID: {agreement.service_id}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agreement.products && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Products
                      </p>
                      <p className="text-sm">{agreement.products}</p>
                    </div>
                  )}
                  {agreement.areas_covered && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Areas Covered
                      </p>
                      <p className="text-sm">{agreement.areas_covered}</p>
                    </div>
                  )}
                  {agreement.service_frequency && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Service Frequency
                      </p>
                      <p className="text-sm">{agreement.service_frequency}</p>
                    </div>
                  )}
                  {agreement.invoice_type && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Invoice Type
                      </p>
                      <p className="text-sm">{agreement.invoice_type}</p>
                    </div>
                  )}
                  {agreement.unit_price && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Unit Price
                      </p>
                      <p className="text-sm">${agreement.unit_price}</p>
                    </div>
                  )}
                  {agreement.cpm_pricing && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        CPM Pricing
                      </p>
                      <p className="text-sm">${agreement.cpm_pricing}</p>
                    </div>
                  )}
                  {agreement.cpi && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        CPI
                      </p>
                      <p className="text-sm">${agreement.cpi}</p>
                    </div>
                  )}
                  {agreement.total && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total
                      </p>
                      <p className="text-sm font-semibold">${agreement.total}</p>
                    </div>
                  )}
                  {agreement.cpm_device_onsite && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        CPM Device Onsite
                      </p>
                      <p className="text-sm">{agreement.cpm_device_onsite}</p>
                    </div>
                  )}
                  {agreement.comments && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Comments
                      </p>
                      <p className="text-sm">{agreement.comments}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                No service agreements found. Create your first one!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ServiceAgreements;
