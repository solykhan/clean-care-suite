import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(255),
  role: z.enum(["technician", "admin"]),
});

const AdminUserManagement = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"technician" | "admin">("technician");
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = userSchema.safeParse({ email, role });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      // Create user account with signUp
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: Math.random().toString(36).slice(-12), // Random temp password
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            role: role,
          },
        },
      });

      if (error) throw error;

      toast.success(`User created successfully! Login link sent to ${email}`);
      setEmail("");
      setRole("technician");
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
          <CardDescription>
            Add a new technician or admin to the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter user email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                maxLength={255}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Role</label>
              <RadioGroup 
                value={role} 
                onValueChange={(value) => setRole(value as "technician" | "admin")} 
                disabled={loading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="technician" id="technician" />
                  <Label htmlFor="technician" className="cursor-pointer">Technician</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="cursor-pointer">Admin</Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating User..." : "Create User"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManagement;