import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceAgreementForm } from "@/components/ServiceAgreementForm";
import { ServiceAgreementImportDialog } from "@/components/ServiceAgreementImportDialog";
import { EditServiceAgreementDialog } from "@/components/EditServiceAgreementDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ServiceAgreements = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: serviceAgreements, isLoading } = useQuery({
    queryKey: ["service-agreements", refreshKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_agreements")
        .select("*")
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
        <div className="flex gap-2">
          <ServiceAgreementImportDialog onSuccess={handleSuccess} />
          <ServiceAgreementForm onSuccess={handleSuccess} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {serviceAgreements && serviceAgreements.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service ID</TableHead>
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
                      <TableCell className="font-mono text-xs">
                        {agreement.service_id}
                      </TableCell>
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
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                No service agreements found. Create your first one!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceAgreements;
