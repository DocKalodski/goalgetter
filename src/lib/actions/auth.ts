"use server";

import { db } from "@/lib/db";
import { users, loginAudits, activeSessions } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/auth/jwt";
import type { JWTPayload } from "@/lib/auth/jwt";
import { eq, and, gt, ne } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { headers } from "next/headers";
import { parseUserAgent } from "@/lib/auth/device";
import { cookies } from "next/headers";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["head_coach", "coach", "council_leader", "student"]),
  councilId: z.string().optional(),
  batchId: z.string().optional(),
});

async function getRequestMeta() {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
    headersList.get("x-real-ip") ||
    "unknown";
  const ua = headersList.get("user-agent") || "";
  const { deviceType, browser, os } = parseUserAgent(ua);
  return { ip, ua, deviceType, browser, os };
}

export async function login(formData: FormData) {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validated = loginSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const { email, password } = validated.data;
  const now = new Date();
  const { ip, ua, deviceType, browser, os } = await getRequestMeta();

  // Look up user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    // Log failed — unknown email
    await db.insert(loginAudits).values({
      id: createId(),
      userId: null,
      email,
      ipAddress: ip,
      userAgent: ua,
      deviceType,
      browser,
      os,
      status: "failed",
      failReason: "Email not found",
      createdAt: now,
    });
    return { success: false, error: "Invalid email or password" };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    await db.insert(loginAudits).values({
      id: createId(),
      userId: user.id,
      email,
      ipAddress: ip,
      userAgent: ua,
      deviceType,
      browser,
      os,
      status: "failed",
      failReason: "Wrong password",
      createdAt: now,
    });
    return { success: false, error: "Invalid email or password" };
  }

  // ── Concurrent session / credential sharing detection ──────────────────────
  // Find any active session for this user from a DIFFERENT IP
  const sessionExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const existingSessions = await db
    .select()
    .from(activeSessions)
    .where(
      and(
        eq(activeSessions.userId, user.id),
        gt(activeSessions.expiresAt, now),
        ne(activeSessions.ipAddress, ip)
      )
    );

  const isSuspicious = existingSessions.length > 0;
  const suspicionReason = isSuspicious
    ? `Active session from ${existingSessions[0].ipAddress} (${existingSessions[0].browser ?? "unknown browser"}) — new login from ${ip}`
    : null;

  // ── Create new active session ───────────────────────────────────────────────
  const sessionId = createId();
  await db.insert(activeSessions).values({
    id: sessionId,
    userId: user.id,
    ipAddress: ip,
    userAgent: ua,
    deviceType,
    browser,
    os,
    lastSeenAt: now,
    createdAt: now,
    expiresAt: sessionExpiry,
  });

  // ── Log successful login ────────────────────────────────────────────────────
  await db.insert(loginAudits).values({
    id: createId(),
    userId: user.id,
    email,
    ipAddress: ip,
    userAgent: ua,
    deviceType,
    browser,
    os,
    status: "success",
    failReason: null,
    sessionId,
    isSuspicious: isSuspicious ? 1 : 0,
    suspicionReason,
    createdAt: now,
  });

  // ── Store sessionId in cookie for logout cleanup ────────────────────────────
  const cookieStore = await cookies();
  cookieStore.set("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  let permissions: string[] | undefined;
  if (user.permissions) {
    try { permissions = JSON.parse(user.permissions); } catch { /* invalid JSON — ignore */ }
  }

  const payload: JWTPayload = {
    userId: user.id,
    role: user.role as JWTPayload["role"],
    canViewAllCouncils: user.canViewAllCouncils === 1,
    ...(permissions?.length ? { permissions } : {}),
  };

  const accessToken = await createAccessToken(payload);
  const refreshToken = await createRefreshToken(payload);
  await setAuthCookies(accessToken, refreshToken);

  // Admin students (canViewAllCouncils) go to the HC dashboard
  const destination = user.canViewAllCouncils === 1
    ? "/l1"
    : config.roles.loginDestinations[
        user.role as keyof typeof config.roles.loginDestinations
      ];
  redirect(destination);
}

export async function register(
  data: z.infer<typeof registerSchema>
) {
  const validated = registerSchema.parse(data);
  const now = new Date();

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, validated.email))
    .limit(1);

  if (existing.length > 0) {
    return { success: false, error: "Email already registered" };
  }

  const passwordHash = await hashPassword(validated.password);

  await db.insert(users).values({
    id: createId(),
    email: validated.email,
    passwordHash,
    name: validated.name,
    role: validated.role,
    councilId: validated.councilId ?? null,
    batchId: validated.batchId ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return { success: true };
}

export async function logout() {
  // Clean up active session
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;
  if (sessionId) {
    await db.delete(activeSessions).where(eq(activeSessions.id, sessionId));
    cookieStore.delete("session_id");
  }
  await clearAuthCookies();
  redirect("/login");
}
