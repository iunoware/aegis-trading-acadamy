import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "aegis_trading_session";

function getAuthSecret() {
  if (!process.env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET is not set");
  }

  return new TextEncoder().encode(process.env.AUTH_SECRET);
}

async function isValidSession(token: string | undefined) {
  if (!token) {
    return false;
  }

  try {
    await jwtVerify(token, getAuthSecret());

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const isLoggedIn = await isValidSession(token);

  // remove this comment in future to authenticate the admin route
  // const isAdminRoute = pathname.startsWith("/admin");

  const isAdminApiRoute = pathname.startsWith("/api/admin");

  const isLoginPage = pathname === "/login";

  // Protect admin pages and admin APIs.
  // remove this comment in future to authenticate the admin route
  // if ((isAdminRoute || isAdminApiRoute) && !isLoggedIn) {
  if (isAdminApiRoute && !isLoggedIn) {
    if (isAdminApiRoute) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/login", request.url);

    const response = NextResponse.redirect(loginUrl);

    response.cookies.delete(SESSION_COOKIE_NAME);

    return response;
  }

  // Logged-in user should not access login.
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/login"],
};
