import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  ActivityAction,
  SubscriptionEventType,
  SubscriptionSource,
  SubscriptionStatus,
  UserRole,
  AccountStatus,
} from "@/generated/prisma/client";
import { getRequiredSuperAdmin } from "@/lib/current-user";

export async function POST(request: NextRequest) {
  try {
    await getRequiredSuperAdmin();

    const sessionToken = request.cookies.get("aegis_session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const session = await prisma.authSession.findFirst({
      where: {
        tokenHash: sessionToken,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session" },
        { status: 401 },
      );
    }

    if (session.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        {
          success: false,
          message: "Only Super Admin can create student accounts",
        },
        { status: 403 },
      );
    }

    const adminUser = session.user;

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");
    const status =
      body.status === "INACTIVE" ? AccountStatus.INACTIVE : AccountStatus.ACTIVE;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name is required",
        },
        { status: 400 },
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email address is required",
        },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters",
        },
        { status: 400 },
      );
    }

    const nameParts = name.split(/\s+/);

    const firstName = nameParts[0];

    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists",
        },
        { status: 409 },
      );
    }

    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: {
          phone,
        },
        select: {
          id: true,
        },
      });

      if (existingPhone) {
        return NextResponse.json(
          {
            success: false,
            message: "An account with this phone number already exists",
          },
          { status: 409 },
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const now = new Date();

    const expiryDate = new Date(now);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          name,
          email,
          phone: phone || null,
          password: hashedPassword,

          role: UserRole.STUDENT,

          status,

          // Admin-created accounts are trusted and pre-verified
          emailVerifiedAt: now,
          emailVerificationCode: null,
          emailVerificationExpiresAt: null,
          emailVerificationAttempts: 0,
          emailVerificationLastSentAt: null,

          passwordChangedAt: now,
        },
      });

      const yearlyPlan = await tx.subscriptionPlan.findFirst({
        where: {
          type: "YEARLY",
          active: true,
          deletedAt: null,
        },
        orderBy: {
          displayOrder: "asc",
        },
      });

      if (!yearlyPlan) {
        throw new Error("No active yearly subscription plan exists");
      }

      const subscription = await tx.subscription.create({
        data: {
          userId: user.id,
          planId: yearlyPlan.id,

          status:
            status === AccountStatus.ACTIVE
              ? SubscriptionStatus.ACTIVE
              : SubscriptionStatus.REVOKED,

          source: SubscriptionSource.COMPLIMENTARY,

          purchaseDate: now,
          startDate: now,
          originalExpiryDate: expiryDate,
          currentExpiryDate: expiryDate,

          autoRenew: false,
        },
      });

      await tx.subscriptionEvent.create({
        data: {
          subscriptionId: subscription.id,
          actorId: adminUser.id,

          type: SubscriptionEventType.PURCHASED,

          title: "Complimentary subscription created",

          description: "Complimentary course access granted by Super Admin.",

          metadata: {
            source: "ADMIN_CREATED",
            accessType: "COMPLIMENTARY",
          },
        },
      });

      await tx.userActivity.create({
        data: {
          userId: user.id,
          actorId: adminUser.id,

          action: ActivityAction.ACCOUNT_CREATED,

          title: "Student account created",

          details:
            "Student account created by Super Admin with complimentary course access.",

          metadata: {
            role: UserRole.STUDENT,
            subscriptionSource: SubscriptionSource.COMPLIMENTARY,
          },
        },
      });

      await tx.activityLog.create({
        data: {
          actorId: adminUser.id,

          actorType: "SUPER_ADMIN",

          action: ActivityAction.ACCOUNT_CREATED,

          module: "STUDENTS",

          title: "Student account created",

          description: `Created complimentary student account for ${user.email}.`,

          targetId: user.id,
          targetType: "USER",

          afterData: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            subscriptionSource: SubscriptionSource.COMPLIMENTARY,
          },
        },
      });

      return {
        user,
        subscription,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student account created successfully",
        user: {
          id: result.user.id,
          name: result.user.name,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          phone: result.user.phone,
          role: result.user.role,
          status: result.user.status,
          createdAt: result.user.createdAt,
        },
        subscription: {
          id: result.subscription.id,
          status: result.subscription.status,
          source: result.subscription.source,
          startDate: result.subscription.startDate,
          currentExpiryDate: result.subscription.currentExpiryDate,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE_COMPLIMENTARY_STUDENT_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create student account",
      },
      { status: 500 },
    );
  }
}
