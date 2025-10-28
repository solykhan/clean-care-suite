import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, Plus, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("site_name", { ascending: true });
      
      if (error) {
        toast.error("Failed to load customers");
        throw error;
      }
      return data;
    },
  });

  const filteredCustomers = customers?.filter((customer) =>
    customer.site_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.service_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.site_suburb?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Customers</CardTitle>
            <CardDescription>Unable to fetch customer data. Please try again.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Customers</h1>
              <p className="text-muted-foreground">Manage your hygiene facility customers</p>
            </div>
            <Link to="/customers/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
            </Link>
          </div>

          <div className="relative">
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
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
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
                {searchTerm
                  ? "No customers match your search criteria."
                  : "Get started by adding your first customer."}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers?.map((customer) => (
              <Link key={customer.id} to={`/customers/${customer.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-border hover:border-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      {customer.delete_tag && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{customer.site_name}</CardTitle>
                    <CardDescription className="font-mono text-xs">
                      {customer.service_id}
                    </CardDescription>
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
