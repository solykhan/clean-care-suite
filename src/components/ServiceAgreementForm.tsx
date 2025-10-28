import { useState } from "react";
import { useForm } from "react-hook-form";
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
});

type FormValues = z.infer<typeof formSchema>;

interface ServiceAgreementFormProps {
  serviceId?: string;
  onSuccess?: () => void;
}

export function ServiceAgreementForm({ serviceId, onSuccess }: ServiceAgreementFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service_id: serviceId || "",
      products: "",
      areas_covered: "",
      service_active_inactive: "active",
      service_frequency: "",
      invoice_type: "",
      cpm_device_onsite: "",
      unit_price: "",
      cpm_pricing: "",
      cpi: "",
      total: "",
      comments: "",
    },
  });

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
        <Button>
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="fortnightly">Fortnightly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
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
                  <FormControl>
                    <Textarea 
                      placeholder="Enter products or services included"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
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
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="variable">Variable</SelectItem>
                        <SelectItem value="usage_based">Usage Based</SelectItem>
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
                    <FormLabel>Total</FormLabel>
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

            <div className="flex justify-end gap-2 pt-4">
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
