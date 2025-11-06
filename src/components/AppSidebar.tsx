import { Home, Building2, FileText, PlayCircle, ClipboardList, Gauge, Shield, Users } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { LogoutButton } from "@/components/LogoutButton";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Technician Dashboard", url: "/technician-dashboard", icon: Gauge },
  { title: "Customers", url: "/customers", icon: Building2 },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;
  const isTechnicianDashboard = currentPath === "/technician-dashboard";
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      const role = data?.role || null;
      setUserRole(role);
      setIsAdmin(role === "admin");
    };

    fetchUserRole();
  }, [user]);

  const isTechnician = userRole === "technician";

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {!isTechnician && !isTechnicianDashboard && (
          <SidebarGroup>
            <SidebarGroupLabel>Hygiene Facility System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>{isTechnician ? "Technician" : "Quick Actions"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {!isTechnician && !isTechnicianDashboard && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={currentPath === "/customer-service-form"}>
                      <NavLink to="/customer-service-form">
                        <FileText className="h-4 w-4" />
                        <span>Customer Service Form</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={currentPath === "/service-agreements"}>
                      <NavLink to="/service-agreements">
                        <FileText className="h-4 w-4" />
                        <span>Service Agreements</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={currentPath === "/runs"}>
                  <NavLink to="/runs">
                    <PlayCircle className="h-4 w-4" />
                    <span>Runs</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {!isTechnician && !isTechnicianDashboard && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={currentPath === "/customer-service-report"}>
                    <NavLink to="/customer-service-report">
                      <ClipboardList className="h-4 w-4" />
                      <span>Service Report</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {!isTechnician && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={currentPath === "/service-reports"}>
                    <NavLink to="/service-reports">
                      <FileText className="h-4 w-4" />
                      <span>View All Reports</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={currentPath === "/admin/dashboard"}>
                    <NavLink to="/admin/dashboard">
                      <Shield className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={currentPath === "/admin/users"}>
                    <NavLink to="/admin/users">
                      <Users className="h-4 w-4" />
                      <span>User Management</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
