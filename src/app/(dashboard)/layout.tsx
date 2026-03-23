import { getAuthUser } from "@/lib/auth/jwt";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Watermark, DataShield } from "@/components/security/DataProtection";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell user={user}>
      <DataShield />
      <Watermark user={user} />
      {children}
    </DashboardShell>
  );
}
