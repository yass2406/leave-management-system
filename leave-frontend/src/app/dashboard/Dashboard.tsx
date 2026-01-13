import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import ManagerDashboard from "./manager/ManagerDashboard"
import HRDashboard from "./hr/HRDashboard"
import EmployeeDashboard from "./employee/EmployeeDashboard"
import type { User } from "@/api/auth"
import { Button } from "@/components/ui/button"
import {
  IconLogout,
} from "@tabler/icons-react"

type DashboardProps = {
  user: User;
  onLogout: () => void;
};

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const renderContent = () => {
    switch (user.role) {
      case "EMPLOYEE":
        return <EmployeeDashboard />;
      case "MANAGER":
        return <ManagerDashboard />;
      case "HR":
        return <HRDashboard />;
      default:
        return (
          <div>
            <h2>Unknown role</h2>
            <p>Role: {user.role}</p>
          </div>
        );
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 62)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="p-4 flex">
          <Button className="ml-auto" variant="outline" onClick={onLogout}>
            Logout
            <span><IconLogout className="size-5!" /></span>
          </Button>
        </div>
        <div className="p-4">{renderContent()}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}