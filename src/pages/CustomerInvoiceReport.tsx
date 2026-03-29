import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ArrowLeft, Printer } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CustomerInvoiceReport = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("site_name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const selectedCustomer = customers?.find((c) => c.id === selectedCustomerId);

  const { data: serviceAgreements, isLoading: isLoadingAgreements } = useQuery({
    queryKey: ["report-agreements", selectedCustomer?.service_id],
    queryFn: async () => {
      if (!selectedCustomer?.service_id) return [];
      const { data, error } = await supabase
        .from("service_agreements")
        .select("*")
        .eq("service_id", selectedCustomer.service_id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCustomer?.service_id,
  });

  const { data: invoices } = useQuery({
    queryKey: ["report-invoices", selectedCustomer?.service_id],
    queryFn: async () => {
      if (!selectedCustomer?.service_id) return [];
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("inv_id", selectedCustomer.service_id)
        .order("entry_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCustomer?.service_id,
  });

  const filteredCustomers = customers?.filter(
    (customer) =>
      customer.site_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.service_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.site_suburb?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const annualTotal = serviceAgreements?.reduce((sum, a) => sum + (a.total || 0), 0) || 0;
  const invoiceType = serviceAgreements?.[0]?.invoice_type || "ANNUALLY";

  const handlePrint = () => window.print();

  // Customer list view
  if (!selectedCustomerId) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Customer Invoice Report</h1>
          <p className="text-muted-foreground mt-1">Select a customer to generate their report</p>
        </div>

        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID or suburb..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoadingCustomers ? (
              <div className="p-6 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold w-16"></TableHead>
                      <TableHead className="font-bold">ID</TableHead>
                      <TableHead className="font-bold">Name of Customer</TableHead>
                      <TableHead className="font-bold">Suburb</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers && filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer, index) => (
                        <TableRow
                          key={customer.id}
                          className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                        >
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-3 text-xs font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                              onClick={() => setSelectedCustomerId(customer.id)}
                            >
                              Go
                            </Button>
                          </TableCell>
                          <TableCell className="font-mono text-sm font-semibold">
                            {customer.service_id}
                          </TableCell>
                          <TableCell className="font-medium">{customer.site_name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {customer.site_suburb || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No customers found{searchTerm ? ` matching "${searchTerm}"` : ""}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Report view
  return (
    <div className="container mx-auto p-6 space-y-4">
      {/* Screen-only controls */}
      <div className="flex items-center gap-3 print:hidden">
        <Button variant="ghost" size="sm" onClick={() => setSelectedCustomerId(null)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-1" />
          Print Report
        </Button>
      </div>

      {isLoadingAgreements ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="bg-white text-black border rounded-lg shadow-sm print:shadow-none print:border-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-white px-8 py-6 border-b">
            <h1 className="text-4xl font-bold italic text-gray-800 tracking-wide">HyTrack</h1>
            <p className="text-xs text-gray-600 mt-1">CPM Hygiene Services Foundry Road Seven Hills NSW</p>
            <h2 className="text-sm font-bold text-gray-800 mt-3 tracking-wider">
              CUSTOMER ONSITE HYGIENE LISTING AND INVOICING DETAILS
            </h2>
          </div>

          {/* Customer Details */}
          <div className="px-8 py-5 space-y-2 text-sm border-b">
            <div className="flex gap-8">
              <div className="flex gap-2">
                <span className="font-bold">ID:</span>
                <span>{selectedCustomer?.service_id}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold italic">Invoiced Under:</span>
                <span>{selectedCustomer?.site_accounts_contact || selectedCustomer?.site_name}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="font-bold">Client:</span>
              <span>{selectedCustomer?.site_name}</span>
            </div>
            <div className="flex flex-wrap gap-x-12 gap-y-1">
              <div className="flex gap-2 max-w-md">
                <span className="font-bold">Site Address:</span>
                <span>
                  {[selectedCustomer?.site_street_name, selectedCustomer?.site_suburb, selectedCustomer?.site_post_code]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">Contact 1:</span>
                <span>
                  {selectedCustomer?.site_contact_first_name || ""} {selectedCustomer?.site_contact_lastname || ""}
                  {selectedCustomer?.site_telephone_no1 && (
                    <span className="block text-xs">{selectedCustomer.site_telephone_no1}</span>
                  )}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">Contact 2:</span>
                <span>{selectedCustomer?.site_telephone_no2 || ""}</span>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="px-8 py-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-400">
                  <th className="text-left py-2 font-bold">PRODUCT</th>
                  <th className="text-center py-2 font-bold w-16">QTY</th>
                  <th className="text-center py-2 font-bold">SERVICE FREQUENCY</th>
                  <th className="text-right py-2 font-bold">UNIT RATE</th>
                  <th className="text-right py-2 font-bold">TOTAL PER ANNUM</th>
                </tr>
              </thead>
              <tbody>
                {serviceAgreements && serviceAgreements.length > 0 ? (
                  serviceAgreements.map((agreement) => (
                    <tr key={agreement.id} className="border-b border-gray-200">
                      <td className="py-2">{agreement.products || "-"}</td>
                      <td className="py-2 text-center">{agreement.cpm_device_onsite || "-"}</td>
                      <td className="py-2 text-center">{agreement.service_frequency || "-"}</td>
                      <td className="py-2 text-right">
                        {agreement.unit_price ? `$${Number(agreement.unit_price).toFixed(2)}` : "-"}
                      </td>
                      <td className="py-2 text-right">
                        {agreement.total ? `$${Number(agreement.total).toFixed(2)}` : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      No service agreements found for this customer
                    </td>
                  </tr>
                )}
              </tbody>
              {serviceAgreements && serviceAgreements.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-gray-400 font-bold">
                    <td className="py-2" colSpan={2}>
                      Invoiced <span className="uppercase">{invoiceType}</span>
                    </td>
                    <td className="py-2 text-center">@</td>
                    <td className="py-2 text-right">${annualTotal.toFixed(2)}</td>
                    <td className="py-2 text-right">
                      <span className="text-xs font-normal mr-2">Annual Total:</span>
                      ${annualTotal.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Notes / Invoice History */}
          {invoices && invoices.length > 0 && (
            <div className="px-8 py-4 border-t">
              <div className="text-xs text-center font-bold text-gray-600 mb-3">
                *** Financial Year Rollover....  REFER TO FILE FOR INFO PRIOR TO JULY **
              </div>
              <div className="space-y-1 text-sm">
                {invoices.map((inv) => {
                  const date = inv.entry_date
                    ? new Date(inv.entry_date).toLocaleDateString("en-AU", { month: "short", year: "numeric" })
                    : inv.user_date
                    ? new Date(inv.user_date).toLocaleDateString("en-AU", { month: "short", year: "numeric" })
                    : "";
                  return (
                    <div key={inv.id} className="flex gap-4 border-b border-gray-100 py-1">
                      <span className="font-semibold text-gray-700 w-24 shrink-0">{date}</span>
                      <span>{inv.particulars || "-"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer space */}
          <div className="h-8" />
        </div>
      )}
    </div>
  );
};

export default CustomerInvoiceReport;
