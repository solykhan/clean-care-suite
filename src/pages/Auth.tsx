import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { z } from "zod";
import { AlertCircle } from "lucide-react";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(255),
});

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Authentication is disabled, redirect to home
    navigate("/");
  }, [navigate]);

  return null;
};

export default Auth;
