"use client";

import {
  File,
  LayoutDashboardIcon,
  ListIcon,
  SettingsIcon,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/navigation/nav-main";
import { NavSecondary } from "@/components/navigation/nav-secondary";
import { NavUser } from "@/components/navigation/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavHistory } from "./nav-documents";

const data = {
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Devis",
      url: "/dashboard/devis",
      icon: ListIcon,
    },
  ],
  history: [
    {
      name: "Devis 1",
      url: "#",
    },
    {
      name: "Devis 2",
      url: "#",
    },
    {
      name: "Devis 3",
      url: "#",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <File className="h-5 w-5" />
                <span className="text-base font-semibold">Admin Tools</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavHistory items={data.history} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
