import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(255),
  role: z.enum(["technician", "admin"]).optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<"technician" | "admin">("technician");
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = authSchema.safeParse({ 
      email, 
      role: isSignUp ? role : undefined 
    });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // For signup, send OTP and store role
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              role: role,
            },
          },
        });

        if (error) throw error;
        
        setOtpSent(true);
        toast.success("Check your email for the login link!");
      } else {
        // For login, just send OTP
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;
        setOtpSent(true);
        toast.success("Check your email for the login link!");
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isSignUp ? "sign up" : "send login link"}`);
    } finally {
      setLoading(false);
    }
  };

  if (otpSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              We've sent you a login link. Click the link in your email to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => {
                setOtpSent(false);
                setEmail("");
              }} 
              variant="outline" 
              className="w-full"
            >
              Use Different Email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            {isSignUp ? "Create a new account" : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                maxLength={255}
              />
            </div>
            
            {isSignUp && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Role</label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as "technician" | "admin")} disabled={loading}>
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
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : (isSignUp ? "Send Sign Up Link" : "Send Login Link")}
            </Button>
            <Button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              variant="ghost"
              className="w-full"
              disabled={loading}
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
