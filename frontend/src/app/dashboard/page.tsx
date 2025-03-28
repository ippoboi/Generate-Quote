import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) return redirect("/auth/signin");

  return redirect("/dashboard/devis");
}
