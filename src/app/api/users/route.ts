import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transformUserToUI } from "@/lib/user-transform";
import { AccountStatus, UserRole } from "@/generated/prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const statusParam = searchParams.get("status") || "";
    const roleParam = searchParams.get("role") || "";

    const whereClause: Record<string, unknown> = {
      deletedAt: null,
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

    if (statusParam && Object.values(AccountStatus).includes(statusParam.toUpperCase() as AccountStatus)) {
      whereClause.status = statusParam.toUpperCase() as AccountStatus;
    }

    if (roleParam && Object.values(UserRole).includes(roleParam.toUpperCase() as UserRole)) {
      whereClause.role = roleParam.toUpperCase() as UserRole;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
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
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
