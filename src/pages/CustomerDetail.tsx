import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building2, Mail, Phone, MapPin, FileText, Plus, DollarSign } from "lucide-react";
import { toast } from "sonner";

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        toast.error("Failed to load customer details");
        throw error;
      }
      return data;
    },
  });

  const { data: serviceAgreements, isLoading: agreementsLoading } = useQuery({
    queryKey: ["service-agreements", customer?.service_id],
    queryFn: async () => {
      if (!customer?.service_id) return [];
      
      const { data, error } = await supabase
        .from("service_agreements")
        .select("*")
        .eq("service_id", customer.service_id)
        .order("created_at", { ascending: false });
      
      if (error) {
        toast.error("Failed to load service agreements");
        throw error;
      }
      return data;
    },
    enabled: !!customer?.service_id,
  });

  if (customerLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Customer Not Found</CardTitle>
              <CardDescription>The customer you're looking for doesn't exist.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-6">
          <Link to="/customers">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl mb-2">{customer.site_name}</CardTitle>
                  <CardDescription className="text-base">
                    Service ID: <span className="font-mono">{customer.service_id}</span>
                  </CardDescription>
                  {customer.delete_tag && (
                    <Badge variant="destructive" className="mt-2">Inactive</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Site Information
                </h3>
                <div className="space-y-2 text-sm">
                  {customer.site_street_name && (
                    <div>
                      <span className="text-muted-foreground">Street:</span>
                      <p className="font-medium">{customer.site_street_name}</p>
                    </div>
                  )}
                  {customer.site_suburb && (
                    <div>
                      <span className="text-muted-foreground">Suburb:</span>
                      <p className="font-medium">{customer.site_suburb}</p>
                    </div>
                  )}
                  {customer.site_post_code && (
                    <div>
                      <span className="text-muted-foreground">Post Code:</span>
                      <p className="font-medium">{customer.site_post_code}</p>
                    </div>
                  )}
                  {customer.postal_address && (
                    <div>
                      <span className="text-muted-foreground">Postal Address:</span>
                      <p className="font-medium">{customer.postal_address}</p>
                    </div>
                  )}
                  {customer.site_pobox && (
                    <div>
                      <span className="text-muted-foreground">PO Box:</span>
                      <p className="font-medium">{customer.site_pobox}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Contact Information
                </h3>
                <div className="space-y-2 text-sm">
                  {customer.site_contact_first_name && (
                    <div>
                      <span className="text-muted-foreground">Contact Person:</span>
                      <p className="font-medium">
                        {customer.site_contact_first_name} {customer.site_contact_lastname}
                      </p>
                    </div>
                  )}
                  {customer.site_accounts_contact && (
                    <div>
                      <span className="text-muted-foreground">Accounts Contact:</span>
                      <p className="font-medium">{customer.site_accounts_contact}</p>
                    </div>
                  )}
                  {customer.site_telephone_no1 && (
                    <div>
                      <span className="text-muted-foreground">Phone 1:</span>
                      <p className="font-medium">{customer.site_telephone_no1}</p>
                    </div>
                  )}
                  {customer.site_telephone_no2 && (
                    <div>
                      <span className="text-muted-foreground">Phone 2:</span>
                      <p className="font-medium">{customer.site_telephone_no2}</p>
                    </div>
                  )}
                  {customer.site_fax_no && (
                    <div>
                      <span className="text-muted-foreground">Fax:</span>
                      <p className="font-medium">{customer.site_fax_no}</p>
                    </div>
                  )}
                  {customer.site_email_address && (
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{customer.site_email_address}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(customer.contract_date || customer.date_cancel || customer.contract_notes || customer.notes) && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Additional Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {customer.contract_date && (
                      <div>
                        <span className="text-muted-foreground">Contract Date:</span>
                        <p className="font-medium">{new Date(customer.contract_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {customer.date_cancel && (
                      <div>
                        <span className="text-muted-foreground">Cancellation Date:</span>
                        <p className="font-medium">{new Date(customer.date_cancel).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  {customer.contract_notes && (
                    <div>
                      <span className="text-muted-foreground">Contract Notes:</span>
                      <p className="font-medium mt-1">{customer.contract_notes}</p>
                    </div>
                  )}
                  {customer.notes && (
                    <div>
                      <span className="text-muted-foreground">Notes:</span>
                      <p className="font-medium mt-1">{customer.notes}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-primary" />
                  Service Agreements
                </CardTitle>
                <CardDescription>Active service contracts for this customer</CardDescription>
              </div>
              <Link to={`/customers/${id}/agreements/new`}>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Agreement
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {agreementsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : serviceAgreements?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No service agreements found for this customer.</p>
                <p className="text-sm mt-2">Add your first service agreement to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {serviceAgreements?.map((agreement) => (
                  <Card key={agreement.id} className="border-border">
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-xs text-muted-foreground">Products</span>
                          <p className="font-medium">{agreement.products || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Areas Covered</span>
                          <p className="font-medium">{agreement.areas_covered || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Service Frequency</span>
                          <p className="font-medium">{agreement.service_frequency || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Status</span>
                          <Badge variant={agreement.service_active_inactive === "Active" ? "default" : "secondary"}>
                            {agreement.service_active_inactive || "N/A"}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Unit Price</span>
                          <p className="font-medium">${agreement.unit_price || "0.00"}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Total</span>
                          <p className="font-medium text-primary text-lg">${agreement.total || "0.00"}</p>
                        </div>
                      </div>
                      {agreement.comments && (
                        <div className="mt-4 pt-4 border-t">
                          <span className="text-xs text-muted-foreground">Comments:</span>
                          <p className="text-sm mt-1">{agreement.comments}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDetail;
