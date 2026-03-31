import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import type { Tables } from "@/integrations/supabase/types";

const runSchema = z.object({
  service_id: z.string().min(1, "Service ID is required"),
  clients: z.string().optional(),
  suburb: z.string().optional(),
  weeks: z.string().optional(),
  week_day: z.string().optional(),
  products: z.string().optional(),
  frequency: z.string().optional(),
  technicians: z.string().optional(),
  work: z.string().optional(),
});

type RunFormValues = z.infer<typeof runSchema>;

interface EditRunDialogProps {
  run: Tables<"runs"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRunDialog({ run, open, onOpenChange }: EditRunDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<RunFormValues>({
    resolver: zodResolver(runSchema),
    defaultValues: {
      service_id: "",
      clients: "",
      suburb: "",
      weeks: "",
      week_day: "",
      products: "",
      frequency: "",
      technicians: "",
      work: "",
    },
  });

  useEffect(() => {
    if (run && open) {
      form.reset({
        service_id: run.service_id || "",
        clients: run.clients || "",
        suburb: run.suburb || "",
        weeks: run.weeks || "",
        week_day: run.week_day || "",
        products: run.products || "",
        frequency: run.frequency || "",
        technicians: run.technicians || "",
        work: (run as any).work || "",
      });
    }
  }, [run, open, form]);

  const onSubmit = async (values: RunFormValues) => {
    if (!run) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("runs")
        .update({
          service_id: values.service_id,
          clients: values.clients || null,
          suburb: values.suburb || null,
          weeks: values.weeks || null,
          week_day: values.week_day || null,
          products: values.products || null,
          frequency: values.frequency || null,
          technicians: values.technicians || null,
          work: values.work || null,
        } as any)
        .eq("id", run.id);

      if (error) throw error;

      toast.success("Run updated successfully");
      queryClient.invalidateQueries({ queryKey: ["runs"] });
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update run");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Run</DialogTitle>
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
                    <Input placeholder="e.g. SRV-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clients</FormLabel>
                    <FormControl>
                      <Input placeholder="Client name(s)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="suburb"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suburb</FormLabel>
                    <FormControl>
                      <Input placeholder="Suburb" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weeks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weeks</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 1, 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="week_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Week Day</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Monday" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Weekly" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="technicians"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technicians</FormLabel>
                    <FormControl>
                      <Input placeholder="Technician name(s)" {...field} />
                    </FormControl>
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
                  <FormLabel>Products</FormLabel>
                  <FormControl>
                    <Input placeholder="Products" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
