import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [selectedRole, setSelectedRole] = useState<"technician" | "admin">("technician");

  const handleContinue = () => {
    if (selectedRole === "technician") {
      navigate("/technician-dashboard");
    } else {
      navigate("/");
    }
    onOpenChange(false);
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
          <Button onClick={handleContinue} className="w-full">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
