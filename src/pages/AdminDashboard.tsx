import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserPlus } from "lucide-react";

const AdminDashboard = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-user-stats');

      if (error) {
        console.error('Error fetching user stats:', error);
        throw error;
      }

      return data as {
        totalUsers: number;
        activeTechnicians: number;
        recentSignups: number;
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-destructive">
          Failed to load statistics. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of users and system statistics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              All registered users in the system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Technicians</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeTechnicians || 0}</div>
            <p className="text-xs text-muted-foreground">
              Users with technician role
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recentSignups || 0}</div>
            <p className="text-xs text-muted-foreground">
              New users in the last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link
            to="/admin/users"
            className="block p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">User Management</h3>
                <p className="text-sm text-muted-foreground">Create and manage user accounts</p>
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;