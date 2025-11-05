import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Download, Eye, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ServiceReports = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [technicianFilter, setTechnicianFilter] = useState("all");

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ["customer-service-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_service_reports")
        .select("*")
        .order("report_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: runs } = useQuery({
    queryKey: ["runs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("runs").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Get unique technicians for filter
  const uniqueTechnicians = useMemo(() => {
    if (!reports) return [];
    const technicians = reports
      .map((report) => report.technician_name)
      .filter((name): name is string => !!name);
    return Array.from(new Set(technicians)).sort();
  }, [reports]);

  // Filter reports based on search and filters
  const filteredReports = useMemo(() => {
    if (!reports) return [];
    
    return reports.filter((report) => {
      const matchesSearch = !searchTerm || 
        report.service_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.technician_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.site_officer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.client_email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTechnician = technicianFilter === "all" || 
        report.technician_name === technicianFilter;
      
      return matchesSearch && matchesTechnician;
    });
  }, [reports, searchTerm, technicianFilter]);

  const getRunDetails = (runId: string) => {
    return runs?.find((run) => run.id === runId);
  };

  const exportToCSV = () => {
    if (!filteredReports || filteredReports.length === 0) {
      toast.error("No reports to export");
      return;
    }

    const headers = [
      "Report Date",
      "Service ID",
      "Technician",
      "Site Officer",
      "Client Email",
      "Comments",
      "Client",
      "Suburb"
    ];

    const csvData = filteredReports.map((report) => {
      const run = getRunDetails(report.run_id);
      return [
        format(new Date(report.report_date), "PPpp"),
        report.service_id || "",
        report.technician_name || "",
        report.site_officer_name || "",
        report.client_email || "",
        report.comments || "",
        run?.clients || "",
        run?.suburb || ""
      ];
    });

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `service-reports-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Reports exported successfully");
  };

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Reports</CardTitle>
            <CardDescription>Failed to load service reports. Please try again.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Service Reports</h1>
        </div>
        <p className="text-muted-foreground">View and manage all customer service reports</p>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by service ID, technician, officer, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by Technician" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technicians</SelectItem>
                {uniqueTechnicians.map((tech) => (
                  <SelectItem key={tech} value={tech}>
                    {tech}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={exportToCSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>

            <Button onClick={() => navigate("/customer-service-report")} className="gap-2">
              <ClipboardList className="h-4 w-4" />
              New Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Reports ({filteredReports?.length || 0})
          </CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `Showing ${filteredReports?.length || 0} of ${reports?.length || 0} reports`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Report Date</TableHead>
                    <TableHead className="whitespace-nowrap">Service ID</TableHead>
                    <TableHead className="whitespace-nowrap">Client</TableHead>
                    <TableHead className="whitespace-nowrap">Suburb</TableHead>
                    <TableHead className="whitespace-nowrap">Technician</TableHead>
                    <TableHead className="whitespace-nowrap">Site Officer</TableHead>
                    <TableHead className="whitespace-nowrap">Client Email</TableHead>
                    <TableHead className="whitespace-nowrap">Comments</TableHead>
                    <TableHead className="whitespace-nowrap">Signatures</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 10 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-5 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredReports && filteredReports.length > 0 ? (
                    filteredReports.map((report) => {
                      const run = getRunDetails(report.run_id);
                      const hasSignatures = report.s_officer_sig && report.tech_sig;
                      
                      return (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {format(new Date(report.report_date), "PPp")}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{report.service_id || "—"}</TableCell>
                          <TableCell className="whitespace-nowrap">{run?.clients || "—"}</TableCell>
                          <TableCell className="whitespace-nowrap">{run?.suburb || "—"}</TableCell>
                          <TableCell className="whitespace-nowrap">{report.technician_name || "—"}</TableCell>
                          <TableCell className="whitespace-nowrap">{report.site_officer_name || "—"}</TableCell>
                          <TableCell className="max-w-[250px] truncate">
                            {report.client_email || "—"}
                          </TableCell>
                          <TableCell className="max-w-[250px] truncate">
                            {report.comments || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={hasSignatures ? "default" : "secondary"}>
                              {hasSignatures ? "Complete" : "Partial"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/service-report/${report.id}`)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No service reports found. Create your first report to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceReports;
