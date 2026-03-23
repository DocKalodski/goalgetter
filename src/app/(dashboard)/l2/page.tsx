import { getAuthUser } from "@/lib/auth/jwt";
import { redirect } from "next/navigation";
import { DashboardRouter } from "@/components/dashboard/DashboardRouter";

export default async function L2Page() {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  if (user.role !== "head_coach" && user.role !== "coach") {
    redirect("/l3");
  }
  return <DashboardRouter />;
}
