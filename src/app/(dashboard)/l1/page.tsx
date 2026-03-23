import { getAuthUser } from "@/lib/auth/jwt";
import { redirect } from "next/navigation";
import { DashboardRouter } from "@/components/dashboard/DashboardRouter";

export default async function L1Page() {
  const user = await getAuthUser();
  if (!user || user.role !== "head_coach") {
    redirect("/l2");
  }
  return <DashboardRouter />;
}
