import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
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

    // 2. Extract and Decrypt Session Token via Edge-native getToken
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

    let token = await getToken({ req: request, secret });

    if (!token) {
      // Fallback check for explicit cookie names across authjs and next-auth variants
      token =
        (await getToken({ req: request, secret, cookieName: "__Secure-authjs.session-token" })) ||
        (await getToken({ req: request, secret, cookieName: "authjs.session-token" })) ||
        (await getToken({ req: request, secret, cookieName: "__Secure-next-auth.session-token" })) ||
        (await getToken({ req: request, secret, cookieName: "next-auth.session-token" }));
    }

    const exp = typeof token?.exp === "number" ? token.exp : null;
    const isExpired = exp ? Date.now() >= exp * 1000 : false;

    const isAuthenticated = !!token && !isExpired;
    const userRole = (token?.role as string) || null;

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
