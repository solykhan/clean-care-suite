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
import { Plus } from "lucide-react";

const formSchema = z.object({
  service_id: z.string().min(1, "Service ID is required"),
  products: z.string().optional(),
  areas_covered: z.string().optional(),
  service_active_inactive: z.string().optional(),
  service_frequency: z.string().optional(),
  invoice_type: z.string().optional(),
  cpm_device_onsite: z.string().optional(),
  unit_price: z.string().optional(),
  cpm_pricing: z.string().optional(),
  cpi: z.string().optional(),
  total: z.string().optional(),
  comments: z.string().optional(),
  week_day: z.string().optional(),
  weeks: z.string().optional(),
  technicians: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ServiceAgreementFormProps {
  serviceId?: string;
  onSuccess?: () => void;
  disabled?: boolean;
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

export function ServiceAgreementForm({ serviceId, onSuccess, disabled }: ServiceAgreementFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
    queryKey: ["customer-by-service-id", serviceId],
    queryFn: async () => {
      const { data } = await supabase
        .from("customers")
        .select("site_name, site_suburb")
        .eq("service_id", serviceId!)
        .maybeSingle();
      return data as { site_name: string; site_suburb: string | null } | null;
    },
    enabled: !!serviceId,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service_id: serviceId || "",
      products: "",
      areas_covered: "",
      service_active_inactive: "Active",
      service_frequency: "",
      invoice_type: "",
      cpm_device_onsite: "",
      unit_price: "",
      cpm_pricing: "",
      cpi: "",
      total: "",
      comments: "",
      week_day: "",
      weeks: "",
      technicians: "",
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
      // Convert string numbers to numeric types
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

      const { error } = await supabase.from("service_agreements").insert([data]);

      if (error) throw error;

      toast.success("Service agreement created successfully");
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error("Failed to create service agreement", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Plus className="mr-2 h-4 w-4" />
          New Service Agreement
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Service Agreement</DialogTitle>
          <DialogDescription>
            Add a new service agreement with pricing and service details.
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
                    <Input placeholder="Enter service ID" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                name="invoice_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddToRuns}
                disabled={loading || addingToRuns}
              >
                {addingToRuns ? "Adding..." : "Add to Runs"}
              </Button>
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
                  {loading ? "Creating..." : "Create Service Agreement"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
