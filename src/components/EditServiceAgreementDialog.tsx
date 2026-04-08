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
import { EditInvoiceDialog } from "@/components/EditInvoiceDialog";

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
  technicians: z.string().optional(),
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

import { useProducts } from "@/hooks/useProducts";

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

const DEFAULT_TECHNICIANS = [
  "Lynessa",
  "Amanda",
  "Betty",
  "Dani",
  "Jayden",
];

export function EditServiceAgreementDialog({ agreement, onSuccess }: EditServiceAgreementDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addingToRuns, setAddingToRuns] = useState(false);
  const [frequencies, setFrequencies] = useState<string[]>(DEFAULT_FREQUENCIES);
  const [addingFrequency, setAddingFrequency] = useState(false);
  const [newFrequency, setNewFrequency] = useState("");
  const { products, addProduct: addProductToDB } = useProducts();
  const [addingProduct, setAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState("");
  const [invoiceTypes, setInvoiceTypes] = useState<string[]>(DEFAULT_INVOICE_TYPES);
  const [addingInvoiceType, setAddingInvoiceType] = useState(false);
  const [newInvoiceType, setNewInvoiceType] = useState("");
  const [technicians, setTechnicians] = useState<string[]>(DEFAULT_TECHNICIANS);
  const [addingTechnician, setAddingTechnician] = useState(false);
  const [newTechnician, setNewTechnician] = useState("");

  const { data: customer } = useQuery<{ site_name: string; site_suburb: string | null } | null>({
    queryKey: ["customer-by-service-id", agreement.service_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("customers")
        .select("site_name, site_suburb")
        .eq("service_id", agreement.service_id)
        .maybeSingle();
      return data as { site_name: string; site_suburb: string | null } | null;
    },
    enabled: !!agreement.service_id,
  });

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
      technicians: agreement.technicians || "",
    },
  });

  // Auto-calculate total: unit_price * cpi + unit_price
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name !== "unit_price" && name !== "cpi") return;
      const up = parseFloat(values.unit_price || "");
      const cpi = parseFloat(values.cpi || "");
      if (!isNaN(up) && !isNaN(cpi)) {
        form.setValue("total", (up * cpi + up).toFixed(2));
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
        technicians: agreement.technicians || "",
      });
    }
  }, [open, agreement, form]);

  const handleAddToRuns = async () => {
    const values = form.getValues();
    if (!values.service_id) {
      toast.error("Service ID is required to add to Runs");
      return;
    }
    setAddingToRuns(true);
    try {
      // Check for duplicate run
      const { data: existing } = await supabase
        .from("runs")
        .select("id")
        .eq("service_id", values.service_id)
        .eq("products", values.products || "")
        .eq("week_day", values.week_day || "")
        .eq("weeks", values.weeks || "")
        .eq("frequency", values.service_frequency || "")
        .maybeSingle();

      if (existing) {
        toast.error("Cannot add duplicate data", {
          description: "A run with the same Service ID, product, week day, weeks, and frequency already exists.",
        });
        return;
      }

      const { error } = await supabase.from("runs").insert({
        service_id: values.service_id,
        clients: customer?.site_name || null,
        suburb: customer?.site_suburb || null,
        products: values.products || null,
        week_day: values.week_day || null,
        weeks: values.weeks || null,
        frequency: values.service_frequency || null,
        technicians: values.technicians || null,
        completed: "pending",
      });

      if (error) throw error;
      toast.success("Run added successfully");
    } catch (error: any) {
      toast.error("Failed to add to Runs", { description: error.message });
    } finally {
      setAddingToRuns(false);
    }
  };

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
        technicians: values.technicians || null,
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
          Schedule Runs
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
            {customer?.site_name && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="font-semibold text-base">{customer.site_name}</p>
                {customer.site_suburb && (
                  <p className="text-sm text-muted-foreground mt-0.5">{customer.site_suburb}</p>
                )}
              </div>
            )}
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
                                  if (trimmed) {
                                    addProductToDB(trimmed).then((ok) => {
                                      if (ok) field.onChange(trimmed);
                                    });
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
                              onClick={async () => {
                                const trimmed = newProduct.trim();
                                if (trimmed) {
                                  const ok = await addProductToDB(trimmed);
                                  if (ok) field.onChange(trimmed);
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
              name="technicians"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technician</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select technician" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {technicians.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                      <div className="p-1 border-t mt-1">
                        {addingTechnician ? (
                          <div className="flex gap-1 p-1">
                            <Input
                              autoFocus
                              value={newTechnician}
                              onChange={(e) => setNewTechnician(e.target.value)}
                              placeholder="New technician..."
                              className="h-7 text-xs"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const trimmed = newTechnician.trim();
                                  if (trimmed && !technicians.includes(trimmed)) {
                                    setTechnicians((prev) => [...prev, trimmed]);
                                    field.onChange(trimmed);
                                  }
                                  setNewTechnician("");
                                  setAddingTechnician(false);
                                }
                                if (e.key === "Escape") {
                                  setAddingTechnician(false);
                                  setNewTechnician("");
                                }
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => {
                                const trimmed = newTechnician.trim();
                                if (trimmed && !technicians.includes(trimmed)) {
                                  setTechnicians((prev) => [...prev, trimmed]);
                                  field.onChange(trimmed);
                                }
                                setNewTechnician("");
                                setAddingTechnician(false);
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="flex items-center gap-1 w-full px-2 py-1.5 text-xs text-primary hover:bg-accent rounded-sm"
                            onClick={() => setAddingTechnician(true)}
                          >
                            <Plus className="h-3 w-3" /> Add technician
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

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddToRuns}
                disabled={loading || deleteLoading || addingToRuns}
              >
                {addingToRuns ? "Adding..." : "Add to Runs"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
