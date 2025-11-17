import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ServiceAgreementForm } from "@/components/ServiceAgreementForm";
import { ServiceAgreementImportDialog } from "@/components/ServiceAgreementImportDialog";
import { EditServiceAgreementDialog } from "@/components/EditServiceAgreementDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ListPlus } from "lucide-react";
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
          <Link to="/customer-service-form">
            <Button variant="outline" className="gap-2">
              <ListPlus className="h-4 w-4" />
              Customer Service Form
            </Button>
          </Link>
          <ServiceAgreementImportDialog onSuccess={handleSuccess} />
          <ServiceAgreementForm onSuccess={handleSuccess} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {serviceAgreements && serviceAgreements.length > 0 ? (
            <div className="overflow-x-auto w-full">
              <Table className="w-full table-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold whitespace-nowrap">Service ID</TableHead>
                    <TableHead className="font-bold whitespace-nowrap">Status</TableHead>
                    <TableHead className="font-bold whitespace-nowrap">Products</TableHead>
                    <TableHead className="font-bold whitespace-nowrap">Areas Covered</TableHead>
                    <TableHead className="font-bold whitespace-nowrap">Service Frequency</TableHead>
                    <TableHead className="font-bold whitespace-nowrap">Invoice Type</TableHead>
                    <TableHead className="font-bold whitespace-nowrap">Unit Price</TableHead>
                    <TableHead className="font-bold whitespace-nowrap">CPM Pricing</TableHead>
                    <TableHead className="font-bold whitespace-nowrap">CPI</TableHead>
                    <TableHead className="font-bold whitespace-nowrap">Total</TableHead>
                    <TableHead className="font-bold whitespace-nowrap">CPM Device Onsite</TableHead>
                    <TableHead className="font-bold whitespace-nowrap">Comments</TableHead>
                    <TableHead className="font-bold whitespace-nowrap">Created At</TableHead>
                    <TableHead className="font-bold whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceAgreements.map((agreement) => (
                    <TableRow key={agreement.id}>
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {agreement.service_id}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
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
                      <TableCell className="whitespace-nowrap">
                        {agreement.unit_price ? `$${agreement.unit_price}` : "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {agreement.cpm_pricing ? `$${agreement.cpm_pricing}` : "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {agreement.cpi ? `$${agreement.cpi}` : "-"}
                      </TableCell>
                      <TableCell className="font-semibold whitespace-nowrap">
                        {agreement.total ? `$${agreement.total}` : "-"}
                      </TableCell>
                      <TableCell>{agreement.cpm_device_onsite || "-"}</TableCell>
                      <TableCell>
                        {agreement.comments || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {agreement.created_at
                          ? new Date(agreement.created_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
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
