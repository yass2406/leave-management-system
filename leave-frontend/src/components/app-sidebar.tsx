"use client"

import * as React from "react"
import {
  IconListDetails,
  IconFileDescription,
  IconDashboard,
  IconUsers,
  IconSettings,
} from "@tabler/icons-react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSessionUser } from "@/hooks/useSessionUser"
import type { NavItem, SectionId } from "@/types/types"

const baseNav: NavItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: IconDashboard,
  },
  {
    id: "my-leave-requests",
    title: "My Leave Requests",
    icon: IconListDetails,
  },
  {
    id: "team",
    title: "Team",
    icon: IconUsers,
  }
];

const hrExtra: NavItem[] = [
  { id: "reports", title: "Reports", icon: IconFileDescription },
  { id: "users", title: "Users", icon: IconUsers },
  { id: "leave-policies", title: "Leave Policies", icon: IconSettings },
];

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  activeSection: SectionId;
  onSectionChange: (id: SectionId) => void;
};

export function AppSidebar({
  activeSection,
  onSectionChange,
  ...props
}: AppSidebarProps) {
  const sessionUser = useSessionUser();

  const navUserData = sessionUser
    ? {
      name: `${sessionUser.firstName} ${sessionUser.lastName}`,
      role: `${sessionUser.role}`,
      avatar: "/avatar.png",
    }
    : {
      name: "Guest",
      role: "",
      avatar: "/avatar.png",
    };

  const role = sessionUser?.role;
  let navItems: NavItem[] = baseNav;

  if (role === "HR") {
    navItems = [...baseNav, ...hrExtra];
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/">
                <span className="text-base font-semibold">Polytech INTL.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navItems}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUserData} />
      </SidebarFooter>
    </Sidebar>
  );
}