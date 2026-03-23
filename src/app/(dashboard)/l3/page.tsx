import { getAuthUser } from "@/lib/auth/jwt";
import { redirect } from "next/navigation";
import { DashboardRouter } from "@/components/dashboard/DashboardRouter";

export default async function L3Page() {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  return <DashboardRouter />;
}
