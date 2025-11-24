import {
  LayoutDashboard,
  FileText,
  Calendar,
  Bell,
  User,
  TrendingUp,
  LogOut,
  Droplet,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "../ui/sidebar";
import bloodlineLogo from "../../../../assets/bloodline_logo.jpg";

const navItems = [
  { title: "Dashboard", url: "/patient/dashboard", icon: LayoutDashboard },
  { title: "Request Blood", url: "/patient/request-blood", icon: Droplet },
  { title: "View Requests", url: "/patient/view-requests", icon: FileText },
  { title: "Appointments", url: "/patient/appointments", icon: Calendar },
  { title: "Notifications", url: "/patient/notifications", icon: Bell },
  { title: "Profile", url: "/patient/profile", icon: User },
  { title: "Insights", url: "/patient/insights", icon: TrendingUp },
];

export function DashboardSidebar() {
  const { open } = useSidebar();
  const navigate = useNavigate();

  return (
    <>
      {/* Header/Logo Section */}
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-4">
        <img
          src={bloodlineLogo}
          alt="BloodLine"
          className={open ? "h-12 w-auto" : "h-8 w-auto"}
        />
      </div>

      {/* Navigation Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink to={item.url} end>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Logout Button */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => navigate("/patient/logout")}>
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}