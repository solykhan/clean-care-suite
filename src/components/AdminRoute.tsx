import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const hasShownToast = useRef(false);

  console.log('AdminRoute - auth state:', { user: !!user, authLoading });

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      console.log('AdminRoute - checking admin role for user:', user?.id);
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .rpc('has_role', { 
          _user_id: user.id, 
          _role: 'admin' 
        });

      if (error) {
        console.error('AdminRoute - Error checking admin role:', error);
        return false;
      }

      console.log('AdminRoute - has_role result:', data);
      return data;
    },
    enabled: !!user?.id,
  });

  console.log('AdminRoute - state:', { authLoading, roleLoading, isAdmin });

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  useEffect(() => {
    if (!authLoading && !roleLoading && user && isAdmin === false && !hasShownToast.current) {
      toast.error("Access denied. Admin privileges required.");
      hasShownToast.current = true;
    }
  }, [authLoading, roleLoading, user, isAdmin]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
