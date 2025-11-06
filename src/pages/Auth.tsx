import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(255),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = authSchema.safeParse({ email });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      // Check if user exists first
      const { data: checkData, error: checkError } = await supabase.functions.invoke('check-user-exists', {
        body: { email: email.trim().toLowerCase() }
      });

      if (checkError) {
        throw new Error("Failed to verify email");
      }

      if (!checkData.exists) {
        toast.error("Sign Up first by Admin");
        setLoading(false);
        return;
      }

      // User exists, send OTP
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
      setOtpSent(true);
      toast.success("Check your email for the login link!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send login link");
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
            Sign in to your account
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
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Login Link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
