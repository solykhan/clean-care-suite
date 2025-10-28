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

const DATABASE_COLUMNS = [
  { value: "service_id", label: "Service ID (Required)" },
  { value: "site_name", label: "Site Name (Required)" },
  { value: "site_street_name", label: "Street Name" },
  { value: "site_suburb", label: "Suburb" },
  { value: "site_post_code", label: "Post Code" },
  { value: "site_email_address", label: "Email Address" },
  { value: "site_fax_no", label: "Fax No" },
  { value: "postal_address", label: "Postal Address" },
  { value: "site_contact_first_name", label: "Contact First Name" },
  { value: "site_contact_lastname", label: "Contact Last Name" },
  { value: "site_accounts_contact", label: "Accounts Contact" },
  { value: "site_telephone_no1", label: "Telephone No 1" },
  { value: "site_telephone_no2", label: "Telephone No 2" },
  { value: "site_pobox", label: "PO Box" },
  { value: "delete_tag", label: "Delete Tag" },
  { value: "contract_date", label: "Contract Date" },
  { value: "date_cancel", label: "Date Cancel" },
  { value: "contract_notes", label: "Contract Notes" },
  { value: "notes", label: "Notes" },
  { value: "skip", label: "-- Skip Column --" }
];

export function CustomerImportDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<"upload" | "mapping">("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError("");
      
      try {
        const text = await selectedFile.text();
        const lines = text.split("\n").filter(line => line.trim());
        const headers = lines[0].split(",").map(h => h.trim());
        
        setCsvHeaders(headers);
        const initialMapping: Record<string, string> = {};
        headers.forEach(header => {
          const normalized = header.toLowerCase().replace(/\s+/g, '_');
          const match = DATABASE_COLUMNS.find(col => col.value === normalized);
          initialMapping[header] = match ? match.value : "skip";
        });
        setColumnMapping(initialMapping);
        
        const data = lines.slice(1).map(line => {
          const values = line.split(",").map(v => v.trim());
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || "";
          });
          return obj;
        });
        setCsvData(data);
      } catch (err) {
        setError("Failed to parse CSV file. Please check the file format.");
      }
    }
  };

  const handleNext = () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }
    setStep("mapping");
  };

  const validateMapping = () => {
    const mappedColumns = Object.values(columnMapping).filter(v => v !== "skip");
    const hasServiceId = mappedColumns.includes("service_id");
    const hasSiteName = mappedColumns.includes("site_name");
    
    if (!hasServiceId || !hasSiteName) {
      setError("Service ID and Site Name are required fields. Please map them from your CSV columns.");
      return false;
    }
    
    setError("");
    return true;
  };

  const handleImport = async () => {
    if (!validateMapping()) {
      return;
    }

    setImporting(true);
    try {
      const mappedData = csvData.map(row => {
        const obj: any = {};
        Object.entries(columnMapping).forEach(([csvCol, dbCol]) => {
          if (dbCol !== "skip" && row[csvCol]) {
            obj[dbCol] = row[csvCol];
          }
        });
        return obj;
      });

      const { error } = await supabase.from("customers").insert(mappedData);

      if (error) throw error;

      toast.success("Import successful", {
        description: `${mappedData.length} customers imported successfully`,
      });

      setOpen(false);
      resetDialog();
      window.location.reload();
    } catch (error: any) {
      setError(error.message);
      toast.error("Import failed", {
        description: error.message,
      });
    } finally {
      setImporting(false);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setStep("upload");
    setCsvHeaders([]);
    setCsvData([]);
    setColumnMapping({});
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetDialog();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Customer Data - {step === "upload" ? "Step 1: Upload File" : "Step 2: Map Fields"}</DialogTitle>
          <DialogDescription>
            {step === "upload" 
              ? "Upload a CSV file with customer data. The first row should contain column headers."
              : "Map your CSV columns to the database fields. Service ID and Site Name are required."}
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
              <Label htmlFor="csv-file">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({csvHeaders.length} columns, {csvData.length} rows)
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              {csvHeaders.map((header, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 items-center">
                  <Label className="text-right font-medium">{header}</Label>
                  <Select
                    value={columnMapping[header] || "skip"}
                    onValueChange={(value) => {
                      setColumnMapping(prev => ({ ...prev, [header]: value }));
                      setError("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATABASE_COLUMNS.map(col => (
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
          <Button variant="outline" onClick={() => {
            if (step === "mapping") {
              setStep("upload");
              setError("");
            } else {
              setOpen(false);
              resetDialog();
            }
          }}>
            {step === "mapping" ? "Back" : "Cancel"}
          </Button>
          {step === "upload" ? (
            <Button onClick={handleNext} disabled={!file}>
              Next
            </Button>
          ) : (
            <Button onClick={handleImport} disabled={importing}>
              {importing ? "Importing..." : "Import"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
