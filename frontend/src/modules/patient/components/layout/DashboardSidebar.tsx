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
  Sidebar,
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border bg-sidebar">
        <img
          src={bloodlineLogo}
          alt="BloodLine"
          className={open ? "h-12 w-auto" : "h-8 w-auto"}
        />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 text-base font-semibold ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => navigate("/patient/logout")}
                    className="flex w-full items-center gap-3 px-3 py-2 text-base font-semibold text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {open && <span>Logout</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
