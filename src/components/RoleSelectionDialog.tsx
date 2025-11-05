import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface RoleSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RoleSelectionDialog = ({ open, onOpenChange }: RoleSelectionDialogProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"technician" | "admin">("technician");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Check if role already exists
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: selectedRole })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: user.id, role: selectedRole });

        if (error) throw error;
      }

      toast.success("Role saved successfully!");
      
      // Navigate based on role
      if (selectedRole === "technician") {
        navigate("/technician-dashboard");
      } else {
        navigate("/");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to save role: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Your Role</DialogTitle>
          <DialogDescription>
            Choose your role to access the appropriate dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as "technician" | "admin")}>
            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
              <RadioGroupItem value="technician" id="role-technician" />
              <Label htmlFor="role-technician" className="cursor-pointer flex-1 text-base font-medium">
                Technician
              </Label>
            </div>
            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
              <RadioGroupItem value="admin" id="role-admin" />
              <Label htmlFor="role-admin" className="cursor-pointer flex-1 text-base font-medium">
                Admin
              </Label>
            </div>
          </RadioGroup>
          <Button onClick={handleContinue} className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
