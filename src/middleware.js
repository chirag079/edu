import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;
  const userRole = token?.role;
  const { pathname } = req.nextUrl;

  const adminBasePath = "/admin";
  const userDashboardPath = "/dashboard";
  const completeProfilePath = "/complete-profile";
  const adminRoutePrefix = "/admin";

  // --- Specific Redirects for Admins ---
  // Redirect admin from root to admin base path
  if (isAuthenticated && userRole === "admin" && pathname === "/") {
    return NextResponse.redirect(new URL(adminBasePath, req.url));
  }
  // Redirect admin from user dashboard to admin base path
  if (
    isAuthenticated &&
    userRole === "admin" &&
    pathname === userDashboardPath
  ) {
    return NextResponse.redirect(new URL(adminBasePath, req.url));
  }

  // Define route groups
  const publicRoutes = [
    "/",
    "/about",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
  ];
  const authRoutes = ["/login", "/signup"];

  // Check if the current route is one of the defined public or auth routes
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);
  const isAdminRoute = pathname.startsWith(adminRoutePrefix);

  // --- Middleware Logic ---

  // 1. Allow access to all public routes (Admin root redirect handled above)
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 2. Handle Admin Route Access (Must be authenticated and admin)
  if (isAdminRoute) {
    if (!isAuthenticated || userRole !== "admin") {
      // Redirect non-admins away from /admin/*: If logged in, to their dashboard, else to login
      const redirectUrl = isAuthenticated ? userDashboardPath : "/login";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    // Allow authenticated admins to proceed to /admin/* routes
    return NextResponse.next();
  }

  // 3. Handle Auth Routes (Login/Signup)
  if (isAuthRoute) {
    // If authenticated non-admin, redirect to user dashboard
    if (isAuthenticated && userRole !== "admin") {
      return NextResponse.redirect(new URL(userDashboardPath, req.url));
    }
    // Allow unauthenticated users or admins
    return NextResponse.next();
  }

  // 4. Handle Authenticated Access (All remaining routes are protected)
  if (!isAuthenticated) {
    const callbackUrl = pathname + req.nextUrl.search;
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(url);
  }

  // 5. Handle Authenticated User States (Verified/Unverified) for non-admin users
  if (isAuthenticated && userRole !== "admin") {
    const isVerified = token.isVerified;
    const needsProfileCompletion = !isVerified;
    const isCompleteProfileRoute = pathname === completeProfilePath;

    // Redirect unverified users to complete profile page
    if (needsProfileCompletion && !isCompleteProfileRoute) {
      return NextResponse.redirect(new URL(completeProfilePath, req.url));
    }

    // Redirect verified users away from complete profile page to their dashboard
    if (!needsProfileCompletion && isCompleteProfileRoute) {
      return NextResponse.redirect(new URL(userDashboardPath, req.url));
    }
  }

  // 6. If none of the above conditions caused a redirect, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * This ensures the middleware runs on relevant pages.
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
