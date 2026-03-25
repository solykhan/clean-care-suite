import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Allows access to both admins and technicians.
 * Blocks unauthenticated users (redirects to /auth).
 */
export const TechnicianRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, role, loading } = useAuth();

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

  // Both admin and technician are allowed
  if (role !== "admin" && role !== "technician") {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
