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
import * as XLSX from "xlsx";

const DATABASE_COLUMNS = [
  { value: "service_id", label: "Service ID (Required)" },
  { value: "clients", label: "Clients" },
  { value: "suburb", label: "Suburb" },
  { value: "weeks", label: "Weeks" },
  { value: "week_day", label: "Week Day" },
  { value: "products", label: "Products" },
  { value: "frequency", label: "Frequency" },
  { value: "technicians", label: "Technicians" },
  { value: "completed", label: "Completed" },
  { value: "skip", label: "-- Skip Column --" }
];

export function RunsImportDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<"upload" | "mapping">("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>("");
  const [unmappedColumns, setUnmappedColumns] = useState<string[]>([]);
  const [missingRequired, setMissingRequired] = useState<string[]>([]);
  const [isAIMapping, setIsAIMapping] = useState(false);

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter(line => line.trim());
    const headers = lines[0].split(",").map(h => h.trim());
    
    const data = lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || "";
      });
      return obj;
    });
    
    return { headers, data };
  };

  const parseXLSX = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
    
    const headers = jsonData[0].map((h: any) => String(h).trim());
    const data = jsonData.slice(1).map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] ? String(row[index]).trim() : "";
      });
      return obj;
    });
    
    return { headers, data };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError("");
      
      try {
        let headers: string[];
        let data: any[];
        
        if (selectedFile.name.endsWith('.csv')) {
          const text = await selectedFile.text();
          const parsed = parseCSV(text);
          headers = parsed.headers;
          data = parsed.data;
        } else if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
          const parsed = await parseXLSX(selectedFile);
          headers = parsed.headers;
          data = parsed.data;
        } else {
          setError("Unsupported file format. Please upload a CSV or XLSX file.");
          return;
        }
        
        setCsvHeaders(headers);
        setCsvData(data);
        
        // Try AI-powered mapping first
        setIsAIMapping(true);
        try {
          const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-map-columns', {
            body: {
              csvHeaders: headers,
              databaseColumns: DATABASE_COLUMNS.map(col => col.value)
            }
          });

          if (aiError) throw aiError;

          const aiMapping = aiData.mapping;
          const finalMapping: Record<string, string> = {};
          const unmapped: string[] = [];
          
          headers.forEach(header => {
            const aiSuggestion = aiMapping[header];
            if (aiSuggestion && aiSuggestion !== 'skip' && DATABASE_COLUMNS.find(col => col.value === aiSuggestion)) {
              finalMapping[header] = aiSuggestion;
            } else {
              finalMapping[header] = "skip";
              unmapped.push(header);
            }
          });
          
          setColumnMapping(finalMapping);
          setUnmappedColumns(unmapped);
          
          // Validate required fields
          const mappedValues = Object.values(finalMapping);
          const missing: string[] = [];
          if (!mappedValues.includes("service_id")) missing.push("Service ID");
          setMissingRequired(missing);
          
          if (missing.length === 0) {
            toast.success("Auto-mapping successful - all required fields mapped");
          }
        } catch (error) {
          console.error('AI mapping failed, using basic mapping:', error);
          // Fallback to basic mapping
          const initialMapping: Record<string, string> = {};
          const unmapped: string[] = [];
          
          headers.forEach(header => {
            const normalized = header.toLowerCase().replace(/\s+/g, '_');
            const match = DATABASE_COLUMNS.find(col => col.value === normalized);
            if (match) {
              initialMapping[header] = match.value;
            } else {
              initialMapping[header] = "skip";
              unmapped.push(header);
            }
          });
          
          setColumnMapping(initialMapping);
          setUnmappedColumns(unmapped);
          
          const mappedValues = Object.values(initialMapping);
          const missing: string[] = [];
          if (!mappedValues.includes("service_id")) missing.push("Service ID");
          setMissingRequired(missing);
        } finally {
          setIsAIMapping(false);
        }
      } catch (err) {
        setError("Failed to parse file. Please check the file format.");
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
    const mappedValues = Object.values(columnMapping);
    const missing: string[] = [];
    
    if (!mappedValues.includes("service_id")) missing.push("Service ID");
    
    setMissingRequired(missing);
    
    if (missing.length > 0) {
      setError(`Required fields not mapped: ${missing.join(", ")}. Please map them to proceed.`);
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
      const allMappedData = csvData.map((row, index) => {
        const obj: any = { _rowIndex: index + 2 };
        Object.entries(columnMapping).forEach(([csvCol, dbCol]) => {
          if (dbCol !== "skip" && row[csvCol]) {
            // Convert completed to boolean
            if (dbCol === "completed") {
              const value = String(row[csvCol]).toLowerCase();
              obj[dbCol] = value === 'true' || value === '1' || value === 'yes';
            } else {
              obj[dbCol] = row[csvCol];
            }
          }
        });
        return obj;
      });

      // Filter out rows missing required fields
      const validData = allMappedData.filter(row => {
        const hasServiceId = row.service_id && String(row.service_id).trim() !== '';
        return hasServiceId;
      });

      const skippedRows = allMappedData.filter(row => {
        const hasServiceId = row.service_id && String(row.service_id).trim() !== '';
        return !hasServiceId;
      });

      // Remove the _rowIndex field before inserting
      const dataToInsert = validData.map(({ _rowIndex, ...row }) => row);

      if (dataToInsert.length === 0) {
        setError("No valid rows to import. All rows are missing the required Service ID field.");
        return;
      }

      const { error } = await supabase.from("runs").insert(dataToInsert);

      if (error) throw error;

      let successMessage = `${dataToInsert.length} runs imported successfully`;
      if (skippedRows.length > 0) {
        const skippedRowNumbers = skippedRows.map(row => row._rowIndex).join(', ');
        successMessage += `. ${skippedRows.length} rows skipped (missing Service ID) at rows: ${skippedRowNumbers}`;
      }

      toast.success("Import successful", {
        description: successMessage,
        duration: 5000,
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
    setUnmappedColumns([]);
    setMissingRequired([]);
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
          <DialogTitle>Import Runs Data - {step === "upload" ? "Step 1: Upload File" : "Step 2: Map Fields"}</DialogTitle>
          <DialogDescription>
            {step === "upload" 
              ? "Upload a CSV or XLSX file with runs data. The first row should contain column headers."
              : "Map your file columns to the database fields. Service ID is required."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Mapping Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {step === "mapping" && (missingRequired.length > 0 || unmappedColumns.length > 0) && !error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Mapping Status</AlertTitle>
            <AlertDescription>
              {missingRequired.length > 0 && (
                <div className="mb-2">
                  <strong>Required fields not mapped:</strong> {missingRequired.join(", ")}
                </div>
              )}
              {unmappedColumns.length > 0 && (
                <div>
                  <strong>Columns not auto-mapped (set to skip):</strong> {unmappedColumns.join(", ")}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {step === "upload" ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv,.xlsx,.xls"
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
                      const newMapping = { ...columnMapping, [header]: value };
                      setColumnMapping(newMapping);
                      
                      // Re-validate
                      const mappedValues = Object.values(newMapping);
                      const missing: string[] = [];
                      if (!mappedValues.includes("service_id")) missing.push("Service ID");
                      setMissingRequired(missing);
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
