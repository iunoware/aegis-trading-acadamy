import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  transformSubscriptionToUI,
  subscriptionIncludeSelector,
} from "@/lib/enrollment-transform";
import { getCurrentAdminUser } from "@/lib/current-user";

export const runtime = "nodejs";

export async function GET() {
  try {
    const adminUser = await getCurrentAdminUser();

    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        deletedAt: null,
      },
      include: subscriptionIncludeSelector,
      orderBy: {
        createdAt: "desc",
      },
    });

    const enrollments = subscriptions.map(transformSubscriptionToUI);

    return NextResponse.json({
      success: true,
      enrollments,
      total: enrollments.length,
    });
  } catch (error) {
    console.error("GET /api/admin/enrollments error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}
