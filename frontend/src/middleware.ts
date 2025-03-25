import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isHomePage = request.nextUrl.pathname === "/";
  const isPublicRoute =
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.includes("favicon") ||
    request.nextUrl.pathname.includes("_next");

  // Redirect authenticated users to dashboard from homepage or auth pages
  if (session && (isAuthPage || isHomePage)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow access to public routes without authentication
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Allow access to homepage without authentication
  if (isHomePage) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to signin page for protected routes
  if (!isAuthPage && !session) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
