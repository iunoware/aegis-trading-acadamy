import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PlanType, SubscriptionEventType, SubscriptionStatus } from "@/generated/prisma/client";
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
    const body = await request.json();
    const { newPlan } = body;

    const planType: PlanType =
      newPlan === "Yearly Plan" || newPlan === "YEARLY"
        ? PlanType.YEARLY
        : PlanType.MONTHLY;

    let targetPlan = await prisma.subscriptionPlan.findFirst({
      where: {
        type: planType,
        deletedAt: null,
      },
    });

    if (!targetPlan) {
      targetPlan = await prisma.subscriptionPlan.create({
        data: {
          type: planType,
          name: planType === PlanType.YEARLY ? "Yearly Plan" : "Monthly Plan",
          price: planType === PlanType.YEARLY ? 7999 : 999,
          durationMonths: planType === PlanType.YEARLY ? 12 : 1,
          currency: "INR",
        },
      });
    }

    const updatedSub = await prisma.subscription.update({
      where: { id },
      data: {
        planId: targetPlan.id,
        status: SubscriptionStatus.ACTIVE,
        events: {
          create: {
            type: SubscriptionEventType.PLAN_CHANGED,
            title: `Changed to ${targetPlan.name}`,
            description: `Admin updated subscription plan to ${targetPlan.name}.`,
          },
        },
      },
      include: subscriptionIncludeSelector,
    });

    const transformed = transformSubscriptionToUI(updatedSub);

    return NextResponse.json({
      success: true,
      enrollment: transformed,
      message: `Plan changed to ${targetPlan.name}`,
    });
  } catch (error) {
    console.error("PATCH /api/enrollments/[id]/plan error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to change subscription plan" },
      { status: 500 }
    );
  }
}
