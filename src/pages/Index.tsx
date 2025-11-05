import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, TrendingUp, Users } from "lucide-react";
import { RoleSelectionDialog } from "@/components/RoleSelectionDialog";

const Index = () => {
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  return (
    <div className="bg-background">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Hygiene Facility Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your customer management and service agreements with our comprehensive system
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          <Link to="/customers">
            <Card className="h-full hover:shadow-lg transition-all cursor-pointer border-border hover:border-primary">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Customers</CardTitle>
                    <CardDescription>View and manage customer database</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access comprehensive customer information, contact details, and site locations.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="h-full border-border opacity-75">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <FileText className="h-8 w-8 text-secondary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Service Agreements</CardTitle>
                  <CardDescription>Coming soon</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Manage contracts, pricing, and service schedules for your clients.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="border-border">
            <CardHeader>
              <Users className="h-6 w-6 text-primary mb-2" />
              <CardTitle>Customer Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track customer details, contact information, and site locations in one place.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <FileText className="h-6 w-6 text-primary mb-2" />
              <CardTitle>Service Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor active and inactive service agreements with detailed contract information.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <TrendingUp className="h-6 w-6 text-primary mb-2" />
              <CardTitle>Business Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access comprehensive data to make informed business decisions.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="text-lg px-8" onClick={() => setShowRoleDialog(true)}>
            Get Started
          </Button>
        </div>
      </div>

      <RoleSelectionDialog open={showRoleDialog} onOpenChange={setShowRoleDialog} />
    </div>
  );
};

export default Index;
