import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DownloadIcon, SaveIcon } from "lucide-react";
export default function AppHeader() {
  return (
    <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4 z-10 justify-between">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumb>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="#">Titre du devis</BreadcrumbLink>
          </BreadcrumbItem>
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
