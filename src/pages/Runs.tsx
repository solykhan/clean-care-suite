import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PlayCircle, Edit } from "lucide-react";
import { toast } from "sonner";
import { RunsImportDialog } from "@/components/RunsImportDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Runs = () => {
  const navigate = useNavigate();
  const [technicianFilter, setTechnicianFilter] = useState<string>("all");
  const [weeksFilter, setWeeksFilter] = useState<string>("all");
  const [weekDayFilter, setWeekDayFilter] = useState<string>("all");

  const { data: runs, isLoading, error } = useQuery({
    queryKey: ["runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("runs")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        toast.error("Failed to load runs");
        throw error;
      }
      return data;
    },
  });

  const filteredRuns = useMemo(() => {
    if (!runs) return [];
    
    return runs.filter((run) => {
      const matchesTechnician = technicianFilter === "all" || run.technicians === technicianFilter;
      const matchesWeeks = weeksFilter === "all" || run.weeks === weeksFilter;
      const matchesWeekDay = weekDayFilter === "all" || run.week_day === weekDayFilter;
      
      return matchesTechnician && matchesWeeks && matchesWeekDay;
    });
  }, [runs, technicianFilter, weeksFilter, weekDayFilter]);

  const uniqueTechnicians = useMemo(() => {
    if (!runs) return [];
    return Array.from(new Set(runs.map(r => r.technicians).filter(Boolean)));
  }, [runs]);

  const uniqueWeeks = useMemo(() => {
    if (!runs) return [];
    return Array.from(new Set(runs.map(r => r.weeks).filter(Boolean)));
  }, [runs]);

  const uniqueWeekDays = useMemo(() => {
    if (!runs) return [];
    return Array.from(new Set(runs.map(r => r.week_day).filter(Boolean)));
  }, [runs]);

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Runs</CardTitle>
            <CardDescription>Unable to fetch runs data. Please try again.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
              <p className="text-muted-foreground">View all service runs</p>
            </div>
            <RunsImportDialog />
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Technicians</SelectItem>
                  {uniqueTechnicians.map((tech) => (
                    <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <Select value={weeksFilter} onValueChange={setWeeksFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Weeks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weeks</SelectItem>
                  {uniqueWeeks.map((week) => (
                    <SelectItem key={week} value={week}>{week}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <Select value={weekDayFilter} onValueChange={setWeekDayFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Week Day" />
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
                    <TableHead className="font-bold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 10 }).map((_, j) => (
                          <TableCell key={j}>
                            <div className="h-4 bg-muted rounded animate-pulse"></div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredRuns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No runs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRuns.map((run) => (
                      <TableRow key={run.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{run.service_id}</TableCell>
                        <TableCell>{run.clients || "-"}</TableCell>
                        <TableCell>{run.suburb || "-"}</TableCell>
                        <TableCell>{run.weeks || "-"}</TableCell>
                        <TableCell>{run.week_day || "-"}</TableCell>
                        <TableCell>{run.products || "-"}</TableCell>
                        <TableCell>{run.frequency || "-"}</TableCell>
                        <TableCell>{run.technicians || "-"}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox checked={run.completed || false} disabled />
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/customer-service-report?service_id=${run.service_id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
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
