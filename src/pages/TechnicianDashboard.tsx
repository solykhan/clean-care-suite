import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, ClipboardList, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const TechnicianDashboard = () => {
  const navigate = useNavigate();

  const { data: runs, isLoading: runsLoading } = useQuery({
    queryKey: ["runs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("runs").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["customer-service-reports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customer_service_reports").select("*");
      if (error) throw error;
      return data;
    },
  });

  const totalRuns = runs?.length || 0;
  const completedRuns = runs?.filter((run) => run.completed)?.length || 0;
  const pendingRuns = totalRuns - completedRuns;
  const totalReports = reports?.length || 0;

  const isLoading = runsLoading || reportsLoading;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Technician Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your service runs and reports efficiently
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totalRuns}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">All service runs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{completedRuns}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Finished runs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-orange-600">{pendingRuns}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totalReports}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Service reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Service Runs
            </CardTitle>
            <CardDescription>
              View and manage all your scheduled service runs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Access your complete list of service runs, filter by technician, week, or status.
            </p>
            <Button onClick={() => navigate("/runs")} className="w-full">
              View All Runs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Service Reports
            </CardTitle>
            <CardDescription>
              Create and manage customer service reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Fill out service reports for completed runs with customer signatures and details.
            </p>
            <Button onClick={() => navigate("/customer-service-report")} className="w-full">
              Create Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {!isLoading && pendingRuns > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Action Required
            </CardTitle>
            <CardDescription>Pending tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  You have {pendingRuns} pending service {pendingRuns === 1 ? "run" : "runs"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete these runs and submit service reports
                </p>
              </div>
              <Button onClick={() => navigate("/runs")}>View Runs</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TechnicianDashboard;
