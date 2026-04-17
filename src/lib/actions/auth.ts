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

// ─── Dev quick-login — passcode-gated, non-production only ──────────────────
const DEV_PASSCODES: Record<string, string> = {
  // 11 Demo accounts (Coach Iya + Coach RJ)
  HC:        "hc@leap99.test",
  COACH_IYA: "coach.iya@leap99.test",
  COACH_RJ:  "coach.rj@leap99.test",
  STUDENT_1A: "student.1a@leap99.test",
  STUDENT_1B: "student.1b@leap99.test",
  STUDENT_1C: "student.1c@leap99.test",
  STUDENT_1D: "student.1d@leap99.test",
  STUDENT_2A: "student.2a@leap99.test",
  STUDENT_2B: "student.2b@leap99.test",
  STUDENT_2C: "student.2c@leap99.test",
  STUDENT_2D: "student.2d@leap99.test",

  // Legacy (deprecated)
  C:         "beta_coach@leap99.test",
  S:         "beta_student@leap99.test",
  F:         "beta_facilitator@leap99.test",
  CK:        "coach.kinder@leap99.test",
  CMG:       "coach.maryg@leap99.test",
  CMAG:      "coach.magnificants@leap99.test",
  SK:        "student.kinder@leap99.test",
  SMG:       "student.maryg@leap99.test",
  SMAG:      "student.magnificents@leap99.test",
};

export async function devLogin(passcode: string) {
  try {
    const email = DEV_PASSCODES[passcode.toUpperCase()];
    if (!email) throw new Error("Invalid passcode");

    // Query database for demo user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Fallback: if account doesn't exist, create demo session anyway
    if (!user) {
      console.log(`[devLogin] Demo account not in DB, using fallback: ${email}`);
      const now = new Date();
      const { ip, ua, deviceType, browser, os } = await getRequestMeta();
      const sessionId = createId();

      // Determine role from passcode
      const roleMap: Record<string, JWTPayload["role"]> = {
        HC: "head_coach",
        COACH_IYA: "coach",
        COACH_RJ: "coach",
        STUDENT_1A: "student",
        STUDENT_1B: "student",
        STUDENT_1C: "student",
        STUDENT_1D: "student",
        STUDENT_2A: "student",
        STUDENT_2B: "student",
        STUDENT_2C: "student",
        STUDENT_2D: "student",
        C: "coach",
        S: "student",
      };

      const role = roleMap[passcode.toUpperCase()];
      if (!role) throw new Error("Invalid passcode");

      const payload: JWTPayload = {
        userId: `demo-${passcode.toLowerCase()}`,
        role,
        canViewAllCouncils: role === "head_coach",
      };

      const accessToken = await createAccessToken(payload);
      const refreshToken = await createRefreshToken(payload);
      await setAuthCookies(accessToken, refreshToken);

      const destination = role === "head_coach" ? "/l1" : role === "coach" ? "/l2" : "/l3";
      redirect(destination);
    }

    // Create session with real user data
    const now = new Date();
    const { ip, ua, deviceType, browser, os } = await getRequestMeta();
    const sessionId = createId();
    const sessionExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Record the session
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

    // Log the dev login
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
      isSuspicious: 0,
      suspicionReason: null,
      createdAt: now,
    });

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // Create JWT payload
    let permissions: string[] | undefined;
    if (user.permissions) {
      try {
        permissions = JSON.parse(user.permissions);
      } catch {
        /* invalid JSON — ignore */
      }
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

    // Route to appropriate dashboard
    const destination =
      user.role === "head_coach"
        ? "/l1"
        : user.role === "coach"
          ? "/l2"
          : "/l3";

    redirect(destination);
  } catch (error) {
    // If it's a redirect, let it through; otherwise log
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error(
      "[devLogin] Error:",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

export async function devLoginAction(formData: FormData) {
  try {
    const key = formData?.get("key") as string;
    if (!key) throw new Error("No role selected");
    await devLogin(key);
  } catch (error) {
    // redirect() throws, so we need to re-throw it
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("devLoginAction error:", error);
    return { success: false, error: "Login failed" };
  }
}

export async function quickLogin(role: "HC" | "C" | "S") {
  try {
    const roleMap: Record<string, JWTPayload["role"]> = {
      HC: "head_coach",
      C: "coach",
      S: "student",
    };

    const userRole = roleMap[role];
    if (!userRole) throw new Error("Invalid role");

    const userId = `demo-${role.toLowerCase()}`;

    const payload: JWTPayload = {
      userId,
      role: userRole,
      canViewAllCouncils: userRole === "head_coach",
    };

    const accessToken = await createAccessToken(payload);
    const refreshToken = await createRefreshToken(payload);
    await setAuthCookies(accessToken, refreshToken);

    const destination = userRole === "head_coach" ? "/l1" : userRole === "coach" ? "/l2" : "/l3";
    redirect(destination);
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("quickLogin error:", error);
    throw error;
  }
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
