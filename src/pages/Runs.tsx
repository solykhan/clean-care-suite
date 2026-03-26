// Runs page
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Edit, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RunsImportDialog } from "@/components/RunsImportDialog";
import { AddRunDialog } from "@/components/AddRunDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Runs = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const isTechnician = role === "technician";

  const [technicianFilter, setTechnicianFilter] = useState<string>("all");
  const [weeksFilter, setWeeksFilter] = useState<string>("all");
  const [weekDayFilter, setWeekDayFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch logged-in user's profile (to get their technician name)
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

  const { data: runs, isLoading, error } = useQuery({
    queryKey: ["runs", isTechnician ? technicianName : "all"],
    queryFn: async () => {
      let query = supabase.from("runs").select("*").order("created_at", { ascending: false });

      // For technicians, only fetch their own runs
      if (isTechnician && technicianName) {
        query = query.eq("technicians", technicianName);
      }

      const { data, error } = await query;
      if (error) {
        toast.error("Failed to load runs");
        throw error;
      }
      return data;
    },
    enabled: !isTechnician || !!technicianName,
  });

  const filteredRuns = useMemo(() => {
    if (!runs) return [];

    return runs.filter((run) => {
      const matchesTechnician = isTechnician || technicianFilter === "all" || run.technicians === technicianFilter;
      const matchesWeeks = weeksFilter === "all" || run.weeks === weeksFilter;
      const matchesWeekDay = weekDayFilter === "all" || run.week_day === weekDayFilter;
      const isNotCompleted = run.completed !== "completed";
      const matchesSearch =
        searchTerm === "" ||
        run.suburb?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.clients?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTechnician && matchesWeeks && matchesWeekDay && isNotCompleted && matchesSearch;
    });
  }, [runs, technicianFilter, weeksFilter, weekDayFilter, isTechnician]);

  const uniqueTechnicians = useMemo(() => {
    if (!runs) return [];
    return Array.from(new Set(runs.map((r) => r.technicians).filter(Boolean)));
  }, [runs]);

  const uniqueWeeks = useMemo(() => {
    if (!runs) return [];
    return Array.from(new Set(runs.map((r) => r.weeks).filter(Boolean)));
  }, [runs]);

  const uniqueWeekDays = useMemo(() => {
    if (!runs) return [];
    return Array.from(new Set(runs.map((r) => r.week_day).filter(Boolean)));
  }, [runs]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("runs").delete().eq("id", id);
      if (error) throw error;
      toast.success("Run deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["runs"] });
    } catch (error) {
      toast.error("Failed to delete run");
    }
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <PlayCircle className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold text-foreground">Runs</h1>
              </div>
              <p className="text-muted-foreground">
                {isTechnician && technicianName
                  ? `Showing runs assigned to ${technicianName}`
                  : "View all service runs"}
              </p>
            </div>
            {/* Only admins can import/add runs */}
            {!isTechnician && (
              <div className="flex gap-2">
                <Button onClick={() => navigate("/runs/calendar")} variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendar View
                </Button>
                <RunsImportDialog />
                <AddRunDialog />
              </div>
            )}
            {isTechnician && (
              <Button onClick={() => navigate("/runs/calendar")} variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar View
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-2 items-start">
            {/* Technician filter only for admins */}
            {!isTechnician && (
              <div>
                <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                  <SelectTrigger className="w-auto min-w-[160px]">
                    <SelectValue placeholder="All Technicians" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Technicians</SelectItem>
                    {uniqueTechnicians.map((tech) => (
                      <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Select value={weeksFilter} onValueChange={setWeeksFilter}>
                <SelectTrigger className="w-auto min-w-[120px]">
                  <SelectValue placeholder="All Weeks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weeks</SelectItem>
                  {uniqueWeeks.map((week) => (
                    <SelectItem key={week} value={week}>{week}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={weekDayFilter} onValueChange={setWeekDayFilter}>
                <SelectTrigger className="w-auto min-w-[140px]">
                  <SelectValue placeholder="All Week Days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Week Days</SelectItem>
                  {uniqueWeekDays.map((day) => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">Service ID</TableHead>
                    <TableHead className="font-bold">Clients</TableHead>
                    <TableHead className="font-bold">Suburb</TableHead>
                    <TableHead className="font-bold">Weeks</TableHead>
                    <TableHead className="font-bold">Week Day</TableHead>
                    <TableHead className="font-bold">Products</TableHead>
                    <TableHead className="font-bold">Frequency</TableHead>
                    <TableHead className="font-bold">Technicians</TableHead>
                    <TableHead className="font-bold text-center">Completed</TableHead>
                    <TableHead className="font-bold">Completion Date</TableHead>
                    <TableHead className="font-bold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 11 }).map((_, j) => (
                          <TableCell key={j}>
                            <div className="h-4 bg-muted rounded animate-pulse"></div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredRuns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                        {isTechnician && !technicianName
                          ? "Your profile name hasn't been set yet. Ask your admin to set your username."
                          : "No runs found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRuns.map((run) => (
                      <TableRow key={run.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{run.service_id}</TableCell>
                        <TableCell className="font-bold text-primary">{run.clients || "-"}</TableCell>
                        <TableCell>{run.suburb || "-"}</TableCell>
                        <TableCell>{run.weeks || "-"}</TableCell>
                        <TableCell>{run.week_day || "-"}</TableCell>
                        <TableCell>{run.products || "-"}</TableCell>
                        <TableCell>{run.frequency || "-"}</TableCell>
                        <TableCell>{run.technicians || "-"}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={run.completed === "completed" ? "default" : "secondary"}>
                            {run.completed || "pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {run.completion_date ? new Date(run.completion_date).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/customer-service-report?service_id=${run.service_id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {/* Only admins can delete runs */}
                            {!isTechnician && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Run</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this run for{" "}
                                      <strong>{run.service_id}</strong>? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(run.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Runs;
