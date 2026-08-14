import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transformUserToUI } from "@/lib/user-transform";
import { AccountStatus, ActivityAction, UserRole } from "@/generated/prisma/client";
import { getCurrentAdminUser } from "@/lib/current-user";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const adminUser = await getCurrentAdminUser();

    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const statusParam = searchParams.get("status") || "";
    const roleParam = searchParams.get("role") || "";

    const whereClause: Record<string, unknown> = {
      deletedAt: null,
      role: { not: UserRole.SUPER_ADMIN },
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { discordName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (
      statusParam &&
      Object.values(AccountStatus).includes(
        statusParam.toUpperCase() as AccountStatus,
      )
    ) {
      whereClause.status = statusParam.toUpperCase() as AccountStatus;
    }

    if (
      roleParam &&
      Object.values(UserRole).includes(roleParam.toUpperCase() as UserRole)
    ) {
      whereClause.role = roleParam.toUpperCase() as UserRole;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        subscriptions: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            planId: true,
            status: true,
            source: true,
            startDate: true,
            currentExpiryDate: true,
            plan: {
              select: {
                id: true,
                name: true,
                type: true,
                durationMonths: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        accountActivities: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const transformedUsers = users.map(transformUserToUI);

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      total: transformedUsers.length,
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await getCurrentAdminUser();

    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, discordName } = body;

    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const trimmedFirstName = typeof firstName === "string" ? firstName.trim() : "";
    const trimmedLastName = typeof lastName === "string" ? lastName.trim() : "";

    if (!trimmedEmail || !trimmedFirstName) {
      return NextResponse.json(
        { success: false, message: "First name and email are required." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { email: trimmedEmail, deletedAt: null },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "A user with this email already exists." },
        { status: 409 }
      );
    }

    const defaultPassword = "AegisUser@2026!";
    const hashedPassword = await hashPassword(defaultPassword);
    const fullName = `${trimmedFirstName} ${trimmedLastName}`.trim();

    const newUser = await prisma.user.create({
      data: {
        firstName: trimmedFirstName,
        lastName: trimmedLastName || null,
        name: fullName,
        email: trimmedEmail,
        phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
        discordName: typeof discordName === "string" && discordName.trim() ? discordName.trim() : null,
        password: hashedPassword,
        role: UserRole.STUDENT,
        status: AccountStatus.ACTIVE,
        // Admin-created accounts are trusted and pre-verified
        emailVerifiedAt: new Date(),
        emailVerificationCode: null,
        emailVerificationExpiresAt: null,
        emailVerificationAttempts: 0,
        emailVerificationLastSentAt: null,
      },
      include: {
        subscriptions: {
          select: {
            id: true,
            status: true,
            currentExpiryDate: true,
          },
        },
        accountActivities: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    await prisma.userActivity.create({
      data: {
        userId: newUser.id,
        actorId: adminUser.id,
        action: ActivityAction.ACCOUNT_CREATED,
        title: "Account Registered",
        details: `Account registered by administrator (${adminUser.name}).`,
      },
    }).catch(() => null);

    const transformed = transformUserToUI(newUser);

    return NextResponse.json({
      success: true,
      message: "User registered successfully.",
      user: transformed,
    });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to register user." },
      { status: 500 }
    );
  }
}
