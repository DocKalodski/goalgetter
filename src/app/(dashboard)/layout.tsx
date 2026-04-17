import { getAuthUser } from "@/lib/auth/jwt";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Watermark, DataShield } from "@/components/security/DataProtection";
import type { JWTPayload } from "@/lib/auth/jwt";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = await getAuthUser();

  // Default to head_coach if no auth
  if (!user) {
    user = {
      userId: "demo-user",
      role: "head_coach",
      canViewAllCouncils: true,
    } as JWTPayload;
  }

  return (
    <DashboardShell user={user}>
      <DataShield />
      <Watermark user={user} />
      {children}
    </DashboardShell>
  );
}
