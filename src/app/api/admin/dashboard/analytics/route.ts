import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/client";

export const runtime = "nodejs";

function formatCurrencyINR(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-IN")}`;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdminUser();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized admin access" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30D";

    const now = new Date();
    const startDate = new Date();

    if (range === "7D") {
      startDate.setDate(now.getDate() - 7);
    } else if (range === "3M") {
      startDate.setDate(now.getDate() - 90);
    } else if (range === "1Y") {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      // Default 30D
      startDate.setDate(now.getDate() - 30);
    }

    const rangePaidOrders = await prisma.order.findMany({
      where: {
        status: OrderStatus.PAID,
        deletedAt: null,
        paidAt: { gte: startDate },
      },
      select: {
        totalAmount: true,
        paidAt: true,
        createdAt: true,
      },
      orderBy: { paidAt: "asc" },
    });

    let numBuckets = 7;
    if (range === "7D") numBuckets = 7;
    else if (range === "30D") numBuckets = 30;
    else if (range === "3M") numBuckets = 12;
    else if (range === "1Y") numBuckets = 12;

    const buckets: { label: string; amount: number }[] = [];
    const intervalMs = (now.getTime() - startDate.getTime()) / numBuckets;

    for (let i = 0; i < numBuckets; i++) {
      const bStart = new Date(startDate.getTime() + i * intervalMs);
      const bEnd = new Date(startDate.getTime() + (i + 1) * intervalMs);

      let label = "";
      if (range === "7D" || range === "30D") {
        label = bStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      } else if (range === "3M") {
        label = `W${i + 1}`;
      } else {
        label = bStart.toLocaleDateString("en-US", { month: "short" });
      }

      const amount = rangePaidOrders.reduce((sum, order) => {
        const oDate = order.paidAt || order.createdAt;
        if (oDate >= bStart && oDate < bEnd) {
          return sum + Number(order.totalAmount || 0);
        }
        return sum;
      }, 0);

      buckets.push({ label, amount });
    }

    let peakDayAmount = 0;
    let peakDayLabel = "N/A";
    buckets.forEach((b) => {
      if (b.amount > peakDayAmount) {
        peakDayAmount = b.amount;
        peakDayLabel = `${b.label}: ${formatCurrencyINR(b.amount)}`;
      }
    });

    if (peakDayAmount === 0 && buckets.length > 0) {
      peakDayLabel = "No peak revenue recorded in range";
    }

    return NextResponse.json({
      success: true,
      data: {
        range,
        buckets,
        peakDayLabel,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard/analytics error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}
