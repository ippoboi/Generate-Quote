"use client";

import {
  Download,
  MoreHorizontalIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavHistory({
  items,
  selectedUrl,
}: {
  items: {
    name: string;
    url: string;
  }[];
  selectedUrl?: string;
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="font-mono uppercase text-xs text-muted-foreground">
        Historique
      </SidebarGroupLabel>
      <SidebarMenu className="mb-3">
        <SidebarMenuItem className="flex items-center gap-2">
          <SidebarMenuButton
            tooltip="Nouveau"
            className="text-muted-foreground cursor-pointer flex items-center justify-center gap-2 hover:text-black border-dashed border border-[#DFE0E2] rounded-md transition-all duration-200 ease-linear "
          >
            <PlusIcon className="w-3 h-3" />
            <span>Nouveau</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a
                href={item.url}
                className={`flex items-center justify-between transition-colors duration-200 ease-linear ${
                  selectedUrl === item.url
                    ? "text-black font-medium"
                    : "text-muted-foreground hover:text-black"
                }`}
              >
                <span>{item.name}</span>
                <span className="text-xs font-medium text-muted-foreground">
                  2d
                </span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction className="rounded-sm data-[state=open]:bg-accent text-muted-foreground">
                  <MoreHorizontalIcon />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-24 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <Download />
                  <span>Exporter</span>
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <TrashIcon />
                  <span>Supprimer</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontalIcon className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
