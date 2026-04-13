import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/jwt";

export default async function Home() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  // Route authenticated users to role-specific dashboard
  const destinations: Record<string, string> = {
    head_coach: "/l1",
    facilitator: "/l1",
    developer: "/l1",
    coach: "/l2",
    council_leader: "/l3",
    student: "/l3",
  };

  const destination = destinations[user.role] || "/l2";
  redirect(destination);
}
