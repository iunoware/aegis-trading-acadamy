import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionEventType, SubscriptionStatus } from "@/generated/prisma/client";
import {
  transformSubscriptionToUI,
  subscriptionIncludeSelector,
} from "@/lib/enrollment-transform";

import { getCurrentAdminUser } from "@/lib/current-user";

export const runtime = "nodejs";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const adminUser = await getCurrentAdminUser();

    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized admin access" },
        { status: 401 }
      );
    }
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const existingSub = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!existingSub || existingSub.deletedAt) {
      return NextResponse.json(
        { success: false, message: "Subscription not found" },
        { status: 404 }
      );
    }

    let nextStatus: SubscriptionStatus;
    if (body.status) {
      const targetStr = String(body.status).toUpperCase();
      if (targetStr === "ACTIVE") nextStatus = SubscriptionStatus.ACTIVE;
      else if (targetStr === "CANCELLED") nextStatus = SubscriptionStatus.CANCELLED;
      else nextStatus = existingSub.status === SubscriptionStatus.CANCELLED ? SubscriptionStatus.ACTIVE : SubscriptionStatus.CANCELLED;
    } else {
      nextStatus = existingSub.status === SubscriptionStatus.CANCELLED
        ? SubscriptionStatus.ACTIVE
        : SubscriptionStatus.CANCELLED;
    }

    const isCancelled = nextStatus === SubscriptionStatus.CANCELLED;
    const eventType = isCancelled ? SubscriptionEventType.CANCELLED : SubscriptionEventType.REACTIVATED;
    const eventTitle = isCancelled ? "Cancelled Subscription" : "Reactivated Subscription";
    const statusText = isCancelled ? "Cancelled" : "Active";

    const updatedSub = await prisma.subscription.update({
      where: { id },
      data: {
        status: nextStatus,
        cancelledAt: isCancelled ? new Date() : null,
        events: {
          create: {
            type: eventType,
            title: eventTitle,
            description: `Subscription status set to ${statusText} by admin.`,
          },
        },
      },
      include: subscriptionIncludeSelector,
    });

    const transformed = transformSubscriptionToUI(updatedSub);

    return NextResponse.json({
      success: true,
      enrollment: transformed,
      message: `Subscription status set to ${statusText}`,
    });
  } catch (error) {
    console.error("PATCH /api/enrollments/[id]/status error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update subscription status" },
      { status: 500 }
    );
  }
}
