import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useState, useMemo } from "react";

const RunDashboard = () => {
  const [technician1, setTechnician1] = useState<string>("all");
  const [technician2, setTechnician2] = useState<string>("all");

  const { data: runs, isLoading } = useQuery({
    queryKey: ["run-dashboard-runs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("runs").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Extract unique technician names
  const technicianNames = useMemo(() => {
    if (!runs) return [];
    const names = new Set<string>();
    runs.forEach((run) => {
      if (run.technicians) {
        run.technicians.split(",").forEach((t) => {
          const trimmed = t.trim();
          if (trimmed) names.add(trimmed);
        });
      }
    });
    return Array.from(names).sort();
  }, [runs]);

  // Filter runs based on selected technicians
  const filteredRuns = useMemo(() => {
    if (!runs) return [];
    return runs.filter((run) => {
      const techs = run.technicians?.toLowerCase() || "";
      const match1 = technician1 === "all" || techs.includes(technician1.toLowerCase());
      return match1;
    });
  }, [runs, technician1]);

  const completedCount = filteredRuns.filter((r) => r.completed === "completed").length;
  const pendingCount = filteredRuns.filter((r) => r.completed !== "completed").length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Run Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of all service runs filtered by technician</p>
      </div>

      {/* Technician Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Filter by Technician
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Technician A</label>
              <Select value={technician1} onValueChange={setTechnician1}>
                <SelectTrigger className="min-w-[200px]">
                  <SelectValue placeholder="All Technicians" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Technicians</SelectItem>
                  {technicianNames.map((name) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Technician 2</label>
              <Select value={technician2} onValueChange={setTechnician2}>
                <SelectTrigger className="min-w-[200px]">
                  <SelectValue placeholder="All Technicians" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Technicians</SelectItem>
                  {technicianNames.map((name) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{filteredRuns.length}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-green-600">{completedCount}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Runs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Runs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : filteredRuns.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No runs found for the selected filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Technicians</TableHead>
                    <TableHead>Week Day</TableHead>
                    <TableHead>Weeks</TableHead>
                    <TableHead>Suburb</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">{run.service_id}</TableCell>
                      <TableCell>{run.clients || "—"}</TableCell>
                      <TableCell>{run.technicians || "—"}</TableCell>
                      <TableCell>{run.week_day || "—"}</TableCell>
                      <TableCell>{run.weeks || "—"}</TableCell>
                      <TableCell>{run.suburb || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={run.completed === "completed" ? "default" : "secondary"}>
                          {run.completed === "completed" ? "Completed" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RunDashboard;
