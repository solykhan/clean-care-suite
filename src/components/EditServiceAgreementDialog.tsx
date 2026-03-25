import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

const formSchema = z.object({
  service_id: z.string().min(1, "Service ID is required"),
  products: z.string().optional(),
  areas_covered: z.string().optional(),
  service_active_inactive: z.string().optional(),
  service_frequency: z.string().optional(),
  invoice_type: z.string().optional(),
  cpm_device_onsite: z.string().optional(),
  week_day: z.string().optional(),
  weeks: z.string().optional(),
  unit_price: z.string().optional().refine(
    (val) => !val || (parseFloat(val) > 0 && !isNaN(parseFloat(val))),
    { message: "Unit price must be a positive number" }
  ),
  cpm_pricing: z.string().optional().refine(
    (val) => !val || (parseFloat(val) > 0 && !isNaN(parseFloat(val))),
    { message: "CPM pricing must be a positive number" }
  ),
  cpi: z.string().optional().refine(
    (val) => !val || (parseFloat(val) > 0 && !isNaN(parseFloat(val))),
    { message: "CPI must be a positive number" }
  ),
  total: z.string().optional().refine(
    (val) => !val || (parseFloat(val) > 0 && !isNaN(parseFloat(val))),
    { message: "Total must be a positive number" }
  ),
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditServiceAgreementDialogProps {
  agreement: any;
  onSuccess?: () => void;
}

const DEFAULT_FREQUENCIES = [
  "BI MONTHLY",
  "MONTHLY",
  "QUARTERLY",
  "WEEKLY",
  "FORTNIGHTLY",
  "ANNUALLY",
  "TWICE A WEEK",
  "PURCHASE",
  "ONLY RENTAL",
];

const DEFAULT_PRODUCTS = [
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

const DEFAULT_INVOICE_TYPES = [
  "BI MONTHLY",
  "MONTHLY",
  "QUARTERLY",
  "6 WEEKLY",
  "WEEKLY",
  "FORTNIGHTLY",
  "6 MONTHLY",
  "ANNUALLY",
  "TWICE A WEEK",
  "PURCHASE ONLY",
  "RENTAL",
];

export function EditServiceAgreementDialog({ agreement, onSuccess }: EditServiceAgreementDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [frequencies, setFrequencies] = useState<string[]>(DEFAULT_FREQUENCIES);
  const [addingFrequency, setAddingFrequency] = useState(false);
  const [newFrequency, setNewFrequency] = useState("");
  const [products, setProducts] = useState<string[]>(DEFAULT_PRODUCTS);
  const [addingProduct, setAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState("");
  const [invoiceTypes, setInvoiceTypes] = useState<string[]>(DEFAULT_INVOICE_TYPES);
  const [addingInvoiceType, setAddingInvoiceType] = useState(false);
  const [newInvoiceType, setNewInvoiceType] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service_id: agreement.service_id || "",
      products: agreement.products || "",
      areas_covered: agreement.areas_covered || "",
      service_active_inactive: agreement.service_active_inactive || "active",
      service_frequency: agreement.service_frequency || "",
      invoice_type: agreement.invoice_type || "",
      cpm_device_onsite: agreement.cpm_device_onsite || "",
      unit_price: agreement.unit_price?.toString() || "",
      cpm_pricing: agreement.cpm_pricing?.toString() || "",
      cpi: agreement.cpi?.toString() || "",
      total: agreement.total?.toString() || "",
      comments: agreement.comments || "",
      week_day: agreement.week_day || "",
      weeks: agreement.weeks || "",
    },
  });

  // Auto-calculate total: (unit_price * CPI) + unit_price
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name !== "unit_price" && name !== "cpi") return;
      const up = parseFloat(values.unit_price || "");
      const cpi = parseFloat(values.cpi || "");
      if (!isNaN(up) && !isNaN(cpi)) {
        form.setValue("total", ((up * cpi) + up).toFixed(2));
      } else {
        form.setValue("total", "");
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Reset form when agreement changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        service_id: agreement.service_id || "",
        products: agreement.products || "",
        areas_covered: agreement.areas_covered || "",
        service_active_inactive: agreement.service_active_inactive || "active",
        service_frequency: agreement.service_frequency || "",
        invoice_type: agreement.invoice_type || "",
        cpm_device_onsite: agreement.cpm_device_onsite || "",
        unit_price: agreement.unit_price?.toString() || "",
        cpm_pricing: agreement.cpm_pricing?.toString() || "",
        cpi: agreement.cpi?.toString() || "",
        total: agreement.total?.toString() || "",
        comments: agreement.comments || "",
        week_day: agreement.week_day || "",
        weeks: agreement.weeks || "",
      });
    }
  }, [open, agreement, form]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const data = {
        service_id: values.service_id,
        products: values.products || null,
        areas_covered: values.areas_covered || null,
        service_active_inactive: values.service_active_inactive || null,
        service_frequency: values.service_frequency || null,
        invoice_type: values.invoice_type || null,
        cpm_device_onsite: values.cpm_device_onsite || null,
        comments: values.comments || null,
        week_day: values.week_day || null,
        weeks: values.weeks || null,
        unit_price: values.unit_price ? parseFloat(values.unit_price) : null,
        cpm_pricing: values.cpm_pricing ? parseFloat(values.cpm_pricing) : null,
        cpi: values.cpi ? parseFloat(values.cpi) : null,
        total: values.total ? parseFloat(values.total) : null,
      };

      const { error } = await supabase
        .from("service_agreements")
        .update(data)
        .eq("id", agreement.id);

      if (error) throw error;

      toast.success("Service agreement updated successfully");
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Failed to update service agreement", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from("service_agreements")
        .delete()
        .eq("id", agreement.id);

      if (error) throw error;

      toast.success("Service agreement deleted successfully");
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Failed to delete service agreement", {
        description: error.message,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service Agreement</DialogTitle>
          <DialogDescription>
            Update service agreement details and pricing information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="service_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service ID *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter service ID" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="service_active_inactive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">ACT</SelectItem>
                        <SelectItem value="Inactive">INA</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            <FormField
              control={form.control}
              name="products"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Products/Services</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product/service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-72">
                      {products.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                      <div className="p-1 border-t mt-1">
                        {addingProduct ? (
                          <div className="flex gap-1 p-1">
                            <Input
                              autoFocus
                              value={newProduct}
                              onChange={(e) => setNewProduct(e.target.value)}
                              placeholder="New product..."
                              className="h-7 text-xs"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const trimmed = newProduct.trim();
                                  if (trimmed && !products.includes(trimmed)) {
                                    setProducts((prev) => [...prev, trimmed]);
                                    field.onChange(trimmed);
                                  }
                                  setNewProduct("");
                                  setAddingProduct(false);
                                }
                                if (e.key === "Escape") {
                                  setAddingProduct(false);
                                  setNewProduct("");
                                }
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => {
                                const trimmed = newProduct.trim();
                                if (trimmed && !products.includes(trimmed)) {
                                  setProducts((prev) => [...prev, trimmed]);
                                  field.onChange(trimmed);
                                }
                                setNewProduct("");
                                setAddingProduct(false);
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="flex items-center gap-1 w-full px-2 py-1.5 text-xs text-primary hover:bg-accent rounded-sm"
                            onClick={() => setAddingProduct(true)}
                          >
                            <Plus className="h-3 w-3" /> Add product
                          </button>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="areas_covered"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Areas Covered</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter areas covered" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoice_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select invoice type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {invoiceTypes.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                        <div className="p-1 border-t mt-1">
                          {addingInvoiceType ? (
                            <div className="flex gap-1 p-1">
                              <Input
                                autoFocus
                                value={newInvoiceType}
                                onChange={(e) => setNewInvoiceType(e.target.value)}
                                placeholder="New invoice type..."
                                className="h-7 text-xs"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    const trimmed = newInvoiceType.trim().toUpperCase();
                                    if (trimmed && !invoiceTypes.includes(trimmed)) {
                                      setInvoiceTypes((prev) => [...prev, trimmed]);
                                      field.onChange(trimmed);
                                    }
                                    setNewInvoiceType("");
                                    setAddingInvoiceType(false);
                                  }
                                  if (e.key === "Escape") {
                                    setAddingInvoiceType(false);
                                    setNewInvoiceType("");
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => {
                                  const trimmed = newInvoiceType.trim().toUpperCase();
                                  if (trimmed && !invoiceTypes.includes(trimmed)) {
                                    setInvoiceTypes((prev) => [...prev, trimmed]);
                                    field.onChange(trimmed);
                                  }
                                  setNewInvoiceType("");
                                  setAddingInvoiceType(false);
                                }}
                              >
                                Add
                              </Button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="flex items-center gap-1 w-full px-2 py-1.5 text-xs text-primary hover:bg-accent rounded-sm"
                              onClick={() => setAddingInvoiceType(true)}
                            >
                              <Plus className="h-3 w-3" /> Add invoice type
                            </button>
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpm_device_onsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPM Device Onsite</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter device info" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpm_pricing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPM Pricing</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPI</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total <span className="text-xs text-muted-foreground">(auto-calculated)</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        readOnly
                        className="bg-muted cursor-not-allowed"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="service_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {frequencies.map((freq) => (
                          <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                        ))}
                        <div className="p-1 border-t mt-1">
                          {addingFrequency ? (
                            <div className="flex gap-1 p-1">
                              <Input
                                autoFocus
                                value={newFrequency}
                                onChange={(e) => setNewFrequency(e.target.value)}
                                placeholder="New frequency..."
                                className="h-7 text-xs"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    const trimmed = newFrequency.trim().toUpperCase();
                                    if (trimmed && !frequencies.includes(trimmed)) {
                                      setFrequencies((prev) => [...prev, trimmed]);
                                      field.onChange(trimmed);
                                    }
                                    setNewFrequency("");
                                    setAddingFrequency(false);
                                  }
                                  if (e.key === "Escape") {
                                    setAddingFrequency(false);
                                    setNewFrequency("");
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => {
                                  const trimmed = newFrequency.trim().toUpperCase();
                                  if (trimmed && !frequencies.includes(trimmed)) {
                                    setFrequencies((prev) => [...prev, trimmed]);
                                    field.onChange(trimmed);
                                  }
                                  setNewFrequency("");
                                  setAddingFrequency(false);
                                }}
                              >
                                Add
                              </Button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="flex items-center gap-1 w-full px-2 py-1.5 text-xs text-primary hover:bg-accent rounded-sm"
                              onClick={() => setAddingFrequency(true)}
                            >
                              <Plus className="h-3 w-3" /> Add frequency
                            </button>
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional comments or notes"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="week_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Week Day</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Monday">Monday</SelectItem>
                        <SelectItem value="Tuesday">Tuesday</SelectItem>
                        <SelectItem value="Wednesday">Wednesday</SelectItem>
                        <SelectItem value="Thursday">Thursday</SelectItem>
                        <SelectItem value="Friday">Friday</SelectItem>
                        <SelectItem value="Saturday">Saturday</SelectItem>
                        <SelectItem value="Sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weeks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Week</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 1, 2, 3, 4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={loading || deleteLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Service Agreement</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this service agreement? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleteLoading}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteLoading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Service Agreement"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
