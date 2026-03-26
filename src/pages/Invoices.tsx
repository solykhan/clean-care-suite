import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Plus, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { AddInvoiceDialog } from "@/components/AddInvoiceDialog";
import { InvoiceImportDialog } from "@/components/InvoiceImportDialog";

type Invoice = {
  id: string;
  inv_id: string;
  entry_date: string | null;
  particulars: string | null;
  user_date: string | null;
  created_at: string;
};

export default function Invoices() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Invoice[];
    },
  });

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return invoices;
    const q = searchTerm.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.inv_id?.toLowerCase().includes(q) ||
        inv.particulars?.toLowerCase().includes(q)
    );
  }, [invoices, searchTerm]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("invoices").delete().eq("id", deleteId);
      if (error) throw error;
      toast.success("Invoice deleted");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    } catch (e: any) {
      toast.error("Delete failed", { description: e.message });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const formatDate = (val: string | null) => {
    if (!val) return "—";
    try {
      return format(new Date(val), "dd-MM-yyyy");
    } catch {
      return val;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
            <p className="text-sm text-muted-foreground">{invoices.length} records</p>
          </div>
        </div>
        <div className="flex gap-2">
          <InvoiceImportDialog />
          <AddInvoiceDialog />
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by invoice ID or particulars..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
            <FileText className="h-10 w-10 opacity-30" />
            <p>{searchTerm ? "No invoices match your search." : "No invoices yet. Add one or import."}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Entry Date</TableHead>
                <TableHead>Particulars</TableHead>
                <TableHead>User Date</TableHead>
                <TableHead className="w-16 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.inv_id}</TableCell>
                  <TableCell>{formatDate(inv.entry_date)}</TableCell>
                  <TableCell className="max-w-xs truncate">{inv.particulars || "—"}</TableCell>
                  <TableCell>{formatDate(inv.user_date)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(inv.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The invoice record will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
