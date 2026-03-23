import { NextResponse } from "next/server";
import { getAuthUser, isHeadCoach,
} from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { loginAudits, activeSessions, users } from "@/lib/db/schema";
import { eq, desc, gte, and, gt } from "drizzle-orm";

export async function GET() {
  const user = await getAuthUser();
  if (!user || !isHeadCoach(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Recent login audits (last 7 days, up to 200 rows) — join with users for name
  const recentLogins = await db
    .select({
      id: loginAudits.id,
      userId: loginAudits.userId,
      email: loginAudits.email,
      userName: users.name,
      ipAddress: loginAudits.ipAddress,
      deviceType: loginAudits.deviceType,
      browser: loginAudits.browser,
      os: loginAudits.os,
      status: loginAudits.status,
      failReason: loginAudits.failReason,
      isSuspicious: loginAudits.isSuspicious,
      suspicionReason: loginAudits.suspicionReason,
      createdAt: loginAudits.createdAt,
    })
    .from(loginAudits)
    .leftJoin(users, eq(loginAudits.userId, users.id))
    .where(gte(loginAudits.createdAt, last7d))
    .orderBy(desc(loginAudits.createdAt))
    .limit(200);

  // Currently active sessions — join with users for name
  const currentSessions = await db
    .select({
      id: activeSessions.id,
      userId: activeSessions.userId,
      userName: users.name,
      userEmail: users.email,
      userRole: users.role,
      ipAddress: activeSessions.ipAddress,
      deviceType: activeSessions.deviceType,
      browser: activeSessions.browser,
      os: activeSessions.os,
      lastSeenAt: activeSessions.lastSeenAt,
      createdAt: activeSessions.createdAt,
      expiresAt: activeSessions.expiresAt,
    })
    .from(activeSessions)
    .leftJoin(users, eq(activeSessions.userId, users.id))
    .where(gt(activeSessions.expiresAt, now))
    .orderBy(desc(activeSessions.lastSeenAt));

  // Suspicious logins (all time for awareness)
  const suspiciousLogins = recentLogins.filter((l) => l.isSuspicious === 1);

  // Stats
  const loginsToday = recentLogins.filter(
    (l) => l.createdAt && l.createdAt >= last24h
  ).length;
  const failedToday = recentLogins.filter(
    (l) => l.createdAt && l.createdAt >= last24h && l.status === "failed"
  ).length;
  const successToday = recentLogins.filter(
    (l) => l.createdAt && l.createdAt >= last24h && l.status === "success"
  ).length;

  return NextResponse.json({
    stats: {
      loginsToday,
      failedToday,
      successToday,
      activeSessions: currentSessions.length,
      suspiciousCount: suspiciousLogins.length,
    },
    recentLogins,
    currentSessions,
    suspiciousLogins,
  });
}
