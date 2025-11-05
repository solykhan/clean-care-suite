import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const ServiceReportDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: report, isLoading, error } = useQuery({
    queryKey: ["customer-service-report", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_service_reports")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: run } = useQuery({
    queryKey: ["run", report?.run_id],
    queryFn: async () => {
      if (!report?.run_id) return null;
      const { data, error } = await supabase
        .from("runs")
        .select("*")
        .eq("id", report.run_id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!report?.run_id,
  });

  const { data: serviceAgreements } = useQuery({
    queryKey: ["service_agreements", report?.service_id],
    queryFn: async () => {
      if (!report?.service_id) return null;
      const { data, error } = await supabase
        .from("service_agreements")
        .select("*")
        .eq("service_id", report.service_id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!report?.service_id,
  });

  if (error || (!isLoading && !report)) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Report Not Found</CardTitle>
            <CardDescription>The requested service report could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/service-reports")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button onClick={() => navigate("/service-reports")} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Service Report Details</h1>
            <p className="text-muted-foreground mt-2">
              {isLoading ? "Loading..." : `Report ID: ${report?.id}`}
            </p>
          </div>
          <Button onClick={() => navigate(`/service-report/${id}/edit`)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Report
          </Button>
        </div>
      </div>

      {/* Service Agreements Info */}
      {serviceAgreements && serviceAgreements.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {serviceAgreements.map((agreement) => (
              <Card key={agreement.id} className="w-full md:w-fit md:flex-shrink-0 bg-[hsl(207,69%,74%)] text-black">
                <CardHeader>
                  <CardDescription>Service ID: {agreement.service_id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Products</p>
                    <p className="text-sm text-black/80">{agreement.products || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Number of Products</p>
                    <p className="text-sm text-black/80">{agreement.cpm_device_onsite || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Areas Covered</p>
                    <p className="text-sm text-black/80">{agreement.areas_covered || "N/A"}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {/* Report Information */}
        <Card>
          <CardHeader>
            <CardTitle>Report Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Report Date</p>
                  <p className="text-base">{format(new Date(report!.report_date), "PPpp")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Service ID</p>
                  <p className="text-base">{report?.service_id || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Client</p>
                  <p className="text-base">{run?.clients || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Suburb</p>
                  <p className="text-base">{run?.suburb || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Technician Name</p>
                  <p className="text-base">{report?.technician_name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Site Officer Name</p>
                  <p className="text-base">{report?.site_officer_name || "—"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Client Email</p>
                  <p className="text-base">{report?.client_email || "—"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Comments</p>
                  <p className="text-base whitespace-pre-wrap">{report?.comments || "—"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signatures */}
        <Card>
          <CardHeader>
            <CardTitle>Signatures</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Service Officer Signature</p>
                  {report?.s_officer_sig ? (
                    <div className="border-2 border-muted rounded-lg p-2 bg-white">
                      <img 
                        src={report.s_officer_sig} 
                        alt="Service Officer Signature" 
                        className="w-full h-auto max-h-48"
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-muted rounded-lg p-4 text-center text-muted-foreground bg-muted/10">
                      No signature provided
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Technician Signature</p>
                  {report?.tech_sig ? (
                    <div className="border-2 border-muted rounded-lg p-2 bg-white">
                      <img 
                        src={report.tech_sig} 
                        alt="Technician Signature" 
                        className="w-full h-auto max-h-48"
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-muted rounded-lg p-4 text-center text-muted-foreground bg-muted/10">
                      No signature provided
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceReportDetail;
