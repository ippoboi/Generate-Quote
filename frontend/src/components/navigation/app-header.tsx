"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DownloadIcon, SaveIcon } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AppHeader() {
  const pathname = usePathname();
  return (
    <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4 z-10 justify-between">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                {pathname.split("/").pop() === "devis"
                  ? "Générateur de devis"
                  : "Dashboard"}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline">
          <SaveIcon />
          Sauvegarder
        </Button>
        <Button>
          <DownloadIcon />
          Générer le PDF
        </Button>
      </div>
    </header>
  );
}
