import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Run = {
  id: string;
  weeks: string | null;
  week_day: string | null;
  clients: string | null;
  suburb: string | null;
  products: string | null;
  frequency: string | null;
  technicians: string | null;
  completed: boolean | null;
};

const Runs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newRun, setNewRun] = useState({
    weeks: "",
    week_day: "",
    clients: "",
    suburb: "",
    products: "",
    frequency: "",
    technicians: "",
    completed: false,
  });

  const { data: runs, isLoading } = useQuery({
    queryKey: ["runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("runs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Run[];
    },
  });

  const addRunMutation = useMutation({
    mutationFn: async (run: typeof newRun) => {
      const { error } = await supabase.from("runs").insert([run]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runs"] });
      setNewRun({
        weeks: "",
        week_day: "",
        clients: "",
        suburb: "",
        products: "",
        frequency: "",
        technicians: "",
        completed: false,
      });
      toast({
        title: "Success",
        description: "Run added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add run: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteRunMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("runs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runs"] });
      toast({
        title: "Success",
        description: "Run deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete run: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRunMutation.mutate(newRun);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this run?")) {
      deleteRunMutation.mutate(id);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Run</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Weeks</label>
                <Input
                  value={newRun.weeks}
                  onChange={(e) => setNewRun({ ...newRun, weeks: e.target.value })}
                  placeholder="Enter weeks"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Week Day</label>
                <Input
                  value={newRun.week_day}
                  onChange={(e) => setNewRun({ ...newRun, week_day: e.target.value })}
                  placeholder="Enter week day"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Clients</label>
                <Input
                  value={newRun.clients}
                  onChange={(e) => setNewRun({ ...newRun, clients: e.target.value })}
                  placeholder="Enter clients"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Suburb</label>
                <Input
                  value={newRun.suburb}
                  onChange={(e) => setNewRun({ ...newRun, suburb: e.target.value })}
                  placeholder="Enter suburb"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Products</label>
                <Input
                  value={newRun.products}
                  onChange={(e) => setNewRun({ ...newRun, products: e.target.value })}
                  placeholder="Enter products"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Frequency</label>
                <Input
                  value={newRun.frequency}
                  onChange={(e) => setNewRun({ ...newRun, frequency: e.target.value })}
                  placeholder="Enter frequency"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Technicians</label>
                <Input
                  value={newRun.technicians}
                  onChange={(e) => setNewRun({ ...newRun, technicians: e.target.value })}
                  placeholder="Enter technicians"
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="completed"
                    checked={newRun.completed}
                    onCheckedChange={(checked) =>
                      setNewRun({ ...newRun, completed: checked as boolean })
                    }
                  />
                  <label htmlFor="completed" className="text-sm font-medium">
                    Completed
                  </label>
                </div>
              </div>
            </div>
            <Button type="submit" className="gap-2" disabled={addRunMutation.isPending}>
              <Plus className="h-4 w-4" />
              Add Run
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Runs Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold border-r">Weeks</TableHead>
                  <TableHead className="font-bold border-r">Week Day</TableHead>
                  <TableHead className="font-bold border-r">Clients</TableHead>
                  <TableHead className="font-bold border-r">Suburb</TableHead>
                  <TableHead className="font-bold border-r">Products</TableHead>
                  <TableHead className="font-bold border-r">Frequency</TableHead>
                  <TableHead className="font-bold border-r">Technicians</TableHead>
                  <TableHead className="font-bold border-r">Completed</TableHead>
                  <TableHead className="font-bold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading runs...
                    </TableCell>
                  </TableRow>
                ) : runs && runs.length > 0 ? (
                  runs.map((run) => (
                    <TableRow key={run.id} className="hover:bg-muted/30">
                      <TableCell className="border-r">{run.weeks || "-"}</TableCell>
                      <TableCell className="border-r">{run.week_day || "-"}</TableCell>
                      <TableCell className="border-r">{run.clients || "-"}</TableCell>
                      <TableCell className="border-r">{run.suburb || "-"}</TableCell>
                      <TableCell className="border-r">{run.products || "-"}</TableCell>
                      <TableCell className="border-r">{run.frequency || "-"}</TableCell>
                      <TableCell className="border-r">{run.technicians || "-"}</TableCell>
                      <TableCell className="border-r text-center">
                        <Checkbox checked={run.completed || false} disabled />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(run.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No runs found. Add your first run above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Runs;
