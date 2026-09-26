import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("civicshield_token")?.value;
  const role = request.cookies.get("civicshield_role")?.value?.toUpperCase();

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isCitizenRoute = pathname.startsWith("/citizen");
  const isOfficerRoute = pathname.startsWith("/officer");
  const isWorkerRoute = pathname.startsWith("/worker");
  const isSuperAdminRoute = pathname.startsWith("/super-admin");

  const isProtectedRoute = isCitizenRoute || isOfficerRoute || isWorkerRoute || isSuperAdminRoute;

  // 1. If user is logged in and visits login/register, redirect to their role dashboard
  if (isAuthRoute && token) {
    let target = "/citizen";
    if (role === "OFFICER") target = "/officer";
    else if (role === "WORKER") target = "/worker";
    else if (role === "SUPER_ADMIN" || role === "ADMIN") target = "/super-admin";
    
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 2. If user is not logged in and attempts to access protected routes, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Strict Role-Based Portal Protection
  if (token && role) {
    // Only Super Admin can access /super-admin
    if (isSuperAdminRoute && role !== "SUPER_ADMIN" && role !== "ADMIN") {
      let fallback = "/citizen";
      if (role === "OFFICER") fallback = "/officer";
      if (role === "WORKER") fallback = "/worker";
      return NextResponse.redirect(new URL(fallback, request.url));
    }

    // Only Officer & Super Admin can access /officer
    if (isOfficerRoute && role !== "OFFICER" && role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/citizen", request.url));
    }

    // Only Worker & Super Admin can access /worker
    if (isWorkerRoute && role !== "WORKER" && role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/citizen", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/citizen/:path*",
    "/officer/:path*",
    "/worker/:path*",
    "/super-admin/:path*",
  ],
};
