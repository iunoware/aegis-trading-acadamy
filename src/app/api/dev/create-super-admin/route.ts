import { NextResponse } from "next/server";
import { randomBytes, scryptSync } from "crypto";
import { prisma } from "@/lib/prisma";
import { AccountStatus, UserRole } from "@/generated/prisma/client";

export const runtime = "nodejs";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");

  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

export async function GET() {
  try {
    const email = "admin@aegis.com";
    const password = "aegis@143";

    const hashedPassword = hashPassword(password);

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    let user;

    if (existingUser) {
      user = await prisma.user.update({
        where: {
          email,
        },
        data: {
          firstName: "Super",
          lastName: "Admin 2",
          // name: "Super Admin",
          password: hashedPassword,
          role: UserRole.SUPER_ADMIN,
          status: AccountStatus.ACTIVE,
          deletedAt: null,
          passwordChangedAt: new Date(),
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          firstName: "Super",
          lastName: "Admin",
          name: "Super Admin",
          email,
          phone: null,
          password: hashedPassword,
          role: UserRole.SUPER_ADMIN,
          status: AccountStatus.ACTIVE,
          passwordChangedAt: new Date(),
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Super Admin is ready.",
      user,
      login: {
        email,
        password,
      },
    });
  } catch (error) {
    console.error("CREATE_SUPER_ADMIN_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create Super Admin.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
