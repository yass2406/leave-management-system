"use client"

import * as React from "react"
import {
  IconListDetails,
  IconFileDescription,
  IconDashboard,
  IconUsers,
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
import type { NavItem } from "@/types/types"

const navMain: NavItem[] = [
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
  },
  {
    id: "reports",
    title: "Reports",
    icon: IconFileDescription,
  },
];

type SectionId = "dashboard" | "my-leave-requests" | "team" | "reports";

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
          items={navMain}
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