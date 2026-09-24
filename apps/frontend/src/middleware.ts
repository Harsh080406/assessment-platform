import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static / Next.js internal paths to skip
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  const token = await getToken({
    req: request,
    secret: secret || "your-32-character-secret-key-goes-here-replace-in-prod",
  });

  const isAuthenticated = !!token;
  const userRole = (token?.role as string) || null;

  // Route definitions
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  const isStudentRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/take");

  const isStaffRoute = pathname.startsWith("/portal");

  const isAdminRoute = pathname.startsWith("/console");

  const isMarketingRoute =
    pathname === "/" ||
    pathname.startsWith("/assessment") ||
    pathname.startsWith("/careers") ||
    pathname.startsWith("/quests") ||
    pathname.startsWith("/decoder");

  // 1. If user is authenticated and hits an auth or public marketing route, redirect to their role dashboard
  if (isAuthenticated && (isAuthRoute || isMarketingRoute)) {
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/console", request.url));
    }
    if (userRole === "STAFF") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. Protected Student Routes
  if (isStudentRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole === "STAFF") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }

    if (userRole !== "STUDENT" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // 3. Protected Staff Routes
  if (isStaffRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole !== "STAFF" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // 4. Protected Admin Routes
  if (isAdminRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Fix #8: Audit log when an ADMIN accesses student (/dashboard/*) or staff (/portal/*) routes
  if (isAuthenticated && userRole === "ADMIN" && (isStudentRoute || isStaffRoute)) {
    const res = NextResponse.next();
    res.headers.set("x-admin-impersonation-view", "true");
    // Fire-and-forget audit log via non-blocking fetch to internal log endpoint
    fetch(new URL("/api/health", request.url).origin + "/api/auth/audit-impersonation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminId: token?.id || token?.sub,
        path: pathname,
        targetPortal: isStudentRoute ? "STUDENT" : "STAFF",
      }),
    }).catch(() => {});
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
