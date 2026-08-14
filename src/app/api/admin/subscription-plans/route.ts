import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdminUser } from "@/lib/current-user";

export const runtime = "nodejs";

/**
 * GET /api/admin/subscription-plans
 * Returns active subscription plans for admin assignment
 */
export async function GET() {
  try {
    const adminUser = await getCurrentAdminUser();

    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        active: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        type: true,
        price: true,
        currency: true,
        durationMonths: true,
        badge: true,
        description: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    const formattedPlans = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      type: plan.type,
      price: Number(plan.price),
      currency: plan.currency,
      durationMonths: plan.durationMonths,
      badge: plan.badge,
      description: plan.description || "",
    }));

    return NextResponse.json({
      success: true,
      plans: formattedPlans,
    });
  } catch (error) {
    console.error("GET /api/admin/subscription-plans error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subscription plans" },
      { status: 500 }
    );
  }
}
