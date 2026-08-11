import { NextRequest, NextResponse } from "next/server";
import {
  STUDENT_SESSION_COOKIE,
  ADMIN_SESSION_COOKIE,
  verifySession,
} from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const adminSession = await verifySession(adminToken);
  const isValidAdminSession =
    adminSession &&
    adminSession.type === "ADMIN" &&
    (adminSession.role === "ADMIN" || adminSession.role === "SUPER_ADMIN");

  const studentToken = request.cookies.get(STUDENT_SESSION_COOKIE)?.value;
  const studentSession = await verifySession(studentToken);
  const isValidStudentSession =
    studentSession &&
    studentSession.type === "STUDENT" &&
    studentSession.role === "STUDENT";

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
    if (isValidAdminSession) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // ADMIN PROTECTED PAGES (/admin/*)
  if (isAdminPage) {
    if (!isValidAdminSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // ADMIN APIS (/api/admin/*)
  if (isAdminApi) {
    if (!adminSession || adminSession.type !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!isValidAdminSession) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  }

  // STUDENT PROTECTED PAGES (/student/*)
  if (isStudentPage) {
    if (!isValidStudentSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // STUDENT LOGIN / REGISTER PAGES (/login, /register)
  if (isUserLogin || isUserRegister) {
    if (isValidStudentSession) {
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
