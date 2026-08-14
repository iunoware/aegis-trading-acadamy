import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminUser } from "@/lib/current-user";
import { transformUserToUI } from "@/lib/user-transform";
import {
  ActivityAction,
  SubscriptionEventType,
  SubscriptionSource,
  SubscriptionStatus,
  UserRole,
} from "@/generated/prisma/client";

export const runtime = "nodejs";

interface RouteProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Helper to fetch complete user with relations for transforming to UI format
 */
async function fetchUserForUI(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
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
  });
}

/**
 * POST /api/admin/users/:id/subscription
 * Grants a new subscription or updates an existing plan for student user
 */
export async function POST(request: Request, { params }: RouteProps) {
  try {
    const adminUser = await getCurrentAdminUser();

    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { planId } = body;

    if (!planId || typeof planId !== "string") {
      return NextResponse.json(
        { success: false, message: "Subscription plan ID is required." },
        { status: 400 }
      );
    }

    // 1. Verify target user
    const targetUser = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "Student user not found." },
        { status: 404 }
      );
    }

    if (targetUser.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { success: false, message: "Subscriptions can only be assigned to student accounts." },
        { status: 400 }
      );
    }

    // 2. Verify selected subscription plan
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { id: planId, active: true, deletedAt: null },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "The selected subscription plan is not active or does not exist." },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setMonth(expiryDate.getMonth() + plan.durationMonths);

    // 3. Create/update subscription inside transaction to prevent overlapping active subscriptions
    await prisma.$transaction(async (tx) => {
      // Deactivate any currently active subscriptions for this user
      await tx.subscription.updateMany({
        where: {
          userId: id,
          status: SubscriptionStatus.ACTIVE,
          deletedAt: null,
        },
        data: {
          status: SubscriptionStatus.REVOKED,
          revokedAt: now,
          revocationReason: `Superceded by new manual subscription (${plan.name}).`,
        },
      });

      // Create new active subscription
      const newSubscription = await tx.subscription.create({
        data: {
          userId: id,
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          source: SubscriptionSource.COMPLIMENTARY,
          purchaseDate: now,
          startDate: now,
          originalExpiryDate: expiryDate,
          currentExpiryDate: expiryDate,
          autoRenew: false,
          events: {
            create: {
              type: SubscriptionEventType.PURCHASED,
              title: `Subscription Granted (${plan.name})`,
              description: `Manually granted ${plan.name} subscription by administrator (${adminUser.name}).`,
              metadata: {
                source: "ADMIN_GRANTED",
                planId: plan.id,
                planType: plan.type,
              },
            },
          },
        },
      });

      // Audit user activity
      await tx.userActivity.create({
        data: {
          userId: id,
          actorId: adminUser.id,
          action: ActivityAction.ACCOUNT_UPDATED,
          title: "Subscription Granted",
          details: `${plan.name} subscription granted by ${adminUser.name}.`,
          metadata: {
            subscriptionId: newSubscription.id,
            planId: plan.id,
          },
        },
      });
    });

    // 4. Return updated transformed user
    const updatedUser = await fetchUserForUI(id);

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Failed to reload updated user." },
        { status: 500 }
      );
    }

    const transformed = transformUserToUI(updatedUser);

    return NextResponse.json({
      success: true,
      message: `Successfully granted ${plan.name} subscription to ${targetUser.name}!`,
      user: transformed,
    });
  } catch (error) {
    console.error("POST /api/admin/users/[id]/subscription error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to grant subscription." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/:id/subscription
 * Revokes active subscription for a student user
 */
export async function DELETE(_request: Request, { params }: RouteProps) {
  try {
    const adminUser = await getCurrentAdminUser();

    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const targetUser = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "Student user not found." },
        { status: 404 }
      );
    }

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.subscription.updateMany({
        where: {
          userId: id,
          status: SubscriptionStatus.ACTIVE,
          deletedAt: null,
        },
        data: {
          status: SubscriptionStatus.REVOKED,
          revokedAt: now,
          revocationReason: `Revoked by administrator (${adminUser.name}).`,
        },
      });

      await tx.userActivity.create({
        data: {
          userId: id,
          actorId: adminUser.id,
          action: ActivityAction.ACCOUNT_UPDATED,
          title: "Subscription Revoked",
          details: `Active subscription revoked by ${adminUser.name}.`,
        },
      });
    });

    const updatedUser = await fetchUserForUI(id);

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Failed to reload updated user." },
        { status: 500 }
      );
    }

    const transformed = transformUserToUI(updatedUser);

    return NextResponse.json({
      success: true,
      message: `Subscription for ${targetUser.name} revoked successfully.`,
      user: transformed,
    });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id]/subscription error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to revoke subscription." },
      { status: 500 }
    );
  }
}
