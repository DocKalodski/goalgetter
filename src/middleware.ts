import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const publicPaths = ["/login", "/api/auth/login", "/beta-expired"];

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

  // Beta kill pill — block everyone once expired
  if (BETA_EXPIRY && new Date() > BETA_EXPIRY) {
    return NextResponse.redirect(new URL("/beta-expired", request.url));
  }

  // Check for access token
  const token = request.cookies.get("access_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    // Kill pill: after Jun 27 2026, only head_coach retains access
    if (new Date() > ACCESS_EXPIRY && role !== "head_coach") {
      return NextResponse.redirect(new URL("/login?expired=1", request.url));
    }

    // Role-based route protection
    const canViewAll = payload.canViewAllCouncils === true;
    if (pathname.startsWith("/l1") && role !== "head_coach" && !canViewAll) {
      const redirect = role === "coach" ? "/l2" : "/l3";
      return NextResponse.redirect(new URL(redirect, request.url));
    }
    if (
      pathname.startsWith("/l2") &&
      role !== "head_coach" &&
      role !== "coach"
    ) {
      return NextResponse.redirect(new URL("/l3", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons).*)",
  ],
};
