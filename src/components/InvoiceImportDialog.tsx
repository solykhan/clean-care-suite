import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { parseXLSX } from "@/lib/parseXLSX";
import { useQueryClient } from "@tanstack/react-query";

const DATABASE_COLUMNS = [
  { value: "inv_id", label: "Invoice ID (Required)" },
  { value: "entry_date", label: "Entry Date" },
  { value: "particulars", label: "Particulars" },
  { value: "user_date", label: "User Date" },
  { value: "skip", label: "-- Skip Column --" },
];

export function InvoiceImportDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<"upload" | "mapping">("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>("");

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter((l) => l.trim());
    const headers = lines[0].split(",").map((h) => h.trim());
    const data = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const obj: any = {};
      headers.forEach((h, i) => (obj[h] = values[i] || ""));
      return obj;
    });
    return { headers, data };
  };

  const convertDate = (value: any): string | null => {
    if (!value) return null;
    if (typeof value === "string" && value.includes("-")) return value;
    const num = Number(value);
    if (!isNaN(num) && num > 0) {
      const epoch = new Date(1899, 11, 30);
      const d = new Date(epoch.getTime() + num * 86400000);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError("");

    try {
      let headers: string[];
      let data: any[];

      if (selectedFile.name.endsWith(".csv")) {
        const parsed = parseCSV(await selectedFile.text());
        headers = parsed.headers;
        data = parsed.data;
      } else if (selectedFile.name.match(/\.xlsx?$/)) {
        const parsed = await parseXLSX(selectedFile);
        headers = parsed.headers;
        data = parsed.data;
      } else {
        setError("Unsupported file format. Please upload a CSV or XLSX file.");
        return;
      }

      setCsvHeaders(headers);
      setCsvData(data);

      // Auto-map columns
      const mapping: Record<string, string> = {};
      headers.forEach((h) => {
        const norm = h.toLowerCase().replace(/[\s-]/g, "_");
        const match = DATABASE_COLUMNS.find((c) => c.value === norm);
        mapping[h] = match ? match.value : "skip";
      });
      setColumnMapping(mapping);
    } catch {
      setError("Failed to parse file. Please check the file format.");
    }
  };

  const handleImport = async () => {
    const mappedValues = Object.values(columnMapping);
    if (!mappedValues.includes("inv_id")) {
      setError("Invoice ID column must be mapped before importing.");
      return;
    }

    setImporting(true);
    try {
      const rows = csvData
        .map((row) => {
          const obj: any = {};
          Object.entries(columnMapping).forEach(([csvCol, dbCol]) => {
            if (dbCol === "skip" || !row[csvCol]) return;
            if (dbCol === "entry_date" || dbCol === "user_date") {
              obj[dbCol] = convertDate(row[csvCol]);
            } else {
              obj[dbCol] = row[csvCol];
            }
          });
          return obj;
        })
        .filter((r) => r.inv_id && String(r.inv_id).trim() !== "");

      if (rows.length === 0) {
        setError("No valid rows to import (all rows missing Invoice ID).");
        return;
      }

      const { error } = await supabase.from("invoices").insert(rows);
      if (error) throw error;

      toast.success(`${rows.length} invoices imported successfully`);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setOpen(false);
      reset();
    } catch (e: any) {
      setError(e.message);
      toast.error("Import failed", { description: e.message });
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setStep("upload");
    setCsvHeaders([]);
    setCsvData([]);
    setColumnMapping({});
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Import Invoices — {step === "upload" ? "Step 1: Upload File" : "Step 2: Map Columns"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload"
              ? "Upload a CSV or XLSX file. The first row must contain column headers."
              : "Map your file columns to the invoice fields. Invoice ID is required."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "upload" ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inv-file">CSV or XLSX File</Label>
              <Input id="inv-file" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                {file.name} — {csvHeaders.length} columns, {csvData.length} rows
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="grid gap-3">
              {csvHeaders.map((header, i) => (
                <div key={i} className="grid grid-cols-2 gap-4 items-center">
                  <Label className="font-medium truncate">{header}</Label>
                  <Select
                    value={columnMapping[header] || "skip"}
                    onValueChange={(val) => {
                      setColumnMapping((prev) => ({ ...prev, [header]: val }));
                      setError("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATABASE_COLUMNS.map((col) => (
                        <SelectItem key={col.value} value={col.value}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (step === "mapping") { setStep("upload"); setError(""); }
              else { setOpen(false); reset(); }
            }}
          >
            {step === "mapping" ? "Back" : "Cancel"}
          </Button>
          {step === "upload" ? (
            <Button onClick={() => setStep("mapping")} disabled={!file}>
              Next
            </Button>
          ) : (
            <Button onClick={handleImport} disabled={importing}>
              {importing ? "Importing…" : "Import"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
