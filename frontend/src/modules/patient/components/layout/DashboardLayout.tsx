import { Outlet } from "react-router-dom";
import { useState } from "react";
import { SidebarProvider, Sidebar, SidebarInset } from "../ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardFooter } from "./DashboardFooter";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [open, setOpen] = useState(true);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      {/* Sidebar wrapper */}
      <Sidebar collapsible="icon">
        <DashboardSidebar />
      </Sidebar>

      {/* Main content area */}
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children || <Outlet />}
        </main>
        <DashboardFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default DashboardLayout;