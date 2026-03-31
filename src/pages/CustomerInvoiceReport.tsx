import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ArrowLeft, Printer, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const FREQUENCIES = [
  "MONTHLY", "BI MONTHLY", "QUARTERLY", "WEEKLY", "FORTNIGHTLY",
  "ANNUALLY", "TWICE A WEEK", "PURCHASE", "ONLY RENTAL",
];

const INVOICE_TYPES = [
  "MONTHLY", "BI MONTHLY", "QUARTERLY", "WEEKLY", "FORTNIGHTLY",
  "6 MONTHLY", "ANNUALLY", "PURCHASE ONLY", "RENTAL",
];

const CustomerInvoiceReport = () => {
  const queryClient = useQueryClient();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [savingAgreements, setSavingAgreements] = useState(false);
  const [savingInvoices, setSavingInvoices] = useState(false);
  const [editedAgreements, setEditedAgreements] = useState<Record<string, any>>({});
  const [editedInvoices, setEditedInvoices] = useState<Record<string, any>>({});
  const [newInvoices, setNewInvoices] = useState<any[]>([]);

  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("site_name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const selectedCustomer = customers?.find((c) => c.id === selectedCustomerId);

  const { data: serviceAgreements, isLoading: isLoadingAgreements } = useQuery({
    queryKey: ["report-agreements", selectedCustomer?.service_id],
    queryFn: async () => {
      if (!selectedCustomer?.service_id) return [];
      const { data, error } = await supabase
        .from("service_agreements")
        .select("*")
        .eq("service_id", selectedCustomer.service_id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCustomer?.service_id,
  });

  const { data: invoices } = useQuery({
    queryKey: ["report-invoices", selectedCustomer?.service_id],
    queryFn: async () => {
      if (!selectedCustomer?.service_id) return [];
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("inv_id", selectedCustomer.service_id)
        .order("entry_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCustomer?.service_id,
  });

  const filteredCustomers = customers?.filter(
    (customer) =>
      customer.site_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.service_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.site_suburb?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agreement editing helpers
  const getAgreementValue = (agreement: any, field: string) => {
    if (editedAgreements[agreement.id]?.[field] !== undefined) {
      return editedAgreements[agreement.id][field];
    }
    return agreement[field] ?? "";
  };

  const setAgreementValue = (id: string, field: string, value: any) => {
    setEditedAgreements((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  // Invoice editing helpers
  const getInvoiceValue = (invoice: any, field: string) => {
    if (editedInvoices[invoice.id]?.[field] !== undefined) {
      return editedInvoices[invoice.id][field];
    }
    return invoice[field] ?? "";
  };

  const setInvoiceValue = (id: string, field: string, value: any) => {
    setEditedInvoices((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSaveAgreements = async () => {
    const ids = Object.keys(editedAgreements);
    if (ids.length === 0) { toast.info("No changes to save"); return; }
    setSavingAgreements(true);
    try {
      for (const id of ids) {
        const changes = editedAgreements[id];
        const numericFields = ["unit_price", "cpm_pricing", "cpi", "total"];
        const payload: any = {};
        for (const [key, val] of Object.entries(changes)) {
          payload[key] = numericFields.includes(key)
            ? (val ? parseFloat(val as string) : null)
            : (val || null);
        }
        const { error } = await supabase.from("service_agreements").update(payload).eq("id", id);
        if (error) throw error;
      }
      toast.success("Service agreements saved");
      setEditedAgreements({});
      queryClient.invalidateQueries({ queryKey: ["report-agreements"] });
    } catch (e: any) {
      toast.error("Save failed", { description: e.message });
    } finally {
      setSavingAgreements(false);
    }
  };

  const handleSaveInvoices = async () => {
    const hasEdits = Object.keys(editedInvoices).length > 0;
    const hasNew = newInvoices.length > 0;
    if (!hasEdits && !hasNew) { toast.info("No changes to save"); return; }
    setSavingInvoices(true);
    try {
      // Update existing
      for (const id of Object.keys(editedInvoices)) {
        const changes = editedInvoices[id];
        const { error } = await supabase.from("invoices").update(changes).eq("id", id);
        if (error) throw error;
      }
      // Insert new
      for (const inv of newInvoices) {
        if (!inv.particulars && !inv.entry_date && !inv.user_date) continue;
        const { error } = await supabase.from("invoices").insert({
          inv_id: selectedCustomer!.service_id,
          entry_date: inv.entry_date || null,
          particulars: inv.particulars || null,
          user_date: inv.user_date || null,
        });
        if (error) throw error;
      }
      toast.success("Invoices saved");
      setEditedInvoices({});
      setNewInvoices([]);
      queryClient.invalidateQueries({ queryKey: ["report-invoices"] });
    } catch (e: any) {
      toast.error("Save failed", { description: e.message });
    } finally {
      setSavingInvoices(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Invoice deleted");
    queryClient.invalidateQueries({ queryKey: ["report-invoices"] });
  };

  const addNewInvoice = () => {
    setNewInvoices((prev) => [...prev, {
      entry_date: "",
      particulars: "",
      user_date: format(new Date(), "yyyy-MM-dd"),
    }]);
  };

  const handlePrint = () => window.print();

  // Customer list view
  if (!selectedCustomerId) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Customer Invoice Report</h1>
          <p className="text-muted-foreground mt-1">Select a customer to generate their report</p>
        </div>

        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID or suburb..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoadingCustomers ? (
              <div className="p-6 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold w-16"></TableHead>
                      <TableHead className="font-bold">ID</TableHead>
                      <TableHead className="font-bold">Name of Customer</TableHead>
                      <TableHead className="font-bold">Suburb</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers && filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer, index) => (
                        <TableRow
                          key={customer.id}
                          className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                        >
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-3 text-xs font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                              onClick={() => {
                                setSelectedCustomerId(customer.id);
                                setEditedAgreements({});
                                setEditedInvoices({});
                                setNewInvoices([]);
                              }}
                            >
                              Go
                            </Button>
                          </TableCell>
                          <TableCell className="font-mono text-sm font-semibold">
                            {customer.service_id}
                          </TableCell>
                          <TableCell className="font-medium">{customer.site_name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {customer.site_suburb || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No customers found{searchTerm ? ` matching "${searchTerm}"` : ""}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Report / Edit view
  return (
    <div className="container mx-auto p-6 space-y-4">
      {/* Screen-only controls */}
      <div className="flex items-center gap-3 print:hidden">
        <Button variant="ghost" size="sm" onClick={() => setSelectedCustomerId(null)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-1" /> Print Report
        </Button>
      </div>

      {isLoadingAgreements ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="bg-white text-black border rounded-lg shadow-sm print:shadow-none print:border-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-white px-8 py-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold italic text-gray-800 tracking-wide">HyTrack</h1>
                <p className="text-xs text-gray-600 mt-1">CPM Hygiene Services Foundry Road Seven Hills NSW</p>
              </div>
              <span className="text-2xl font-bold text-blue-700">{selectedCustomer?.service_id}</span>
            </div>
            <h2 className="text-lg font-bold text-blue-700 mt-2">{selectedCustomer?.site_name}</h2>
          </div>

          {/* Customer Info Bar */}
          <div className="px-8 py-3 text-xs border-b bg-gray-50 grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <span className="font-bold">Onsite Contact 1: </span>
              <span>{selectedCustomer?.site_contact_first_name} {selectedCustomer?.site_contact_lastname}</span>
            </div>
            <div>
              <span className="font-bold">Email: </span>
              <span>{selectedCustomer?.site_email_address || ""}</span>
            </div>
            <div>
              <span className="font-bold">Telephone: </span>
              <span>{selectedCustomer?.site_telephone_no1 || ""}</span>
            </div>
            <div>
              <span className="font-bold">Accounts: </span>
              <span>{selectedCustomer?.site_accounts_contact || ""}</span>
            </div>
            <div className="col-span-2">
              <span className="font-bold">Address: </span>
              <span>
                {[selectedCustomer?.site_street_name, selectedCustomer?.site_suburb, selectedCustomer?.site_post_code]
                  .filter(Boolean).join(", ")}
              </span>
            </div>
          </div>

          {/* Service Agreements Editable Table */}
          <div className="px-4 py-4 print:hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Service Agreements</h3>
              <Button
                size="sm"
                onClick={handleSaveAgreements}
                disabled={savingAgreements || Object.keys(editedAgreements).length === 0}
                className="gap-1"
              >
                <Save className="h-3.5 w-3.5" />
                {savingAgreements ? "Saving…" : "Save Agreements"}
              </Button>
            </div>
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-blue-50 border-b">
                    <th className="px-2 py-2 text-left font-bold">ServiceID</th>
                    <th className="px-2 py-2 text-left font-bold min-w-[180px]">Products</th>
                    <th className="px-2 py-2 text-left font-bold">Service Frequency</th>
                    <th className="px-2 py-2 text-left font-bold">Status</th>
                    <th className="px-2 py-2 text-left font-bold">Site Locations</th>
                    <th className="px-2 py-2 text-center font-bold">Client Device</th>
                    <th className="px-2 py-2 text-center font-bold">CPM Device</th>
                    <th className="px-2 py-2 text-right font-bold">Unit Price</th>
                    <th className="px-2 py-2 text-right font-bold">CPM Price</th>
                    <th className="px-2 py-2 text-right font-bold">CPI</th>
                    <th className="px-2 py-2 text-left font-bold">Invoice Type</th>
                    <th className="px-2 py-2 text-left font-bold min-w-[120px]">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceAgreements && serviceAgreements.length > 0 ? (
                    serviceAgreements.map((a, i) => (
                      <tr key={a.id} className={i % 2 === 0 ? "bg-white" : "bg-blue-50/30"}>
                        <td className="px-2 py-1 font-mono font-semibold">{a.service_id}</td>
                        <td className="px-1 py-1">
                          <Input
                            className="h-7 text-xs border-gray-300"
                            value={getAgreementValue(a, "products")}
                            onChange={(e) => setAgreementValue(a.id, "products", e.target.value)}
                          />
                        </td>
                        <td className="px-1 py-1">
                          <select
                            className="h-7 text-xs border border-gray-300 rounded px-1 w-full bg-white"
                            value={getAgreementValue(a, "service_frequency")}
                            onChange={(e) => setAgreementValue(a.id, "service_frequency", e.target.value)}
                          >
                            <option value="">—</option>
                            {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </td>
                        <td className="px-1 py-1">
                          <select
                            className="h-7 text-xs border border-gray-300 rounded px-1 w-full bg-white"
                            value={getAgreementValue(a, "service_active_inactive")}
                            onChange={(e) => setAgreementValue(a.id, "service_active_inactive", e.target.value)}
                          >
                            <option value="Active">ACT</option>
                            <option value="Inactive">INA</option>
                          </select>
                        </td>
                        <td className="px-1 py-1">
                          <Input
                            className="h-7 text-xs border-gray-300"
                            value={getAgreementValue(a, "areas_covered")}
                            onChange={(e) => setAgreementValue(a.id, "areas_covered", e.target.value)}
                          />
                        </td>
                        <td className="px-1 py-1 text-center">
                          <Input
                            className="h-7 text-xs border-gray-300 text-center w-16 mx-auto"
                            value={getAgreementValue(a, "cpm_device_onsite") === "" ? "0" : getAgreementValue(a, "cpm_device_onsite")}
                            onChange={(e) => setAgreementValue(a.id, "cpm_device_onsite", e.target.value)}
                          />
                        </td>
                        <td className="px-1 py-1 text-center">
                          <Input
                            className="h-7 text-xs border-gray-300 text-center w-16 mx-auto bg-muted"
                            value={(() => {
                              const device = parseFloat(getAgreementValue(a, "cpm_device_onsite")) || 0;
                              const unitPrice = parseFloat(getAgreementValue(a, "unit_price")) || 0;
                              return (device * unitPrice).toFixed(2);
                            })()}
                            readOnly
                          />
                        </td>
                        <td className="px-1 py-1">
                          <Input
                            className="h-7 text-xs border-gray-300 text-right w-20 ml-auto"
                            value={getAgreementValue(a, "unit_price")}
                            onChange={(e) => setAgreementValue(a.id, "unit_price", e.target.value)}
                          />
                        </td>
                        <td className="px-1 py-1">
                          <Input
                            className="h-7 text-xs border-gray-300 text-right w-20 ml-auto"
                            value={getAgreementValue(a, "total")}
                            onChange={(e) => setAgreementValue(a.id, "total", e.target.value)}
                          />
                        </td>
                        <td className="px-1 py-1">
                          <Input
                            className="h-7 text-xs border-gray-300 text-right w-16 ml-auto"
                            value={getAgreementValue(a, "cpi")}
                            onChange={(e) => setAgreementValue(a.id, "cpi", e.target.value)}
                          />
                        </td>
                        <td className="px-1 py-1">
                          <select
                            className="h-7 text-xs border border-gray-300 rounded px-1 w-full bg-white"
                            value={getAgreementValue(a, "invoice_type")}
                            onChange={(e) => setAgreementValue(a.id, "invoice_type", e.target.value)}
                          >
                            <option value="">—</option>
                            {INVOICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </td>
                        <td className="px-1 py-1">
                          <Input
                            className="h-7 text-xs border-gray-300"
                            value={getAgreementValue(a, "comments")}
                            onChange={(e) => setAgreementValue(a.id, "comments", e.target.value)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={12} className="py-6 text-center text-gray-400">
                        No service agreements for this customer
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Entries - Editable */}
          <div className="px-4 py-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Invoice Details</h3>
              <div className="flex gap-2 print:hidden">
                <Button size="sm" variant="outline" onClick={addNewInvoice} className="gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add Entry
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveInvoices}
                  disabled={savingInvoices || (Object.keys(editedInvoices).length === 0 && newInvoices.length === 0)}
                  className="gap-1"
                >
                  <Save className="h-3.5 w-3.5" />
                  {savingInvoices ? "Saving…" : "Save Invoices"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {/* Existing invoices */}
              {invoices && invoices.map((inv) => (
                <div key={inv.id} className="border rounded bg-gray-50 p-3">
                  <div className="grid grid-cols-[140px_1fr_140px_40px] gap-3 items-start">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Entry Date</label>
                      <Input
                        type="date"
                        className="h-8 text-xs print:border-none"
                        value={getInvoiceValue(inv, "entry_date")}
                        onChange={(e) => setInvoiceValue(inv.id, "entry_date", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Events / Particulars / Occurrence</label>
                      <Textarea
                        className="text-xs min-h-[60px] print:border-none"
                        value={getInvoiceValue(inv, "particulars")}
                        onChange={(e) => setInvoiceValue(inv.id, "particulars", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">UserDate</label>
                      <Input
                        type="date"
                        className="h-8 text-xs print:border-none"
                        value={getInvoiceValue(inv, "user_date")}
                        onChange={(e) => setInvoiceValue(inv.id, "user_date", e.target.value)}
                      />
                    </div>
                    <div className="pt-4 print:hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteInvoice(inv.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* New invoices */}
              {newInvoices.map((inv, idx) => (
                <div key={`new-${idx}`} className="border-2 border-dashed border-primary/30 rounded bg-primary/5 p-3">
                  <div className="grid grid-cols-[140px_1fr_140px_40px] gap-3 items-start">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Entry Date</label>
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={inv.entry_date}
                        onChange={(e) => {
                          const updated = [...newInvoices];
                          updated[idx] = { ...updated[idx], entry_date: e.target.value };
                          setNewInvoices(updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Events / Particulars / Occurrence</label>
                      <Textarea
                        className="text-xs min-h-[60px]"
                        value={inv.particulars}
                        onChange={(e) => {
                          const updated = [...newInvoices];
                          updated[idx] = { ...updated[idx], particulars: e.target.value };
                          setNewInvoices(updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">UserDate</label>
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={inv.user_date}
                        onChange={(e) => {
                          const updated = [...newInvoices];
                          updated[idx] = { ...updated[idx], user_date: e.target.value };
                          setNewInvoices(updated);
                        }}
                      />
                    </div>
                    <div className="pt-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => setNewInvoices((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {(!invoices || invoices.length === 0) && newInvoices.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm">
                  No invoice entries yet. Click "Add Entry" to create one.
                </div>
              )}
            </div>
          </div>

          <div className="h-6" />
        </div>
      )}
    </div>
  );
};

export default CustomerInvoiceReport;
