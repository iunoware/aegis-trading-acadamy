import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionEventType, SubscriptionStatus } from "@/generated/prisma/client";
import {
  transformSubscriptionToUI,
  subscriptionIncludeSelector,
} from "@/lib/enrollment-transform";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await request.json();
    const days = Number(body.days) || 0;

    if (days <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid extension days provided" },
        { status: 400 }
      );
    }

    const existingSub = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!existingSub || existingSub.deletedAt) {
      return NextResponse.json(
        { success: false, message: "Subscription not found" },
        { status: 404 }
      );
    }

    const currentExp = new Date(existingSub.currentExpiryDate);
    const baseDate = isNaN(currentExp.getTime()) ? new Date() : currentExp;
    baseDate.setDate(baseDate.getDate() + days);

    const updatedSub = await prisma.subscription.update({
      where: { id },
      data: {
        currentExpiryDate: baseDate,
        status: SubscriptionStatus.ACTIVE,
        events: {
          create: {
            type: SubscriptionEventType.EXTENDED,
            title: `Extended ${days} Days`,
            description: `Admin extended subscription period by ${days} days.`,
          },
        },
      },
      include: subscriptionIncludeSelector,
    });

    const transformed = transformSubscriptionToUI(updatedSub);

    return NextResponse.json({
      success: true,
      enrollment: transformed,
      message: `Subscription extended by ${days} days`,
    });
  } catch (error) {
    console.error("PATCH /api/enrollments/[id]/extend error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to extend subscription" },
      { status: 500 }
    );
  }
}
