import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Building2 } from "lucide-react";

const formSchema = z.object({
  service_id: z.string().min(1, "Service ID is required"),
  site_name: z.string().min(1, "Site name is required"),
  site_street_name: z.string().optional(),
  site_suburb: z.string().optional(),
  site_post_code: z.string().optional(),
  postal_address: z.string().optional(),
  site_pobox: z.string().optional(),
  site_contact_first_name: z.string().optional(),
  site_contact_lastname: z.string().optional(),
  site_accounts_contact: z.string().optional(),
  site_telephone_no1: z.string().optional(),
  site_telephone_no2: z.string().optional(),
  site_fax_no: z.string().optional(),
  site_email_address: z.string().email("Invalid email address").optional().or(z.literal("")),
  contract_date: z.string().optional(),
  date_cancel: z.string().optional(),
  contract_notes: z.string().optional(),
  notes: z.string().optional(),
  delete_tag: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const AddCustomer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service_id: "",
      site_name: "",
      site_street_name: "",
      site_suburb: "",
      site_post_code: "",
      postal_address: "",
      site_pobox: "",
      site_contact_first_name: "",
      site_contact_lastname: "",
      site_accounts_contact: "",
      site_telephone_no1: "",
      site_telephone_no2: "",
      site_fax_no: "",
      site_email_address: "",
      contract_date: "",
      date_cancel: "",
      contract_notes: "",
      notes: "",
      delete_tag: false,
    },
  });

  useEffect(() => {
    const generateServiceId = async () => {
      try {
        const { data, error } = await supabase
          .from("customers")
          .select("service_id")
          .order("service_id", { ascending: false })
          .limit(100);

        if (error) throw error;

        let newServiceId = "1000";
        
        if (data && data.length > 0) {
          // Find the highest numeric service_id
          const numericIds = data
            .map(item => parseInt(item.service_id))
            .filter(id => !isNaN(id))
            .sort((a, b) => b - a);
          
          if (numericIds.length > 0) {
            newServiceId = String(numericIds[0] + 1);
          }
        }

        form.setValue("service_id", newServiceId);
      } catch (error: any) {
        toast.error("Failed to generate service ID", {
          description: error.message,
        });
      } finally {
        setGeneratingId(false);
      }
    };

    generateServiceId();
  }, [form]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const data = {
        service_id: values.service_id,
        site_name: values.site_name,
        site_street_name: values.site_street_name || null,
        site_suburb: values.site_suburb || null,
        site_post_code: values.site_post_code || null,
        postal_address: values.postal_address || null,
        site_pobox: values.site_pobox || null,
        site_contact_first_name: values.site_contact_first_name || null,
        site_contact_lastname: values.site_contact_lastname || null,
        site_accounts_contact: values.site_accounts_contact || null,
        site_telephone_no1: values.site_telephone_no1 || null,
        site_telephone_no2: values.site_telephone_no2 || null,
        site_fax_no: values.site_fax_no || null,
        site_email_address: values.site_email_address || null,
        contract_date: values.contract_date || null,
        date_cancel: values.date_cancel || null,
        contract_notes: values.contract_notes || null,
        notes: values.notes || null,
        delete_tag: values.delete_tag,
      };

      const { error } = await supabase.from("customers").insert([data]);

      if (error) throw error;

      toast.success("Customer created successfully");
      navigate("/customers");
    } catch (error: any) {
      toast.error("Failed to create customer", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-6">
          <Link to="/customers">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-3xl mb-2">Add New Customer</CardTitle>
                <CardDescription className="text-base">
                  Fill in the customer details to create a new customer record
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Basic Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="service_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service ID * (Auto-generated)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Generating..." 
                              {...field} 
                              disabled 
                              className="bg-muted"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="site_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter site name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Site Address</h3>
                  
                  <FormField
                    control={form.control}
                    name="site_street_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter street name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="site_suburb"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Suburb</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter suburb" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="site_post_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Post Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter post code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="postal_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter postal address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="site_pobox"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PO Box</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter PO Box" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Contact Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="site_contact_first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="site_contact_lastname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="site_accounts_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accounts Contact</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter accounts contact" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="site_telephone_no1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone 1</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="site_telephone_no2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone 2</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="site_fax_no"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fax Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter fax number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="site_email_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Contract Details</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contract_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contract Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date_cancel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cancellation Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="contract_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter contract notes"
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
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>General Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter general notes"
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
                    name="delete_tag"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Mark as Inactive
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/customers")}
                    disabled={loading || generatingId}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || generatingId}>
                    {generatingId ? "Generating ID..." : loading ? "Creating..." : "Create Customer"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddCustomer;
