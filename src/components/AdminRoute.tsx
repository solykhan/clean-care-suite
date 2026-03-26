import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, role, loading } = useAuth();
  const hasShownToast = useRef(false);

  const isAdmin = role === "admin";

  useEffect(() => {
    if (!loading && user && !isAdmin && role !== null && !hasShownToast.current) {
      toast.error("Access denied. Admin privileges required.");
      hasShownToast.current = true;
    }
  }, [loading, user, isAdmin, role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/technician-dashboard" replace />;
  }

  return <>{children}</>;
};
