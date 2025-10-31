import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PlayCircle } from "lucide-react";
import { toast } from "sonner";

const Runs = () => {
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
          <div className="flex items-center gap-3 mb-2">
            <PlayCircle className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Runs</h1>
          </div>
          <p className="text-muted-foreground">View all service runs</p>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 9 }).map((_, j) => (
                          <TableCell key={j}>
                            <div className="h-4 bg-muted rounded animate-pulse"></div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : runs?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No runs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    runs?.map((run) => (
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
