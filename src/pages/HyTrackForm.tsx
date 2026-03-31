import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Printer, Save, Plus, Trash2, Search, ArrowRight } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const PRODUCT_OPTIONS = [
  "Auto gel hand Sanitiser with stand",
  "1.4Lt Sharp unit",
  "1.4ltr Sharp - Bracket / Mounting Frame",
  "1.4Ltr Sharp (with metal Container)",
  "8Ltr sharp unit",
  "Admin Fee",
  "Air Freshener",
  "Air Freshener - AIROMA",
  "Air freshener (Odour Neutralizer)",
  "Air Freshener Cans",
  "Ash Trays  (Client Own)",
  "Auto Paper towels 1Ply white",
  "Auto towel Dispenser (hygiene system",
  "Bactisan 300ml DISP.",
  "Bactisan Refills - 300ml",
  "Body wash",
  "Deb 1 Litre  soap Cartridge",
  "EJ-300 Jumbo Roll Dispenser - (stainless Steel)",
  "EnMotion Electric Hand-towel Disp.",
  "EnMotion Handtowel Refills (6/Ctn)",
  "ET-500 Paper Towel Dispenser (marble)",
  "GEL Unit with Timer  - (AF190M)",
  "Hand Dryer - E05 Model",
  "Hand Dryer - M88A Plus Style",
  "Hand Sanitiser AUTO",
  "Hand Sanitiser AUTO GEL Refill",
  "Hand Sanitiser Disp. 300ml",
  "Hand Sanitiser MANUAL GEL Bottle",
  "Hand Sanitizer Manual",
  "Hand Sanitser Pedestal",
  "Hand Soap Auto (1 Ltr Sensor)",
  "Hand Soap- Refill",
  "Hand-Dryer - IAM model",
  "Hand-Dryer - IAM model (+ Filter & Fragrance)",
  "Hand-Dryer - IAM model (+ Filter only)",
  "IAM H/Dryer - Fragrance Blocks",
  "IAM H/Dyrer - FILTER",
  "Interfold Paper Hand Towel",
  "Jumbo Toilet Tissue - 2ply (Crtn of 8)",
  "Jumboroll Linea Dispenser (hygiene system)",
  "KEY SERVICE",
  "MATs - US / Fragrant",
  "MATS (1/2's) - US / Fragrant",
  "Maxithins Sanitary Napkins",
  "Medical Bin (Lrg)",
  "Medical Bin (Medium)",
  "Medical Bin (sml)",
  "Multifold Paper Hand Towel (Z-Fold)",
  "Multifold Papertowel Dispencer ( VDA )",
  "Nappy Bin (Flat top) - Medium",
  "Nappy Bin (Medium)",
  "Nappy Bin (Sml)",
  "Nappy Bins (Lrg)",
  "Pysect",
  "Safe Seat Dispenser (TSS)",
  "Sani WIPE Dispencer",
  "Sanitary Bins - Basic  (grey)",
  "Sanitary Bins - Basic  (Switch)",
  "Sanitary Bins - O/S White",
  "Sanitary bins - PEDAL Style",
  "Sanitary Bins - SENSOR Type",
  "Sanitary Bins - SENSOR Type (O/S)",
  "Sanitary Bins - SENSOR Type BLACK",
  "Sanitary Bins - Touch Free o/s (white) Abco",
  "SANITEX 800ml - ANTI-BAC Soap (6 Pkt)",
  "SANITEX 800ml - FOAM Soap (6 Pkt)",
  "SANITEX 800ml - LIQUID Soap (6 Pkt)",
  "Sanitex ANIT-BAC Soap Disp",
  "Sanitex FOAM Soap Disp",
  "Sanitex FOAM Soap Disp- re-fillable",
  "Sanitex HAND Soap Disp",
  "Sanitex HAND Soap Disp - Refillable",
  "SARAYA  Manual Hand Sanitiser 1.2L",
  "Saraya Auto Hand sanitzier 1.2L.",
  "SARAYA Hand Sanitizer - Auto Disp. (1ltr)",
  "SARAYA Hand Sanitizer- Alcohol free Manual",
  "SARAYA Hand sanitizing Manual Disp. (1ltr)",
  "Smart San Hand Sani Solution - (3ltr Bottle)",
  "Smart San Hand Sani Solution - (5ltr Bottle) Ctn of 2",
  "Soap - REFILLS ONLY",
  "Soap cartridge foam refill 1L",
  "Soap Dispenser  (Bobson - 1.7Ltr)",
  "Soap Dispenser  (Bobson - 900ml)",
  "Soap Dispenser (4 Ltr)( Blue soap)",
  "Soap Dispenser + refill",
  "Soap: WHITE (5ltr Bottle)",
  "Stainless Steel HORIZONTAL Soap Dispencer",
  "Stainless Steel Triple Toilet Roll Dispencer",
  "Suprega Grit Disp. (4Ltr)",
  "Suprega Plus 4 ltr GRIT Cartridge",
  "Tampax Tampons",
  "Toilet Paper - HS 700",
  "Toilet Paper Rolls Single (box of 48)",
  "Toilet Roll Holder (Reserved Roll )",
  "Toilet Seat Spray Disp With Bottle refill",
  "Toilet Seat Spray Disp.",
  "Toilet Seat Sprays - (Take-a-seat / Have-A-Seat) REFILLS (300ml)",
  "Urinal Crystals",
  "Urinal Sanitiser - External Disp",
  "Urinal Sanitizers - Internal",
  "Urinal Sanitizing Blocks - ∆",
  "Urinal Sanitizing Blocks - DOME style",
  "Urinal Spray",
  "Urinal Treatment (D/C)",
  "Vending Machine",
  "WC Descale",
  "WC Sanitizers - Glass (internal)",
  "WC Sanitizers - internal",
  "WC Treatment ( D/C )",
  "white soap 4 Ltr",
];

interface Customer {
  id: string;
  service_id: string;
  site_name: string;
  site_suburb?: string | null;
  site_street_name?: string | null;
  site_post_code?: string | null;
  site_contact_first_name?: string | null;
  site_contact_lastname?: string | null;
  site_email_address?: string | null;
  site_telephone_no1?: string | null;
  site_accounts_contact?: string | null;
}

const HyTrackForm = () => {
  const queryClient = useQueryClient();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editedAgreements, setEditedAgreements] = useState<Record<string, any>>({});
  const [editedInvoices, setEditedInvoices] = useState<Record<string, any>>({});
  const [newInvoices, setNewInvoices] = useState<any[]>([]);
  const [newAgreements, setNewAgreements] = useState<any[]>([]);
  const [savingAgreements, setSavingAgreements] = useState(false);
  const [savingInvoices, setSavingInvoices] = useState(false);

  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["hytrack-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, service_id, site_name, site_suburb, site_street_name, site_post_code, site_contact_first_name, site_contact_lastname, site_email_address, site_telephone_no1, site_accounts_contact")
        .order("site_name");
      if (error) throw error;
      return data as Customer[];
    },
  });

  const selectedCustomer = customers?.find((c) => c.id === selectedCustomerId);

  const { data: serviceAgreements, isLoading: isLoadingAgreements } = useQuery({
    queryKey: ["hytrack-agreements", selectedCustomer?.service_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_agreements")
        .select("*")
        .eq("service_id", selectedCustomer!.service_id);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCustomer,
  });

  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["hytrack-invoices", selectedCustomer?.service_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("inv_id", selectedCustomer!.service_id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCustomer,
  });

  const filteredCustomers = useMemo(() =>
    customers?.filter(
      (c) =>
        c.site_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.service_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.site_suburb?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [customers, searchTerm]
  );

  // Customer navigation
  const sortedCustomers = customers || [];
  const currentIndex = sortedCustomers.findIndex((c) => c.id === selectedCustomerId);

  const goNext = () => {
    if (currentIndex < sortedCustomers.length - 1) {
      resetState();
      setSelectedCustomerId(sortedCustomers[currentIndex + 1].id);
    }
  };
  const goBack = () => {
    if (currentIndex > 0) {
      resetState();
      setSelectedCustomerId(sortedCustomers[currentIndex - 1].id);
    }
  };

  const resetState = () => {
    setEditedAgreements({});
    setEditedInvoices({});
    setNewInvoices([]);
    setNewAgreements([]);
  };

  // Agreement helpers
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

  // Invoice helpers
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

  const addNewAgreement = () => {
    if (!selectedCustomer) return;
    setNewAgreements((prev) => [...prev, {
      id: crypto.randomUUID(),
      service_id: selectedCustomer.service_id,
      products: "",
      service_frequency: "",
      service_active_inactive: "ACT",
      areas_covered: "",
      cpm_device_onsite: "0",
      unit_price: "0",
      cpi: "0",
      invoice_type: "",
      comments: "",
    }]);
  };

  // Save agreements
  const handleSaveAgreements = async () => {
    const ids = Object.keys(editedAgreements);
    const hasEdits = ids.length > 0;
    const hasNew = newAgreements.length > 0;
    if (!hasEdits && !hasNew) { toast.info("No changes to save"); return; }
    setSavingAgreements(true);
    try {
      for (const id of ids) {
        const changes = { ...editedAgreements[id] };
        const agreement = serviceAgreements?.find((a: any) => a.id === id);
        const getVal = (f: string) => changes[f] !== undefined ? changes[f] : (agreement?.[f] ?? "");
        const device = parseFloat(getVal("cpm_device_onsite")) || 0;
        const unitPrice = parseFloat(getVal("unit_price")) || 0;
        changes.cpm_pricing = (device * unitPrice).toString();

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
      // Insert new agreements
      for (const newAg of newAgreements) {
        const device = parseFloat(newAg.cpm_device_onsite) || 0;
        const unitPrice = parseFloat(newAg.unit_price) || 0;
        const cpi = parseFloat(newAg.cpi) || 0;
        const { id, ...rest } = newAg;
        const { error } = await supabase.from("service_agreements").insert({
          ...rest,
          unit_price: unitPrice || null,
          cpm_pricing: device * unitPrice || null,
          cpi: cpi || null,
          total: (unitPrice * cpi) + unitPrice || null,
          cpm_device_onsite: newAg.cpm_device_onsite || null,
        });
        if (error) throw error;
      }
      toast.success("Service agreements saved");
      setEditedAgreements({});
      setNewAgreements([]);
      queryClient.invalidateQueries({ queryKey: ["hytrack-agreements"] });
    } catch (e: any) {
      toast.error("Save failed", { description: e.message });
    } finally {
      setSavingAgreements(false);
    }
  };

  // Save invoices
  const handleSaveInvoices = async () => {
    const hasEdits = Object.keys(editedInvoices).length > 0;
    const hasNew = newInvoices.length > 0;
    if (!hasEdits && !hasNew) { toast.info("No changes to save"); return; }
    setSavingInvoices(true);
    try {
      for (const [id, changes] of Object.entries(editedInvoices)) {
        const { error } = await supabase.from("invoices").update(changes).eq("id", id);
        if (error) throw error;
      }
      for (const inv of newInvoices) {
        if (!inv.particulars && !inv.entry_date) continue;
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
      queryClient.invalidateQueries({ queryKey: ["hytrack-invoices"] });
    } catch (e: any) {
      toast.error("Save failed", { description: e.message });
    } finally {
      setSavingInvoices(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
      toast.success("Invoice entry deleted");
      queryClient.invalidateQueries({ queryKey: ["hytrack-invoices"] });
    } catch (e: any) {
      toast.error("Delete failed", { description: e.message });
    }
  };

  const addNewInvoice = () => {
    setNewInvoices((prev) => [...prev, { id: crypto.randomUUID(), entry_date: "", particulars: "", user_date: "" }]);
  };

  // Customer selection list
  if (!selectedCustomerId) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">HyTrack Service Agreement</h1>
          <p className="text-muted-foreground">Select a customer to manage their service agreements</p>
        </div>
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID or suburb..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-16"></TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Name of Customer</TableHead>
                <TableHead>Suburb</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingCustomers ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-8 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredCustomers?.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/30">
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-3 text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={() => { resetState(); setSelectedCustomerId(customer.id); }}
                      >
                        Go
                      </Button>
                    </TableCell>
                    <TableCell className="font-mono font-semibold">{customer.service_id}</TableCell>
                    <TableCell>{customer.site_name}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.site_suburb || "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // HyTrack form view
  // Calculate totals for print view
  const printTotalUnitRate = serviceAgreements?.reduce((sum, a) => sum + (parseFloat(a.unit_price?.toString() || "0") || 0), 0) || 0;
  const printAnnualTotal = serviceAgreements?.reduce((sum, a) => {
    const unitPrice = parseFloat(a.unit_price?.toString() || "0") || 0;
    const cpi = parseFloat(a.cpi?.toString() || "0") || 0;
    return sum + (unitPrice * cpi) + unitPrice;
  }, 0) || 0;
  const printInvoiceType = serviceAgreements?.[0]?.invoice_type || "—";

  return (
    <div className="p-4 max-w-[1400px] mx-auto">
      {/* ===== PRINT-ONLY VIEW ===== */}
      <div className="hidden print:block" style={{ fontFamily: "Arial, sans-serif", color: "#000" }}>
        {/* Header */}
        <div style={{ borderBottom: "2px solid #333", paddingBottom: 8, marginBottom: 12 }}>
          <h1 style={{ fontSize: 28, fontStyle: "italic", fontWeight: "bold", margin: 0 }}>HyTrack</h1>
          <p style={{ fontSize: 9, margin: "2px 0 6px 0" }}>CPM Hygiene Services Foundry Road Seven Hills NSW</p>
          <h2 style={{ fontSize: 13, fontWeight: "bold", letterSpacing: 1, margin: 0 }}>CUSTOMER ONSITE HYGIENE LISTING AND INVOICING DETAILS</h2>
        </div>

        {/* Customer Info */}
        <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse", marginBottom: 8 }}>
          <tbody>
            <tr>
              <td style={{ padding: "2px 0" }}><b>ID:</b> &nbsp; {selectedCustomer?.service_id}</td>
              <td style={{ padding: "2px 0" }}><b>Invoiced Under:</b> &nbsp; {selectedCustomer?.site_accounts_contact || "—"}</td>
            </tr>
            <tr>
              <td style={{ padding: "2px 0" }} colSpan={2}><b>Client:</b> &nbsp; {selectedCustomer?.site_name}</td>
            </tr>
            <tr>
              <td style={{ padding: "2px 0", verticalAlign: "top" }}>
                <b>Site Address:</b> &nbsp; {[selectedCustomer?.site_street_name, selectedCustomer?.site_suburb, selectedCustomer?.site_post_code].filter(Boolean).join(", ") || "—"}
              </td>
              <td style={{ padding: "2px 0", verticalAlign: "top" }}>
                <div><b>Contact 1:</b></div>
                <div>{[selectedCustomer?.site_contact_first_name, selectedCustomer?.site_contact_lastname].filter(Boolean).join(" ") || "—"}</div>
                <div>{selectedCustomer?.site_telephone_no1 || ""}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Products Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, marginTop: 16 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #333" }}>
              <th style={{ textAlign: "left", padding: "4px 6px", fontWeight: "bold" }}>PRODUCT</th>
              <th style={{ textAlign: "center", padding: "4px 6px", fontWeight: "bold" }}>QTY</th>
              <th style={{ textAlign: "left", padding: "4px 6px", fontWeight: "bold" }}>SERVICE FREQUENCY</th>
              <th style={{ textAlign: "right", padding: "4px 6px", fontWeight: "bold" }}>UNIT RATE</th>
              <th style={{ textAlign: "right", padding: "4px 6px", fontWeight: "bold" }}>TOTAL PER ANNUM</th>
            </tr>
          </thead>
          <tbody>
            {serviceAgreements?.map((a, i) => {
              const unitPrice = parseFloat(a.unit_price?.toString() || "0") || 0;
              const cpi = parseFloat(a.cpi?.toString() || "0") || 0;
              const total = (unitPrice * cpi) + unitPrice;
              const qty = a.cpm_device_onsite || "0";
              return (
                <tr key={a.id} style={{ borderBottom: "1px solid #ccc" }}>
                  <td style={{ padding: "3px 6px" }}>{a.products || "—"}</td>
                  <td style={{ padding: "3px 6px", textAlign: "center" }}>{qty}</td>
                  <td style={{ padding: "3px 6px" }}>{a.service_frequency || "—"}</td>
                  <td style={{ padding: "3px 6px", textAlign: "right" }}>${unitPrice.toFixed(2)}</td>
                  <td style={{ padding: "3px 6px", textAlign: "right" }}>${total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "2px solid #333" }}>
              <td colSpan={2} style={{ padding: "4px 6px", textAlign: "center", fontWeight: "bold" }}>
                Invoiced &nbsp; <span style={{ fontWeight: "bold" }}>{printInvoiceType}</span>
              </td>
              <td style={{ padding: "4px 6px", textAlign: "center" }}>@</td>
              <td style={{ padding: "4px 6px", textAlign: "right", fontWeight: "bold" }}>${printTotalUnitRate.toFixed(2)} &nbsp; +GST</td>
              <td style={{ padding: "4px 6px", textAlign: "right", fontWeight: "bold" }}>
                Annual Total: &nbsp; ${printAnnualTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Invoice Details */}
        {invoices && invoices.length > 0 && (
          <div style={{ marginTop: 24, fontSize: 10 }}>
            {invoices.map((inv) => (
              <div key={inv.id} style={{ display: "flex", gap: 16, padding: "3px 0", borderBottom: "1px solid #eee" }}>
                <span style={{ fontWeight: "bold", minWidth: 70 }}>{inv.entry_date || ""}</span>
                <span>{inv.particulars || ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== SCREEN-ONLY VIEW ===== */}
      <div className="print:hidden">
      {/* Top navigation buttons */}
      <div className="flex items-center gap-2 mb-4 flex-wrap print:hidden">
        <Button variant="outline" size="sm" onClick={() => { resetState(); setSelectedCustomerId(null); }}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Home
        </Button>
        <Button variant="default" size="sm" onClick={handleSaveAgreements} disabled={savingAgreements}>
          <Save className="h-4 w-4 mr-1" /> Save
        </Button>
        <Button variant="outline" size="sm" onClick={goNext} disabled={currentIndex >= sortedCustomers.length - 1}>
          Next <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
        <Button variant="outline" size="sm" onClick={goBack} disabled={currentIndex <= 0}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-1" /> Print
        </Button>
      </div>

      {/* HyTrack header */}
      <div className="bg-gradient-to-r from-sky-50 to-teal-50 border rounded-lg p-5 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">HyTrack</h1>
            <p className="text-xs text-muted-foreground">CPM Hygiene Services Foundry Road Seven Hills NSW</p>
          </div>
          <span className="text-3xl font-bold text-primary">{selectedCustomer?.service_id}</span>
        </div>
        <h2 className="text-lg font-semibold text-primary mt-2">{selectedCustomer?.site_name}</h2>

        {/* Contact info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 mt-3 text-xs">
          <div>
            <span className="font-semibold">Onsite Contact 1: </span>
            <span>{[selectedCustomer?.site_contact_first_name, selectedCustomer?.site_contact_lastname].filter(Boolean).join(" ") || "—"}</span>
          </div>
          <div>
            <span className="font-semibold">Email: </span>
            <span>{selectedCustomer?.site_email_address || "—"}</span>
          </div>
          <div>
            <span className="font-semibold">Telephone: </span>
            <span>{selectedCustomer?.site_telephone_no1 || "—"}</span>
          </div>
          <div>
            <span className="font-semibold">Accounts: </span>
            <span>{selectedCustomer?.site_accounts_contact || "—"}</span>
          </div>
          <div className="col-span-2">
            <span className="font-semibold">Address: </span>
            <span>{[selectedCustomer?.site_street_name, selectedCustomer?.site_suburb, selectedCustomer?.site_post_code].filter(Boolean).join(", ") || "—"}</span>
          </div>
        </div>
      </div>

      {/* Service Agreements Table */}
      <div className="mb-6 -mx-[10%]">
        <div className="flex items-center justify-between mb-2 px-[10%]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Service Agreements</h3>
          <div className="flex gap-2 print:hidden">
            <Button size="sm" variant="outline" onClick={addNewAgreement}>
              <Plus className="h-3 w-3 mr-1" /> Add Entry
            </Button>
            <Button size="sm" variant="default" onClick={handleSaveAgreements} disabled={savingAgreements}>
              <Save className="h-3 w-3 mr-1" /> Save Agreements
            </Button>
          </div>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="bg-muted/50 text-xs">
                <TableHead className="text-xs py-2 w-[5%]">ServiceID</TableHead>
                <TableHead className="text-xs py-2 w-[15%]">Products</TableHead>
                <TableHead className="text-xs py-2 w-[8%]">Frequency</TableHead>
                <TableHead className="text-xs py-2 w-[5%]">Status</TableHead>
                <TableHead className="text-xs py-2 w-[10%]">Site Locations</TableHead>
                <TableHead className="text-xs py-2 w-[5%] text-center">Client Device</TableHead>
                <TableHead className="text-xs py-2 w-[5%] text-center">CPM Device</TableHead>
                <TableHead className="text-xs py-2 w-[7%] text-right">Unit Price</TableHead>
                <TableHead className="text-xs py-2 w-[7%] text-right">CPM Price</TableHead>
                <TableHead className="text-xs py-2 w-[5%] text-center">CPI</TableHead>
                <TableHead className="text-xs py-2 w-[10%]">Invoice Type</TableHead>
                <TableHead className="text-xs py-2 w-[13%]">Comments</TableHead>
                <TableHead className="text-xs py-2 w-[5%] text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingAgreements ? (
                <TableRow>
                  <TableCell colSpan={13}><Skeleton className="h-8 w-full" /></TableCell>
                </TableRow>
              ) : serviceAgreements && serviceAgreements.length > 0 ? (
                serviceAgreements.map((a, i) => {
                  const cpmDevice = parseFloat(getAgreementValue(a, "cpm_device_onsite")) || 0;
                  const unitPrice = parseFloat(getAgreementValue(a, "unit_price")) || 0;
                  const cpmPrice = cpmDevice * unitPrice;
                  const cpi = parseFloat(getAgreementValue(a, "cpi")) || 0;
                  const total = (unitPrice * cpi) + unitPrice;

                  return (
                    <TableRow key={a.id} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                      <TableCell className="font-mono font-semibold text-xs py-1">{a.service_id}</TableCell>
                      <TableCell className="py-1">
                        <Select value={getAgreementValue(a, "products") || ""} onValueChange={(v) => setAgreementValue(a.id, "products", v)}>
                          <SelectTrigger className="h-auto min-h-7 text-xs whitespace-normal text-left [&>span]:line-clamp-none [&>span]:whitespace-normal"><SelectValue placeholder="Select product" /></SelectTrigger>
                          <SelectContent className="max-h-60 w-72">
                            {PRODUCT_OPTIONS.map((p) => (
                              <SelectItem key={p} value={p} className="whitespace-normal">{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-1">
                        <Select value={getAgreementValue(a, "service_frequency") || ""} onValueChange={(v) => setAgreementValue(a.id, "service_frequency", v)}>
                          <SelectTrigger className="h-auto min-h-7 text-xs whitespace-normal text-left [&>span]:line-clamp-none [&>span]:whitespace-normal"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["MONTHLY", "BI-MONTHLY", "WEEKLY", "FORTNIGHTLY", "QUARTERLY", "ANNUALLY"].map((f) => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-1">
                        <Select value={getAgreementValue(a, "service_active_inactive") || ""} onValueChange={(v) => setAgreementValue(a.id, "service_active_inactive", v)}>
                          <SelectTrigger className="h-auto min-h-7 text-xs whitespace-normal text-left [&>span]:line-clamp-none [&>span]:whitespace-normal"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACT">ACT</SelectItem>
                            <SelectItem value="INA">INA</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-1">
                        <Textarea className="text-xs border-border w-full min-h-7 resize-none overflow-hidden" rows={1} value={getAgreementValue(a, "areas_covered")} onChange={(e) => { setAgreementValue(a.id, "areas_covered", e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} onFocus={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} />
                      </TableCell>
                      <TableCell className="py-1 text-center">
                        <span className="text-xs text-muted-foreground">0</span>
                      </TableCell>
                      <TableCell className="py-1 text-center">
                        <Input className="h-7 text-xs border-border text-center w-full" value={getAgreementValue(a, "cpm_device_onsite") || "0"} onChange={(e) => setAgreementValue(a.id, "cpm_device_onsite", e.target.value)} />
                      </TableCell>
                      <TableCell className="py-1">
                        <Input className="h-7 text-xs border-border text-right w-full bg-yellow-100" value={getAgreementValue(a, "unit_price")} onChange={(e) => setAgreementValue(a.id, "unit_price", e.target.value)} />
                      </TableCell>
                      <TableCell className="py-1 text-right">
                        <span className="text-xs font-medium whitespace-normal">${cpmPrice.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="py-1 text-center">
                        <Input className="h-7 text-xs border-border text-center w-full" value={getAgreementValue(a, "cpi")} onChange={(e) => setAgreementValue(a.id, "cpi", e.target.value)} />
                      </TableCell>
                      <TableCell className="py-1">
                        <Select value={getAgreementValue(a, "invoice_type") || ""} onValueChange={(v) => setAgreementValue(a.id, "invoice_type", v)}>
                          <SelectTrigger className="h-auto min-h-7 text-xs whitespace-normal text-left [&>span]:line-clamp-none [&>span]:whitespace-normal"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["BI MONTHLY", "MONTHLY", "QUARTERLY", "6 WEEKLY", "WEEKLY", "FORTNIGHTLY", "6 MONTHLY", "ANNUALLY", "TWICE A WEEK", "PURCHASE ONLY", "RENTAL"].map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-1">
                        <Textarea className="text-xs border-border w-full min-h-7 resize-none overflow-hidden" rows={1} value={getAgreementValue(a, "comments")} onChange={(e) => { setAgreementValue(a.id, "comments", e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} onFocus={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} />
                      </TableCell>
                      <TableCell className="py-1 text-right">
                        <span className="text-xs font-medium">{total.toFixed(2)}</span>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={13} className="text-center text-muted-foreground py-6 text-sm">
                    No service agreements found for this customer.
                  </TableCell>
                </TableRow>
              )}
              {/* New agreements */}
              {newAgreements.map((na, i) => {
                const cpmDevice = parseFloat(na.cpm_device_onsite) || 0;
                const unitPrice = parseFloat(na.unit_price) || 0;
                const cpmPrice = cpmDevice * unitPrice;
                const cpi = parseFloat(na.cpi) || 0;
                const total = (unitPrice * cpi) + unitPrice;
                const updateNew = (field: string, val: string) => {
                  setNewAgreements((prev) => prev.map((a) => a.id === na.id ? { ...a, [field]: val } : a));
                };
                return (
                  <TableRow key={na.id} className="bg-green-50/50">
                    <TableCell className="font-mono font-semibold text-xs py-1">{na.service_id}</TableCell>
                    <TableCell className="py-1">
                      <Select value={na.products || ""} onValueChange={(v) => updateNew("products", v)}>
                        <SelectTrigger className="h-auto min-h-7 text-xs whitespace-normal text-left [&>span]:line-clamp-none [&>span]:whitespace-normal"><SelectValue placeholder="Select product" /></SelectTrigger>
                        <SelectContent className="max-h-60 w-72">
                          {PRODUCT_OPTIONS.map((p) => (
                            <SelectItem key={p} value={p} className="whitespace-normal">{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="py-1">
                      <Select value={na.service_frequency || ""} onValueChange={(v) => updateNew("service_frequency", v)}>
                        <SelectTrigger className="h-auto min-h-7 text-xs whitespace-normal text-left [&>span]:line-clamp-none [&>span]:whitespace-normal"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {["MONTHLY", "BI-MONTHLY", "WEEKLY", "FORTNIGHTLY", "QUARTERLY", "ANNUALLY"].map((f) => (
                            <SelectItem key={f} value={f}>{f}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="py-1">
                      <Select value={na.service_active_inactive || ""} onValueChange={(v) => updateNew("service_active_inactive", v)}>
                        <SelectTrigger className="h-auto min-h-7 text-xs whitespace-normal text-left [&>span]:line-clamp-none [&>span]:whitespace-normal"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACT">ACT</SelectItem>
                          <SelectItem value="INA">INA</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="py-1">
                      <Input className="h-7 text-xs border-border w-full" value={na.areas_covered} onChange={(e) => updateNew("areas_covered", e.target.value)} />
                    </TableCell>
                    <TableCell className="py-1 text-center"><span className="text-xs text-muted-foreground">0</span></TableCell>
                    <TableCell className="py-1 text-center">
                      <Input className="h-7 text-xs border-border text-center w-full" value={na.cpm_device_onsite} onChange={(e) => updateNew("cpm_device_onsite", e.target.value)} />
                    </TableCell>
                    <TableCell className="py-1">
                      <Input className="h-7 text-xs border-border text-right w-full" value={na.unit_price} onChange={(e) => updateNew("unit_price", e.target.value)} />
                    </TableCell>
                    <TableCell className="py-1 text-right"><span className="text-xs font-medium">${cpmPrice.toFixed(2)}</span></TableCell>
                    <TableCell className="py-1 text-center">
                      <Input className="h-7 text-xs border-border text-center w-full" value={na.cpi} onChange={(e) => updateNew("cpi", e.target.value)} />
                    </TableCell>
                    <TableCell className="py-1">
                      <Select value={na.invoice_type || ""} onValueChange={(v) => updateNew("invoice_type", v)}>
                        <SelectTrigger className="h-auto min-h-7 text-xs whitespace-normal text-left [&>span]:line-clamp-none [&>span]:whitespace-normal"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {["BI MONTHLY", "MONTHLY", "QUARTERLY", "6 WEEKLY", "WEEKLY", "FORTNIGHTLY", "6 MONTHLY", "ANNUALLY", "TWICE A WEEK", "PURCHASE ONLY", "RENTAL"].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="py-1">
                      <Input className="h-7 text-xs border-border w-full" value={na.comments} onChange={(e) => updateNew("comments", e.target.value)} />
                    </TableCell>
                    <TableCell className="py-1 text-right"><span className="text-xs font-medium">{total.toFixed(2)}</span></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Invoice Details */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Invoice Details</h3>
          <div className="flex gap-2 print:hidden">
            <Button size="sm" variant="outline" onClick={addNewInvoice}>
              <Plus className="h-3 w-3 mr-1" /> Add Entry
            </Button>
            <Button size="sm" variant="default" onClick={handleSaveInvoices} disabled={savingInvoices}>
              <Save className="h-3 w-3 mr-1" /> Save Invoices
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {isLoadingInvoices ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <>
              {invoices?.map((inv) => (
                <div key={inv.id} className="border rounded-lg p-4 bg-card">
                  <div className="grid grid-cols-[150px_1fr_150px_auto] gap-4 items-start">
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-muted-foreground">Entry Date</label>
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={getInvoiceValue(inv, "entry_date")}
                        onChange={(e) => setInvoiceValue(inv.id, "entry_date", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-muted-foreground">Events / Particulars / Occurrence</label>
                      <Textarea
                        className="text-xs min-h-[60px]"
                        value={getInvoiceValue(inv, "particulars")}
                        onChange={(e) => setInvoiceValue(inv.id, "particulars", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-muted-foreground">UserDate</label>
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={getInvoiceValue(inv, "user_date")}
                        onChange={(e) => setInvoiceValue(inv.id, "user_date", e.target.value)}
                      />
                    </div>
                    <div className="pt-5">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteInvoice(inv.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {newInvoices.map((inv, idx) => (
                <div key={inv.id} className="border rounded-lg p-4 bg-accent/20 border-dashed">
                  <div className="grid grid-cols-[150px_1fr_150px_auto] gap-4 items-start">
                    <div>
                      <label className="text-[10px] font-semibold uppercase text-muted-foreground">Entry Date</label>
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
                      <label className="text-[10px] font-semibold uppercase text-muted-foreground">Events / Particulars / Occurrence</label>
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
                      <label className="text-[10px] font-semibold uppercase text-muted-foreground">UserDate</label>
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
                    <div className="pt-5">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setNewInvoices((prev) => prev.filter((_, i) => i !== idx))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {(!invoices || invoices.length === 0) && newInvoices.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-6">No invoice entries yet.</p>
              )}
            </>
          )}
        </div>
      </div>
      </div>{/* end print:hidden */}
    </div>
  );
};

export default HyTrackForm;
