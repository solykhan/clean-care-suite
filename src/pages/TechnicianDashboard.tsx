import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle, Clock, AlertCircle, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const isTechnician = role === "technician";

  // Fetch the logged-in user's profile to get their username (= technician name)
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const technicianName = profile?.username || null;

  const { data: runs, isLoading } = useQuery({
    queryKey: ["runs", isTechnician ? technicianName : "all"],
    queryFn: async () => {
      let query = supabase.from("runs").select("*");
      // For technicians, only fetch their own runs
      if (isTechnician && technicianName) {
        query = query.eq("technicians", technicianName);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !isTechnician || !!technicianName, // Wait for name before fetching if technician
  });

  const totalRuns = runs?.length || 0;
  const completedRuns = runs?.filter((run) => run.work === "Completed")?.length || 0;
  const pendingRuns = runs?.filter((run) => run.work !== "Completed")?.length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome banner for technician */}
      {isTechnician && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Welcome, {technicianName || user?.email}
              </p>
              <p className="text-sm text-muted-foreground">
                {user?.email} · Technician
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Technician Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          {isTechnician && technicianName
            ? `Showing runs assigned to ${technicianName}`
            : "Manage your service runs efficiently"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
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
            <p className="text-xs text-muted-foreground mt-1">
              {isTechnician ? "Your service runs" : "All service runs"}
            </p>
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
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Service Runs
          </CardTitle>
          <CardDescription>
            {isTechnician
              ? "View and manage your assigned service runs"
              : "View and manage all scheduled service runs"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isTechnician
              ? "Access your list of service runs filtered to your assignments."
              : "Access your complete list of service runs, filter by technician, week, or status."}
          </p>
          <Button onClick={() => navigate("/runs")} className="w-full">
            View My Runs
          </Button>
        </CardContent>
      </Card>

      {/* Pending alert */}
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
                  Complete these runs to keep your schedule up to date
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
