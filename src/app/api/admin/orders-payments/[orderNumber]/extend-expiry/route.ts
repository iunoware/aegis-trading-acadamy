import { NextRequest, NextResponse } from "next/server";
import { getRequiredSuperAdmin } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import {
  ActivityAction,
  ActivityActorType,
  SubscriptionEventType,
  SubscriptionStatus,
} from "@/generated/prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const admin = await getRequiredSuperAdmin();
    const { orderNumber } = await params;
    const body = await request.json();

    const newExpiryDate =
      typeof body.newExpiryDate === "string" ? body.newExpiryDate : "";
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    if (!newExpiryDate) {
      return NextResponse.json(
        { success: false, message: "New expiry date is required." },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { subscription: true },
    });

    if (!order || order.deletedAt) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 },
      );
    }

    if (!order.subscription) {
      return NextResponse.json(
        {
          success: false,
          message: "This order has no associated subscription to extend.",
        },
        { status: 400 },
      );
    }

    const subscription = order.subscription;
    const parsedNewExpiry = new Date(newExpiryDate);

    if (Number.isNaN(parsedNewExpiry.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid expiry date." },
        { status: 400 },
      );
    }

    const extensionDays = Math.max(
      1,
      Math.ceil(
        (parsedNewExpiry.getTime() - subscription.currentExpiryDate.getTime()) /
          86_400_000,
      ),
    );
    const extensionReason = reason || "Complimentary access extension";

    const updatedSubscription = await prisma.$transaction(async (tx) => {
      const updated = await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          currentExpiryDate: parsedNewExpiry,
          ...(subscription.status === SubscriptionStatus.EXPIRED
            ? { status: SubscriptionStatus.ACTIVE }
            : {}),
        },
      });

      await tx.subscriptionExtension.create({
        data: {
          subscriptionId: subscription.id,
          extendedById: admin.id,
          previousExpiryDate: subscription.currentExpiryDate,
          newExpiryDate: parsedNewExpiry,
          extensionDays,
          reason: extensionReason,
          additionalPaymentRequired: false,
        },
      });

      await tx.subscriptionEvent.create({
        data: {
          subscriptionId: subscription.id,
          actorId: admin.id,
          type: SubscriptionEventType.EXTENDED,
          title: "Expiry extended by Super Admin",
          description: `Access extended by ${extensionDays} days without additional payment. Reason: ${extensionReason}`,
        },
      });

      await tx.activityLog.create({
        data: {
          actorId: admin.id,
          actorType: ActivityActorType.SUPER_ADMIN,
          action: ActivityAction.SUBSCRIPTION_EXTENDED,
          module: "SUBSCRIPTIONS",
          title: "Subscription expiry extended",
          description: `Extended expiry for order ${order.orderNumber} by ${extensionDays} days.`,
          targetId: subscription.id,
          targetType: "SUBSCRIPTION",
          beforeData: { currentExpiryDate: subscription.currentExpiryDate },
          afterData: { currentExpiryDate: parsedNewExpiry },
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: "Expiry date extended successfully.",
      currentExpiryDate: updatedSubscription.currentExpiryDate.toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 },
      );
    }

    console.error("PATCH extend-expiry error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to extend expiry." },
      { status: 500 },
    );
  }
}
