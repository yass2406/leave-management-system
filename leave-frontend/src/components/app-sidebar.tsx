"use client";

import * as React from "react";
import {
  IconListDetails,
  IconFileDescription,
  IconUsers,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSessionUser } from "@/hooks/useSessionUser";

const navMain = [
  {
    title: "My Leave Requests",
    url: "#",
    icon: IconListDetails,
  },
  {
    title: "Team",
    url: "#",
    icon: IconUsers,
  },
  {
    title: "Reports",
    url: "#",
    icon: IconFileDescription,
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const sessionUser = useSessionUser();

  const navUserData = sessionUser
    ? {
        name: `${sessionUser.firstName} ${sessionUser.lastName}`,
        role: `${sessionUser.role}`, // or real email later
        avatar: "/avatar.png", // or a default avatar
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
              <a href="#">
                <span className="text-base font-semibold">Polytech INTL.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUserData} />
      </SidebarFooter>
    </Sidebar>
  );
}
