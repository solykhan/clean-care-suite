import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
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

interface AddInvoiceDialogProps {
  defaultInvId?: string;
  triggerLabel?: string;
}

export function AddInvoiceDialog({ defaultInvId, triggerLabel }: AddInvoiceDialogProps = {}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { inv_id: defaultInvId ?? "", particulars: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("invoices").insert({
        inv_id: values.inv_id,
        entry_date: values.entry_date ? format(values.entry_date, "yyyy-MM-dd") : null,
        particulars: values.particulars || null,
        user_date: values.user_date ? format(values.user_date, "yyyy-MM-dd") : null,
      });
      if (error) throw error;
      toast.success("Invoice added successfully");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      form.reset();
      setOpen(false);
    } catch (e: any) {
      toast.error("Failed to add invoice", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Invoice</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Invoice ID */}
            <FormField
              control={form.control}
              name="inv_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. INV-0001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Entry Date */}
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
                          {field.value ? format(field.value, "dd/MM/yyyy") : "Pick a date"}
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

            {/* Particulars */}
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

            {/* User Date */}
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
                          {field.value ? format(field.value, "dd/MM/yyyy") : "Pick a date"}
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
                {saving ? "Saving…" : "Save Invoice"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
