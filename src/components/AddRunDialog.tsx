import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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

const runSchema = z.object({
  service_id: z.string().min(1, "Service ID is required"),
  clients: z.string().optional(),
  suburb: z.string().optional(),
  weeks: z.string().optional(),
  week_day: z.string().optional(),
  products: z.string().optional(),
  frequency: z.string().optional(),
  technicians: z.string().optional(),
});

type RunFormValues = z.infer<typeof runSchema>;

export function AddRunDialog() {
  const [open, setOpen] = useState(false);
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
    },
  });

  const onSubmit = async (values: RunFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("runs").insert({
        service_id: values.service_id,
        clients: values.clients || null,
        suburb: values.suburb || null,
        weeks: values.weeks || null,
        week_day: values.week_day || null,
        products: values.products || null,
        frequency: values.frequency || null,
        technicians: values.technicians || null,
        completed: "pending",
      });

      if (error) throw error;

      toast.success("Run added successfully");
      queryClient.invalidateQueries({ queryKey: ["runs"] });
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to add run");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Run
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Run</DialogTitle>
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Add Run"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
