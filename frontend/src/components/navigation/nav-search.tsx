import { CommandIcon, PlusIcon, SearchIcon } from "lucide-react";
import { Input } from "../ui/input";

export function NavSearch() {
  return (
    <div className="flex items-center justify-between px-3 group-data-[collapsible=icon]:px-2 gap-2 py-4 border-b">
      <div className="flex items-center justify-between px-1.5 gap-2 border rounded-md bg-[#ffffff] group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:justify-center">
        <SearchIcon className="w-7 h-7 text-muted-foreground group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
        <Input
          placeholder="Search"
          className="border-none shadow-none px-0 h-8 focus-visible:ring-0 group-data-[collapsible=icon]:hidden"
        />
        <div className="text-sm flex items-center justify-between bg-[#DFE0E2] px-1 rounded text-muted-foreground text-medium group-data-[collapsible=icon]:hidden">
          <CommandIcon className="w-3.5 h-3.5" />
          <PlusIcon className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="font-medium">K</span>
        </div>
      </div>
    </div>
  );
}
