import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

const HyTrackDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: customers, isLoading } = useQuery({
    queryKey: ["hytrack-dashboard-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, service_id, site_name, site_suburb, site_telephone_no1, site_email_address, delete_tag")
        .order("site_name", { ascending: true });
      if (error) {
        toast.error("Failed to load customers");
        throw error;
      }
      return data;
    },
  });

  const filteredCustomers = customers?.filter((c) =>
    c.site_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.service_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.site_suburb?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCustomerClick = (customerId: string) => {
    navigate(`/hytrack?customerId=${customerId}`);
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">HyTrack Dashboard - Service Agreement</h1>
          <p className="text-muted-foreground">Select a customer to view their HyTrack service details</p>

          <div className="relative mt-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers by name, ID, or suburb..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCustomers?.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Customers Found</CardTitle>
              <CardDescription>
                {searchTerm ? "No customers match your search." : "No customers available."}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers?.map((customer) => (
              <Card
                key={customer.id}
                className="h-full hover:shadow-lg transition-shadow cursor-pointer border-border hover:border-primary"
                onClick={() => handleCustomerClick(customer.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    {customer.delete_tag && <Badge variant="destructive">Inactive</Badge>}
                  </div>
                  <CardTitle className="text-xl">{customer.site_name}</CardTitle>
                  <CardDescription className="font-mono text-xs">{customer.service_id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {customer.site_suburb && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium">Location:</span>
                        <span>{customer.site_suburb}</span>
                      </div>
                    )}
                    {customer.site_telephone_no1 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span className="text-xs">{customer.site_telephone_no1}</span>
                      </div>
                    )}
                    {customer.site_email_address && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs truncate">{customer.site_email_address}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HyTrackDashboard;
