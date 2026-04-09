import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const publicPaths = ["/login", "/api/auth/login", "/beta-expired", "/beta2"];

// LEAP 99 kill pill — access expires 2 days after program end (Jun 25 2026)
const ACCESS_EXPIRY = new Date("2026-06-27T00:00:00.000Z");

// Beta kill pill — Monday Mar 23 2026 9:00 PM PH time (UTC+8 → 13:00 UTC)
const BETA_EXPIRY = process.env.BETA_EXPIRY
  ? new Date(process.env.BETA_EXPIRY)
  : null;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for access token
  const token = request.cookies.get("access_token")?.value;
  if (!token) {
    if (BETA_EXPIRY && new Date() > BETA_EXPIRY) {
      return NextResponse.redirect(new URL("/beta-expired", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;
    const isPrivileged = role === "head_coach" || role === "developer";

    // Beta kill pill — block non-privileged users once beta has expired
    if (BETA_EXPIRY && new Date() > BETA_EXPIRY && !isPrivileged) {
      return NextResponse.redirect(new URL("/beta-expired", request.url));
    }

    // Kill pill: after Jun 27 2026, only head_coach and developer retain access
    if (new Date() > ACCESS_EXPIRY && !isPrivileged) {
      return NextResponse.redirect(new URL("/login?expired=1", request.url));
    }

    // Role-based route protection
    const canViewAll = payload.canViewAllCouncils === true;
    if (pathname.startsWith("/l1") && role !== "head_coach" && role !== "developer" && role !== "facilitator" && !canViewAll) {
      const redirect = role === "coach" ? "/l2" : "/l3";
      return NextResponse.redirect(new URL(redirect, request.url));
    }
    if (pathname.startsWith("/l2") && role !== "head_coach" && role !== "coach" && role !== "facilitator") {
      return NextResponse.redirect(new URL("/l3", request.url));
    }
    if (pathname.startsWith("/l3") && role === "facilitator") {
      return NextResponse.redirect(new URL("/l1", request.url));
    }

    return NextResponse.next();
  } catch {
    // Bad/expired JWT — clear the cookie so the browser doesn't loop
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete("access_token");
    return res;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons).*)",
  ],
};
