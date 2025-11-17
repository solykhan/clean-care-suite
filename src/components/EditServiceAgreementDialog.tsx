import { useState, useEffect } from "react";
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
import { Pencil, Trash2 } from "lucide-react";

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

interface EditServiceAgreementDialogProps {
  agreement: any;
  onSuccess?: () => void;
}

export function EditServiceAgreementDialog({ agreement, onSuccess }: EditServiceAgreementDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    },
  });

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
                    <FormControl>
                      <Input placeholder="Enter invoice type" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoice_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter invoice type" {...field} />
                    </FormControl>
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

              <FormField
                control={form.control}
                name="service_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Frequency</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter frequency" {...field} />
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
