import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pure Edge-compatible JWT Payload Decoder (Zero external Node/Prisma/bcrypt dependencies)
function decodeJwtPayload(tokenString: string): Record<string, unknown> | null {
  try {
    const parts = tokenString.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const paddedBase64 = pad ? base64 + "=".repeat(4 - pad) : base64;
    
    // In Edge Runtime, atob is globally available
    const binaryStr = atob(paddedBase64);
    const jsonStr = decodeURIComponent(
      binaryStr
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // 1. Static & internal asset paths to skip immediately
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/api/health") ||
      pathname.includes(".") ||
      pathname === "/favicon.ico"
    ) {
      return NextResponse.next();
    }

    // 2. Extract Session Token Cookie cleanly from request cookies
    const sessionCookie =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value ||
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value;

    let payload: Record<string, unknown> | null = null;
    if (sessionCookie) {
      payload = decodeJwtPayload(sessionCookie);
    }

    // Check expiration if present
    const exp = typeof payload?.exp === "number" ? payload.exp : null;
    const isExpired = exp ? Date.now() >= exp * 1000 : false;

    const isAuthenticated = !!payload && !isExpired;
    const userRole = (payload?.role as string) || null;

    // 3. Route Category Classifications
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

    // Rule A: Authenticated users accessing auth/marketing pages get redirected to their portal
    if (isAuthenticated && (isAuthRoute || isMarketingRoute)) {
      if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/console", request.url));
      }
      if (userRole === "STAFF") {
        return NextResponse.redirect(new URL("/portal", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Rule B: Protected Student Routes (/dashboard/*, /take/*)
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

    // Rule C: Protected Staff Routes (/portal/*)
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

    // Rule D: Protected Admin Routes (/console/*)
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

    return NextResponse.next();
  } catch (err) {
    console.error("[Middleware Edge Exception]:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
