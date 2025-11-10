import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";

const RunsCalendar = () => {
  const navigate = useNavigate();
  const [technicianFilter, setTechnicianFilter] = useState<string>("all");
  const [weeksFilter, setWeeksFilter] = useState<string>("all");

  const { data: runs, isLoading } = useQuery({
    queryKey: ["runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("runs")
        .select("*")
        .order("week_day", { ascending: true });
      
      if (error) {
        toast.error("Failed to load runs");
        throw error;
      }
      return data;
    },
  });

  const uniqueTechnicians = useMemo(() => {
    if (!runs) return [];
    return Array.from(new Set(runs.map(r => r.technicians).filter(Boolean)));
  }, [runs]);

  const uniqueWeeks = useMemo(() => {
    if (!runs) return [];
    return Array.from(new Set(runs.map(r => r.weeks).filter(Boolean)));
  }, [runs]);

  const filteredRuns = useMemo(() => {
    if (!runs) return [];
    
    return runs.filter((run) => {
      const matchesTechnician = technicianFilter === "all" || run.technicians === technicianFilter;
      const matchesWeeks = weeksFilter === "all" || run.weeks === weeksFilter;
      return matchesTechnician && matchesWeeks && !run.completed;
    });
  }, [runs, technicianFilter, weeksFilter]);

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const runsByDay = useMemo(() => {
    const grouped: { [key: string]: typeof runs } = {};
    weekDays.forEach(day => {
      grouped[day] = filteredRuns?.filter(run => run.week_day === day) || [];
    });
    return grouped;
  }, [filteredRuns]);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold text-foreground">Runs Calendar</h1>
              </div>
              <p className="text-muted-foreground">Weekly schedule view</p>
            </div>
            <Button onClick={() => navigate("/runs")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          </div>

          <div className="flex gap-4 flex-wrap mb-6">
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
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-muted rounded animate-pulse w-24"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-20 bg-muted rounded animate-pulse"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weekDays.map((day) => (
              <Card key={day} className="flex flex-col h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{day}</span>
                    <Badge variant="secondary">{runsByDay[day].length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  {runsByDay[day].length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No runs scheduled</p>
                  ) : (
                    runsByDay[day].map((run) => (
                      <Card 
                        key={run.id} 
                        className="p-3 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary"
                        onClick={() => navigate(`/customer-service-report?service_id=${run.service_id}`)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{run.service_id}</span>
                            <Badge variant="outline" className="text-xs">{run.weeks}</Badge>
                          </div>
                          
                          <div className="text-xs space-y-1">
                            <p className="font-medium text-foreground">{run.clients}</p>
                            {run.suburb && (
                              <p className="text-muted-foreground">{run.suburb}</p>
                            )}
                            {run.technicians && (
                              <div className="flex items-center gap-1 text-primary">
                                <PlayCircle className="h-3 w-3" />
                                <span>{run.technicians}</span>
                              </div>
                            )}
                            {run.products && (
                              <p className="text-muted-foreground truncate" title={run.products}>
                                {run.products}
                              </p>
                            )}
                            {run.frequency && (
                              <Badge variant="secondary" className="text-xs">{run.frequency}</Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RunsCalendar;
