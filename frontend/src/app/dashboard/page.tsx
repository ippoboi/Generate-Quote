import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) return redirect("/auth/signin");

  return <div>{session.user?.email}</div>;
}
