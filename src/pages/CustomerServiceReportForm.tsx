import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ClipboardList } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRef, useEffect } from "react";
import { SignaturePad, SignaturePadRef } from "@/components/SignaturePad";

const formSchema = z.object({
  run_id: z.string().min(1, "Please select a run"),
  service_id: z.string().optional(),
  technician_name: z.string().max(255).optional(),
  site_officer_name: z.string().max(255).optional(),
  sanitary_bins: z.coerce.number().min(0).optional().nullable(),
  pedal_bins: z.coerce.number().min(0).optional().nullable(),
  sensor_bins: z.coerce.number().min(0).optional().nullable(),
  nappy_bins: z.coerce.number().min(0).optional().nullable(),
  medical_bins: z.coerce.number().min(0).optional().nullable(),
  sharps_1_4lt_8lt: z.coerce.number().min(0).optional().nullable(),
  air_fresheners: z.coerce.number().min(0).optional().nullable(),
  hand_soap: z.coerce.number().min(0).optional().nullable(),
  grit_soap: z.coerce.number().min(0).optional().nullable(),
  hand_sanitisers: z.coerce.number().min(0).optional().nullable(),
  sanitising_wipes: z.coerce.number().min(0).optional().nullable(),
  toilet_seat_sprays: z.coerce.number().min(0).optional().nullable(),
  wc_sanitisers: z.coerce.number().min(0).optional().nullable(),
  urinal_sanitisers: z.coerce.number().min(0).optional().nullable(),
  urinal_mats: z.coerce.number().min(0).optional().nullable(),
  urinal_treatment: z.coerce.number().min(0).optional().nullable(),
  others: z.coerce.number().min(0).optional().nullable(),
  comments: z.string().max(1000).optional(),
  s_officer_sig: z.string().max(255).optional(),
  tech_sig: z.string().max(255).optional(),
});

type FormData = z.infer<typeof formSchema>;

const CustomerServiceReportForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const serviceIdFromUrl = searchParams.get("service_id");
  const officerSignaturePadRef = useRef<SignaturePadRef>(null);
  const techSignaturePadRef = useRef<SignaturePadRef>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      run_id: "",
      service_id: "",
      technician_name: "",
      site_officer_name: "",
      comments: "",
      s_officer_sig: "",
      tech_sig: "",
    },
  });

  const { data: runs, isLoading: isLoadingRuns } = useQuery({
    queryKey: ["runs", serviceIdFromUrl],
    queryFn: async () => {
      let query = supabase
        .from("runs")
        .select("*")
        .order("service_id", { ascending: true });
      
      if (serviceIdFromUrl) {
        query = query.eq("service_id", serviceIdFromUrl);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });

  // Auto-populate fields when service_id is provided in URL
  useEffect(() => {
    if (serviceIdFromUrl && runs && runs.length > 0) {
      const matchingRun = runs[0]; // Get the first matching run
      form.setValue("run_id", matchingRun.id);
      form.setValue("service_id", matchingRun.service_id);
      form.setValue("technician_name", matchingRun.technicians || "");
    }
  }, [serviceIdFromUrl, runs, form]);

  const createReport = useMutation({
    mutationFn: async (data: FormData) => {
      const { run_id, ...reportData } = data;
      
      // Get the signatures as base64
      const officerSignatureData = officerSignaturePadRef.current?.toDataURL() || null;
      const techSignatureData = techSignaturePadRef.current?.toDataURL() || null;
      
      const { error } = await supabase
        .from("customer_service_reports")
        .insert({
          run_id,
          ...reportData,
          s_officer_sig: officerSignatureData,
          tech_sig: techSignatureData,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Customer service report created successfully");
      queryClient.invalidateQueries({ queryKey: ["customer_service_reports"] });
      form.reset();
      officerSignaturePadRef.current?.clear();
      techSignaturePadRef.current?.clear();
      navigate("/runs");
    },
    onError: (error) => {
      toast.error("Failed to create report: " + error.message);
    },
  });

  const onSubmit = (data: FormData) => {
    // Validate signatures are not empty
    if (officerSignaturePadRef.current?.isEmpty()) {
      toast.error("Please provide a service officer signature");
      return;
    }
    if (techSignaturePadRef.current?.isEmpty()) {
      toast.error("Please provide a technician signature");
      return;
    }
    createReport.mutate(data);
  };

  const handleRunChange = (runId: string) => {
    const selectedRun = runs?.find((run) => run.id === runId);
    if (selectedRun) {
      form.setValue("service_id", selectedRun.service_id);
      form.setValue("technician_name", selectedRun.technicians || "");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Customer Service Report</h1>
        </div>
        <p className="text-muted-foreground">Create a new customer service report</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Report Details</CardTitle>
          <CardDescription>Fill in the service report information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="run_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Run *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleRunChange(value);
                        }} 
                        value={field.value}
                        disabled={isLoadingRuns}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a run" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {runs?.map((run) => (
                            <SelectItem key={run.id} value={run.id}>
                              {run.service_id} - {run.clients} ({run.suburb})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="service_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service ID</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Quantities</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="sanitary_bins"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sanitary Bins</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pedal_bins"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pedal Bins</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sensor_bins"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sensor Bins</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nappy_bins"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nappy Bins</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medical_bins"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Bins</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sharps_1_4lt_8lt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sharps 1.4Lt-8Lt</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="air_fresheners"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Air Fresheners</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hand_soap"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hand Soap</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="grit_soap"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grit Soap</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hand_sanitisers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hand Sanitisers</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sanitising_wipes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sanitising Wipes</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="toilet_seat_sprays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Toilet Seat Sprays</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wc_sanitisers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WC Sanitisers</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="urinal_sanitisers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urinal Sanitisers</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="urinal_mats"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urinal Mats</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="urinal_treatment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urinal Treatment</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="others"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Others</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="technician_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Technician Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Enter technician name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="site_officer_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Officer Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Enter site officer name" />
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
                        <Textarea {...field} value={field.value || ""} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Service Officer Signature *</FormLabel>
                    <SignaturePad ref={officerSignaturePadRef} />
                  </div>

                  <div>
                    <FormLabel>Technician Signature *</FormLabel>
                    <SignaturePad ref={techSignaturePadRef} />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={createReport.isPending}>
                  {createReport.isPending ? "Creating..." : "Create Report"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/runs")}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerServiceReportForm;
