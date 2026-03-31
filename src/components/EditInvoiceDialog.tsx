import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const schema = z.object({
  inv_id: z.string().min(1, "Invoice ID is required"),
  entry_date: z.date().optional(),
  particulars: z.string().optional(),
  user_date: z.date().optional(),
});

type FormValues = z.infer<typeof schema>;

interface EditInvoiceDialogProps {
  serviceId: string;
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
}

export function EditInvoiceDialog({ serviceId, externalOpen, onExternalOpenChange }: EditInvoiceDialogProps) {
  const isControlled = externalOpen !== undefined;
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { inv_id: serviceId, particulars: "" },
  });

  const loadInvoice = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("inv_id", serviceId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setInvoiceId(data.id);
        form.reset({
          inv_id: data.inv_id,
          particulars: data.particulars ?? "",
          entry_date: data.entry_date ? parseISO(data.entry_date) : undefined,
          user_date: data.user_date ? parseISO(data.user_date) : undefined,
        });
      } else {
        toast.info("No invoice found for this service ID. You can create one.");
        setInvoiceId(null);
        form.reset({ inv_id: serviceId, particulars: "" });
      }
    } catch (e: any) {
      toast.error("Failed to load invoice", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const isOpen = isControlled ? externalOpen : open;

  const handleOpenChange = (val: boolean) => {
    if (isControlled) {
      onExternalOpenChange?.(val);
    } else {
      setOpen(val);
    }
    if (val) loadInvoice();
  };

  useEffect(() => {
    if (isControlled && externalOpen) loadInvoice();
  }, [isControlled, externalOpen]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const payload = {
        inv_id: values.inv_id,
        entry_date: values.entry_date ? format(values.entry_date, "yyyy-MM-dd") : null,
        particulars: values.particulars || null,
        user_date: values.user_date ? format(values.user_date, "yyyy-MM-dd") : null,
      };

      if (invoiceId) {
        const { error } = await supabase.from("invoices").update(payload).eq("id", invoiceId);
        if (error) throw error;
        toast.success("Invoice updated successfully");
      } else {
        const { error } = await supabase.from("invoices").insert(payload);
        if (error) throw error;
        toast.success("Invoice created successfully");
      }

      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      handleOpenChange(false);
    } catch (e: any) {
      toast.error("Failed to save invoice", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit Invoice
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{invoiceId ? "Edit Invoice" : "Create Invoice"}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground text-sm animate-pulse">
            Loading invoice…
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="inv_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice ID</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-muted cursor-not-allowed" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entry_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Entry Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "dd-MM-yyyy") : "Pick a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="particulars"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Particulars</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter description or details..." rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="user_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>User Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "dd-MM-yyyy") : "Pick a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : invoiceId ? "Update Invoice" : "Create Invoice"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
