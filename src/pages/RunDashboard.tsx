import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, ArrowRightLeft, Undo2 } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const RunDashboard = () => {
  const [technician1, setTechnician1] = useState<string>("all");
  const [technician2, setTechnician2] = useState<string>("all");
  const [selectedRuns, setSelectedRuns] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: runs, isLoading } = useQuery({
    queryKey: ["run-dashboard-runs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("runs").select("*");
      if (error) throw error;
      return data;
    },
  });

  const transferMutation = useMutation({
    mutationFn: async ({ runIds, fromTech, toTech }: { runIds: string[]; fromTech: string; toTech: string }) => {
      const updates = runIds.map((id) => {
        const run = runs?.find((r) => r.id === id);
        if (!run) return null;

        // Replace the fromTech name with toTech in the technicians string
        const currentTechs = run.technicians || "";
        const updatedTechs = currentTechs
          .split(",")
          .map((t) => (t.trim().toLowerCase() === fromTech.toLowerCase() ? toTech : t.trim()))
          .join(", ");

        return supabase
          .from("runs")
          .update({
            technicians: updatedTechs,
            original_technicians: run.original_technicians || run.technicians,
            transferred: true,
          })
          .eq("id", id);
      });

      const results = await Promise.all(updates.filter(Boolean));
      const errors = results.filter((r) => r && r.error);
      if (errors.length > 0) throw new Error("Some transfers failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["run-dashboard-runs"] });
      setSelectedRuns(new Set());
      toast.success("Runs transferred successfully");
    },
    onError: () => {
      toast.error("Failed to transfer runs");
    },
  });

  const revertMutation = useMutation({
    mutationFn: async (runIds: string[]) => {
      const updates = runIds.map((id) => {
        const run = runs?.find((r) => r.id === id);
        if (!run || !run.transferred) return null;
        return supabase
          .from("runs")
          .update({
            technicians: run.original_technicians,
            original_technicians: null,
            transferred: false,
          })
          .eq("id", id);
      });
      const results = await Promise.all(updates.filter(Boolean));
      const errors = results.filter((r) => r && r.error);
      if (errors.length > 0) throw new Error("Some reverts failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["run-dashboard-runs"] });
      setSelectedRuns(new Set());
      toast.success("Runs reverted successfully");
    },
    onError: () => {
      toast.error("Failed to revert runs");
    },
  });

  // Extract unique technician names
  const technicianNames = useMemo(() => {
    if (!runs) return [];
    const names = new Set<string>();
    runs.forEach((run) => {
      if (run.technicians) {
        run.technicians.split(",").forEach((t: string) => {
          const trimmed = t.trim();
          if (trimmed) names.add(trimmed);
        });
      }
    });
    return Array.from(names).sort();
  }, [runs]);

  // Filter runs based on Technician A only
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

  const allSelected = filteredRuns.length > 0 && filteredRuns.every((r) => selectedRuns.has(r.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedRuns(new Set());
    } else {
      setSelectedRuns(new Set(filteredRuns.map((r) => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedRuns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedTransferredCount = useMemo(() => {
    if (!runs) return 0;
    return Array.from(selectedRuns).filter((id) => {
      const run = runs.find((r) => r.id === id);
      return run?.transferred === true;
    }).length;
  }, [selectedRuns, runs]);

  const handleTransfer = () => {
    if (technician1 === "all") {
      toast.error("Please select Technician A to transfer from");
      return;
    }
    if (technician2 === "all") {
      toast.error("Please select Technician B to transfer to");
      return;
    }
    if (technician1 === technician2) {
      toast.error("Technician A and B cannot be the same");
      return;
    }
    if (selectedRuns.size === 0) {
      toast.error("Please select at least one run to transfer");
      return;
    }
    transferMutation.mutate({
      runIds: Array.from(selectedRuns),
      fromTech: technician1,
      toTech: technician2,
    });
  };

  const handleRevert = () => {
    const transferredIds = Array.from(selectedRuns).filter((id) => {
      const run = runs?.find((r) => r.id === id);
      return run?.transferred === true;
    });
    if (transferredIds.length === 0) {
      toast.error("No transferred runs selected to revert");
      return;
    }
    revertMutation.mutate(transferredIds);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Run Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of all service runs — transfer runs between technicians</p>
      </div>

      {/* Technician Filters & Transfer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Technician Transfer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Technician A (From)</label>
              <Select value={technician1} onValueChange={(v) => { setTechnician1(v); setSelectedRuns(new Set()); }}>
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
              <label className="text-sm font-medium text-foreground">Technician B (To)</label>
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
            <Button
              onClick={handleTransfer}
              disabled={transferMutation.isPending || selectedRuns.size === 0}
              className="gap-2"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Transfer {selectedRuns.size > 0 ? `(${selectedRuns.size})` : ""}
            </Button>
            <Button
              variant="outline"
              onClick={handleRevert}
              disabled={revertMutation.isPending || selectedTransferredCount === 0}
              className="gap-2"
            >
              <Undo2 className="h-4 w-4" />
              Revert {selectedTransferredCount > 0 ? `(${selectedTransferredCount})` : ""}
            </Button>
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
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
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
                  {filteredRuns.map((run) => {
                    const isTransferred = run.transferred === true;
                    return (
                      <TableRow
                        key={run.id}
                        className={isTransferred ? "bg-red-50 dark:bg-red-950/30" : ""}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedRuns.has(run.id)}
                            onCheckedChange={() => toggleSelect(run.id)}
                            aria-label={`Select run ${run.service_id}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{run.service_id}</TableCell>
                        <TableCell>{run.clients || "—"}</TableCell>
                        <TableCell>
                          <span className={isTransferred ? "text-destructive font-semibold" : ""}>
                            {run.technicians || "—"}
                          </span>
                          {isTransferred && run.original_technicians && (
                            <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200">
                              ↩ {run.original_technicians}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{run.week_day || "—"}</TableCell>
                        <TableCell>{run.weeks || "—"}</TableCell>
                        <TableCell>{run.suburb || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={run.completed === "completed" ? "default" : "secondary"}>
                            {run.completed === "completed" ? "Completed" : "Pending"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
