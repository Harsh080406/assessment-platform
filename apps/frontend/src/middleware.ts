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

    // Helper to redirect while preserving the incoming request's custom domain & protocol
    const createRedirect = (targetPath: string, callbackParam?: string) => {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = targetPath;
      redirectUrl.search = "";
      if (callbackParam) {
        redirectUrl.searchParams.set("callbackUrl", callbackParam);
      }
      return NextResponse.redirect(redirectUrl);
    };

    // Redirect legacy /assessment route to /register
    if (pathname === "/assessment" || pathname.startsWith("/assessment/")) {
      return createRedirect("/register");
    }

    // Redirect legacy marketing /careers route to /about
    if (pathname === "/careers" || pathname.startsWith("/careers/")) {
      return createRedirect("/about");
    }

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
      pathname.startsWith("/about") ||
      pathname.startsWith("/contact") ||
      pathname.startsWith("/how-it-works") ||
      pathname.startsWith("/quests") ||
      pathname.startsWith("/decoder");

    // Rule A: Authenticated users accessing auth/marketing pages get redirected to their portal
    if (isAuthenticated && (isAuthRoute || isMarketingRoute)) {
      if (userRole === "ADMIN") {
        return createRedirect("/console");
      }
      if (userRole === "STAFF") {
        return createRedirect("/portal");
      }
      return createRedirect("/dashboard");
    }

    // Rule B: Protected Student Routes (/dashboard/*, /take/*)
    if (isStudentRoute) {
      if (!isAuthenticated) {
        return createRedirect("/login", pathname);
      }

      if (userRole === "ADMIN" && pathname.startsWith("/dashboard")) {
        return createRedirect("/console");
      }

      if (userRole === "STAFF") {
        return createRedirect("/portal");
      }

      if (userRole !== "STUDENT" && userRole !== "ADMIN") {
        return createRedirect("/unauthorized");
      }
    }

    // Rule C: Protected Staff Routes (/portal/*)
    if (isStaffRoute) {
      if (!isAuthenticated) {
        return createRedirect("/login", pathname);
      }

      if (userRole !== "STAFF" && userRole !== "ADMIN") {
        return createRedirect("/unauthorized");
      }
    }

    // Rule D: Protected Admin Routes (/console/*)
    if (isAdminRoute) {
      if (!isAuthenticated) {
        return createRedirect("/login", pathname);
      }

      if (userRole !== "ADMIN") {
        return createRedirect("/unauthorized");
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
