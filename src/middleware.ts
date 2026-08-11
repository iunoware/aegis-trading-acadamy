import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySession(token);

  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminAuthApi =
    pathname === "/api/admin/auth/login" || pathname === "/api/admin/auth/logout";
  const isAdminApi =
    (pathname === "/api/admin" || pathname.startsWith("/api/admin/")) && !isAdminAuthApi;
  const isAdminLogin = pathname === "/admin/login";

  const isStudentPage = pathname === "/student" || pathname.startsWith("/student/");
  const isUserLogin = pathname === "/login";
  const isUserRegister = pathname === "/register";

  // ADMIN LOGIN PAGE (/admin/login)
  if (isAdminLogin) {
    if (session && (session.role === "ADMIN" || session.role === "SUPER_ADMIN")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // ADMIN PROTECTED PAGES (/admin/*)
  if (isAdminPage) {
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/student", request.url));
    }
    return NextResponse.next();
  }

  // ADMIN APIS (/api/admin/*)
  if (isAdminApi) {
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  }

  // STUDENT PROTECTED PAGES (/student/*)
  if (isStudentPage) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // STUDENT LOGIN / REGISTER PAGES (/login, /register)
  if (isUserLogin || isUserRegister) {
    if (session && session.role === "STUDENT") {
      return NextResponse.redirect(new URL("/student", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/login",
    "/register",
    "/admin/login",
    "/student/:path*",
    "/student",
  ],
};
