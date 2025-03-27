"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import {
  Database,
  DollarSign,
  FileIcon,
  MessageCircleIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function AppHeader() {
  const pathname = usePathname();
  const currentPath = pathname.split("/").pop();

  const getCurrentIcon = () => {
    switch (currentPath) {
      case "devis":
        return <FileIcon className="w-4 h-4" />;
      case "factures":
        return <DollarSign className="w-4 h-4" />;
      case "proposal":
        return <MessageCircleIcon className="w-4 h-4" />;
      case "database":
        return <Database className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <header className="flex sticky top-0 bg-background/50 backdrop-blur-md h-16 shrink-0 items-center gap-2 border-b z-10 justify-between">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 p-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="flex items-center gap-2 font-medium"
                >
                  {getCurrentIcon()}
                  {currentPath === "devis"
                    ? "Devis"
                    : currentPath === "factures"
                    ? "Factures"
                    : currentPath === "clients"
                    ? "Clients"
                    : currentPath === "produits"
                    ? "Produits"
                    : "Dashboard"}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    </header>
  );
}
