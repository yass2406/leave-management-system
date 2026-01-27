import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import ManagerDashboard from "./manager/ManagerDashboard"
import HRDashboard from "./hr/HRDashboard"
import EmployeeDashboard from "./employee/EmployeeDashboard"
import { Button } from "@/components/ui/button"
import {
  IconLogout,
} from "@tabler/icons-react"
import MyLeaveRequestsPage from "../leave-request/MyLeaveRequestsPage.tsx"
import type { User } from "@/types/types.ts"
import Team from "../team/Team.tsx"
import Users from "../users/Users.tsx"
import { LeavePolicies } from "../leave-policies/LeavePolicies.tsx"
import { Reports } from "../reports/Reports.tsx"

type DashboardProps = {
  user: User;
  onLogout: () => void;
};

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeSection, setActiveSection] = React.useState<"dashboard" | "my-leave-requests" | "team" | "reports" | "users" | "leave-policies">("dashboard");

  const renderRoleDashboard = () => {
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

  const renderContent = () => { 
    switch (activeSection) {
      case "dashboard":
        return renderRoleDashboard();
      case "my-leave-requests":
        return <MyLeaveRequestsPage />
      case "team":
        return <Team />
      case "reports":
        return <Reports />
      case "users":
        return <Users />
      case "leave-policies":
        return <LeavePolicies />
      default:
        return renderRoleDashboard();
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
      <AppSidebar
        variant="inset"
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <SidebarInset>
        <SiteHeader />
        <div className="p-4 flex">
          <Button className="ml-auto" variant="outline" onClick={onLogout}>
            Logout
            <span>
              <IconLogout className="size-5!" />
            </span>
          </Button>
        </div>
        <div className="p-4">{renderContent()}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}