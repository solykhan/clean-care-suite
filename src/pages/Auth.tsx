import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Shield, Mail } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

const Auth = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      setOtpSent(true);
      toast.success("Check your email for the verification code");
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp,
        type: "email",
      });

      if (error) throw error;

      toast.success("Successfully authenticated!");
      navigate("/");
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast.error(error.message || "Invalid verification code");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
      toast.success("New verification code sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Secure Login</CardTitle>
          <CardDescription>
            {otpSent
              ? "Enter the 6-digit code sent to your email"
              : "Enter your email to receive a verification code"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                    autoComplete="email"
                    maxLength={255}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Verification Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-center block">
                  Verification Code
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Code sent to: <span className="font-medium">{email}</span>
                </p>
              </div>
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    Resend Code
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                    disabled={loading}
                  >
                    Change Email
                  </Button>
                </div>
              </div>
            </form>
          )}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Secured with enterprise-grade authentication</p>
            <p className="mt-1">Code expires in 60 minutes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
