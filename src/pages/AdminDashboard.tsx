import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, UserCheck, UserPlus, CheckCircle, Clock, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-user-stats');
      if (error) throw error;
      return data as { totalUsers: number; activeTechnicians: number; recentSignups: number };
    },
  });

  // Fetch all technician profiles
  const { data: technicianProfiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['technicianProfiles'],
    queryFn: async () => {
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'technician');
      if (rolesError) throw rolesError;

      const userIds = roles?.map(r => r.user_id) ?? [];
      if (userIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);
      if (profilesError) throw profilesError;

      return profiles ?? [];
    },
  });

  // Fetch all runs
  const { data: allRuns, isLoading: runsLoading } = useQuery({
    queryKey: ['allRunsForDashboard'],
    queryFn: async () => {
      const { data, error } = await supabase.from('runs').select('id, technicians, work');
      if (error) throw error;
      return data ?? [];
    },
  });

  const isLoading = statsLoading || profilesLoading || runsLoading;

  // Build per-technician run stats
  const technicianStats = (technicianProfiles ?? []).map((profile) => {
    const name = profile.username ?? '';
    const myRuns = (allRuns ?? []).filter(
      (r) => r.technicians && r.technicians.toLowerCase().includes(name.toLowerCase())
    );
    const completed = myRuns.filter((r) => r.work === 'Completed').length;
    const pending = myRuns.filter((r) => r.work !== 'Completed').length;
    const total = myRuns.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { name, completed, pending, total, pct };
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of users and system statistics</p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">All registered users in the system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Technicians</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold">{stats?.activeTechnicians || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Users with technician role</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold">{stats?.recentSignups || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">New users in the last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Technician run cards */}
      <div className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold">Technician Run Overview</h2>
          <p className="text-sm text-muted-foreground">Completed vs pending runs per technician</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : technicianStats.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-10 text-muted-foreground">
              No technicians found.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {technicianStats.map((tech) => (
              <Card key={tech.name} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base truncate">{tech.name || '—'}</CardTitle>
                    <div className="flex items-center justify-between mt-0.5">
                      <CardDescription>{tech.total} total run{tech.total !== 1 ? 's' : ''}</CardDescription>
                      <Badge variant={tech.pct === 100 ? "default" : tech.pct >= 50 ? "secondary" : "outline"} className="text-xs">
                        {tech.pct}% done
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Big stat numbers */}
                  <div className="grid grid-cols-2 divide-x divide-border rounded-lg border bg-muted/30">
                    <div className="flex flex-col items-center py-3 px-2">
                      <div className="flex items-center gap-1 mb-1">
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-muted-foreground">Completed</span>
                      </div>
                      <span className="text-3xl font-bold text-primary">{tech.completed}</span>
                    </div>
                    <div className="flex flex-col items-center py-3 px-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="h-3.5 w-3.5 text-destructive/70" />
                        <span className="text-xs text-muted-foreground">Pending</span>
                      </div>
                      <span className="text-3xl font-bold text-destructive/80">{tech.pending}</span>
                    </div>
                  </div>
                  <Progress value={tech.pct} className="h-1.5" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
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
