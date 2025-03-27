"use client";

import {
  Database,
  DollarSign,
  FileIcon,
  MessageCircleIcon,
  SettingsIcon,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/navigation/nav-main";
import { NavUser } from "@/components/navigation/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { NavHistory } from "./nav-documents";
import { NavSearch } from "./nav-search";

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
      title: "Devis",
      url: "/dashboard/devis",
      icon: FileIcon,
    },
    {
      title: "Factures",
      url: "/dashboard/invoices",
      icon: DollarSign,
    },
    {
      title: "Propositions",
      url: "/dashboard/proposal",
      icon: MessageCircleIcon,
    },
    {
      title: "Base de données",
      url: "/dashboard/database",
      icon: Database,
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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="py-4 border-b max-h-16">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-3 group-data-[collapsible=icon]:px-2">
              <a href="/dashboard" className="flex items-center gap-2">
                <Image
                  src="/logo/dashboard-logo.png"
                  alt="logo"
                  width={32}
                  height={32}
                />
                <span className="text-base font-medium font-mono group-data-[collapsible=icon]:hidden">
                  Adminify.io
                </span>
              </a>
              <SidebarTrigger className="group-data-[collapsible=icon]:hidden text-muted-foreground" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSearch />
        <NavMain items={data.navMain} />
        <NavHistory items={data.history} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
