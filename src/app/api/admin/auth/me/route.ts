import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { prisma } from "@/lib/prisma";
import { AccountStatus, UserRole } from "@/generated/prisma/client";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth/session";

export const runtime = "nodejs";

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }

  return new TextEncoder().encode(secret);
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
        },
        { status: 401 },
      );
    }

    const { payload } = await jwtVerify(token, getAuthSecret());

    if (
      payload.type !== "ADMIN" ||
      (payload.role !== "SUPER_ADMIN" && payload.role !== "ADMIN") ||
      typeof payload.userId !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
        },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        deletedAt: true,
      },
    });

    if (
      !user ||
      user.deletedAt ||
      (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ADMIN) ||
      user.status !== AccountStatus.ACTIVE
    ) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error("ADMIN_SESSION_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
      },
      { status: 401 },
    );
  }
}
