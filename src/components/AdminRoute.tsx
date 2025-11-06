import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const hasShownToast = useRef(false);

  const { data: isAdmin, isLoading: roleLoading, error: roleError } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('[AdminRoute] No user ID available');
        return false;
      }
      
      console.log('[AdminRoute] Checking admin role for user:', user.id);
      
      const { data, error } = await supabase
        .rpc('has_role', { 
          _user_id: user.id, 
          _role: 'admin' 
        });

      console.log('[AdminRoute] has_role response:', { data, error });

      if (error) {
        console.error('[AdminRoute] Error checking admin role:', error);
        throw error;
      }

      console.log('[AdminRoute] User is admin:', data);
      return data;
    },
    enabled: !!user?.id,
    retry: 1,
  });

  useEffect(() => {
    if (!authLoading && !roleLoading && user && isAdmin === false && !hasShownToast.current) {
      console.log('[AdminRoute] Access denied, showing toast');
      toast.error("Access denied. Admin privileges required.");
      hasShownToast.current = true;
    }
  }, [authLoading, roleLoading, user, isAdmin]);

  console.log('[AdminRoute] Render state:', {
    authLoading,
    roleLoading,
    hasUser: !!user,
    isAdmin,
    roleError: roleError?.message
  });

  if (authLoading || roleLoading) {
    console.log('[AdminRoute] Showing loading spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (roleError) {
    console.log('[AdminRoute] Showing error:', roleError);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <p className="text-destructive">Error checking admin permissions</p>
          <p className="text-sm text-muted-foreground">{roleError.message}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('[AdminRoute] No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    console.log('[AdminRoute] User is not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('[AdminRoute] Access granted, rendering children');
  return <>{children}</>;
};
