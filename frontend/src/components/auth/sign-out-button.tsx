"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <div className="w-full">
      <button
        className="w-full flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut className="mr-2 size-4" />
        Log out
      </button>
    </div>
  );
}
