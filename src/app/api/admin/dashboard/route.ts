import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import {
  OrderStatus,
  UserRole,
  SubscriptionStatus,
  ContentStatus,
  PlanType,
} from "@/generated/prisma/client";

export const runtime = "nodejs";

function formatCurrencyINR(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-IN")}`;
}

function formatDateIST(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRelativeTime(dateInput: Date | string): string {
  const d = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  return formatDateIST(dateInput);
}

function computeTrend(
  current: number,
  previous: number,
): { trend: string; isUp: boolean } {
  if (previous === 0) {
    if (current > 0) return { trend: "+100%", isUp: true };
    return { trend: "0%", isUp: true };
  }
  const diff = ((current - previous) / previous) * 100;
  const isUp = diff >= 0;
  const formatted = `${isUp ? "+" : ""}${diff.toFixed(1)}%`;
  return { trend: formatted, isUp };
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
    let startDate = new Date();
    let prevStartDate = new Date();
    let prevEndDate = new Date();

    if (range === "7D") {
      startDate.setDate(now.getDate() - 7);
      prevStartDate.setDate(now.getDate() - 14);
      prevEndDate.setDate(now.getDate() - 7);
    } else if (range === "3M") {
      startDate.setDate(now.getDate() - 90);
      prevStartDate.setDate(now.getDate() - 180);
      prevEndDate.setDate(now.getDate() - 90);
    } else if (range === "1Y") {
      startDate.setFullYear(now.getFullYear() - 1);
      prevStartDate.setFullYear(now.getFullYear() - 2);
      prevEndDate.setFullYear(now.getFullYear() - 1);
    } else {
      // Default: 30D
      startDate.setDate(now.getDate() - 30);
      prevStartDate.setDate(now.getDate() - 60);
      prevEndDate.setDate(now.getDate() - 30);
    }

    // -------------------------------------------------------------
    // 1. KPI CALCULATIONS & HISTORICAL COMPARISONS
    // -------------------------------------------------------------
    const paidOrdersCurrent = await prisma.order.findMany({
      where: {
        status: OrderStatus.PAID,
        deletedAt: null,
        paidAt: { gte: startDate },
      },
      select: { totalAmount: true },
    });

    const paidOrdersPrevious = await prisma.order.findMany({
      where: {
        status: OrderStatus.PAID,
        deletedAt: null,
        paidAt: { gte: prevStartDate, lt: prevEndDate },
      },
      select: { totalAmount: true },
    });

    const totalRevenueAllTime = await prisma.order.aggregate({
      where: {
        status: OrderStatus.PAID,
        deletedAt: null,
      },
      _sum: { totalAmount: true },
    });

    const currentRevenueSum = paidOrdersCurrent.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0,
    );
    const previousRevenueSum = paidOrdersPrevious.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0,
    );
    const totalRevenueValue = Number(totalRevenueAllTime._sum.totalAmount || 0);

    const revenueTrend = computeTrend(currentRevenueSum, previousRevenueSum);

    // Students count
    const totalStudentsCount = await prisma.user.count({
      where: {
        role: UserRole.STUDENT,
        deletedAt: null,
      },
    });

    const newStudentsCurrent = await prisma.user.count({
      where: {
        role: UserRole.STUDENT,
        deletedAt: null,
        createdAt: { gte: startDate },
      },
    });

    const newStudentsPrevious = await prisma.user.count({
      where: {
        role: UserRole.STUDENT,
        deletedAt: null,
        createdAt: { gte: prevStartDate, lt: prevEndDate },
      },
    });

    const studentTrend = computeTrend(newStudentsCurrent, newStudentsPrevious);

    // Active Subscriptions
    const activeSubscriptionsCount = await prisma.subscription.count({
      where: {
        status: SubscriptionStatus.ACTIVE,
        deletedAt: null,
      },
    });

    const newSubsCurrent = await prisma.subscription.count({
      where: {
        status: SubscriptionStatus.ACTIVE,
        deletedAt: null,
        createdAt: { gte: startDate },
      },
    });

    const newSubsPrevious = await prisma.subscription.count({
      where: {
        status: SubscriptionStatus.ACTIVE,
        deletedAt: null,
        createdAt: { gte: prevStartDate, lt: prevEndDate },
      },
    });

    const subsTrend = computeTrend(newSubsCurrent, newSubsPrevious);

    // Monthly & Yearly plan subscribers
    const monthlySubscribersCount = await prisma.subscription.count({
      where: {
        status: SubscriptionStatus.ACTIVE,
        deletedAt: null,
        plan: { type: PlanType.MONTHLY },
      },
    });

    const newMonthlyCurrent = await prisma.subscription.count({
      where: {
        status: SubscriptionStatus.ACTIVE,
        deletedAt: null,
        plan: { type: PlanType.MONTHLY },
        createdAt: { gte: startDate },
      },
    });

    const newMonthlyPrevious = await prisma.subscription.count({
      where: {
        status: SubscriptionStatus.ACTIVE,
        deletedAt: null,
        plan: { type: PlanType.MONTHLY },
        createdAt: { gte: prevStartDate, lt: prevEndDate },
      },
    });

    const monthlyTrend = computeTrend(newMonthlyCurrent, newMonthlyPrevious);

    const yearlySubscribersCount = await prisma.subscription.count({
      where: {
        status: SubscriptionStatus.ACTIVE,
        deletedAt: null,
        plan: { type: PlanType.YEARLY },
      },
    });

    const newYearlyCurrent = await prisma.subscription.count({
      where: {
        status: SubscriptionStatus.ACTIVE,
        deletedAt: null,
        plan: { type: PlanType.YEARLY },
        createdAt: { gte: startDate },
      },
    });

    const newYearlyPrevious = await prisma.subscription.count({
      where: {
        status: SubscriptionStatus.ACTIVE,
        deletedAt: null,
        plan: { type: PlanType.YEARLY },
        createdAt: { gte: prevStartDate, lt: prevEndDate },
      },
    });

    const yearlyTrend = computeTrend(newYearlyCurrent, newYearlyPrevious);

    const kpis = {
      revenue: {
        title: "Total Revenue",
        value: totalRevenueValue,
        prefix: "$",
        description: `vs previous ${range.toLowerCase()}`,
        trend: revenueTrend.trend,
        isUp: revenueTrend.isUp,
      },
      students: {
        title: "Total Students",
        value: totalStudentsCount,
        prefix: "",
        description: `+${newStudentsCurrent} new in ${range}`,
        trend: studentTrend.trend,
        isUp: studentTrend.isUp,
      },
      subscriptions: {
        title: "Active Subscriptions",
        value: activeSubscriptionsCount,
        prefix: "",
        description: "Currently Active",
        trend: subsTrend.trend,
        isUp: subsTrend.isUp,
      },
      monthlySubscribers: {
        title: "Monthly Plan Subscribers",
        value: monthlySubscribersCount,
        prefix: "",
        description: "Active Monthly Pass",
        trend: monthlyTrend.trend,
        isUp: monthlyTrend.isUp,
      },
      yearlySubscribers: {
        title: "Yearly Plan Subscribers",
        value: yearlySubscribersCount,
        prefix: "",
        description: "Active Yearly Pass",
        trend: yearlyTrend.trend,
        isUp: yearlyTrend.isUp,
      },
    };

    // -------------------------------------------------------------
    // 2. REVENUE ANALYTICS LINE CHART BUCKETS
    // -------------------------------------------------------------
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

    const buckets: { label: string; amount: number; rawDate: Date }[] = [];
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

      buckets.push({ label, amount, rawDate: bStart });
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

    // -------------------------------------------------------------
    // 3. SUBSCRIPTION DISTRIBUTION DONUT
    // -------------------------------------------------------------
    const activeMonthlyCount = monthlySubscribersCount;
    const activeYearlyCount = yearlySubscribersCount;
    const inactiveCount = await prisma.subscription.count({
      where: {
        status: {
          in: [
            SubscriptionStatus.EXPIRED,
            SubscriptionStatus.CANCELLED,
            SubscriptionStatus.REVOKED,
            SubscriptionStatus.PENDING,
          ],
        },
        deletedAt: null,
      },
    });

    const totalSubCount = activeMonthlyCount + activeYearlyCount + inactiveCount;
    const monthlyPercent =
      totalSubCount > 0 ? Math.round((activeMonthlyCount / totalSubCount) * 100) : 0;
    const yearlyPercent =
      totalSubCount > 0 ? Math.round((activeYearlyCount / totalSubCount) * 100) : 0;
    const inactivePercent =
      totalSubCount > 0 ? Math.max(0, 100 - monthlyPercent - yearlyPercent) : 0;

    const subscriptionsDistribution = {
      total: totalSubCount,
      monthly: { count: activeMonthlyCount, percent: monthlyPercent },
      yearly: { count: activeYearlyCount, percent: yearlyPercent },
      inactive: { count: inactiveCount, percent: inactivePercent },
    };

    // -------------------------------------------------------------
    // 4. RECENT ORDERS (LATEST 6)
    // -------------------------------------------------------------
    const recentOrdersRaw = await prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      where: { deletedAt: null },
      include: {
        user: {
          select: { name: true, email: true },
        },
        plan: {
          select: { name: true },
        },
      },
    });

    const recentOrders = recentOrdersRaw.map((o) => {
      let statusStr = "Paid";
      if (o.status === OrderStatus.PAID) statusStr = "Paid";
      else if (
        o.status === OrderStatus.PENDING_PAYMENT ||
        o.status === OrderStatus.CREATED
      )
        statusStr = "Pending";
      else if (o.status === OrderStatus.FAILED || o.status === OrderStatus.CANCELLED)
        statusStr = "Failed";
      else if (
        o.status === OrderStatus.REFUNDED ||
        o.status === OrderStatus.PARTIALLY_REFUNDED
      )
        statusStr = "Refunded";

      return {
        id: o.orderNumber || `ORD-${o.id.slice(-6).toUpperCase()}`,
        student: o.user?.name || "Student",
        email: o.user?.email || "",
        plan: o.planNameSnapshot || o.plan?.name || "Academy Pass",
        amount: formatCurrencyINR(Number(o.totalAmount || 0)),
        status: statusStr,
        date: formatDateIST(o.paidAt || o.createdAt),
      };
    });

    // -------------------------------------------------------------
    // 5. LATEST REGISTERED USERS (LATEST 5)
    // -------------------------------------------------------------
    const latestUsersRaw = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      where: { role: UserRole.STUDENT, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        subscriptions: {
          where: { status: SubscriptionStatus.ACTIVE, deletedAt: null },
          take: 1,
          select: {
            plan: { select: { name: true } },
          },
        },
      },
    });

    const latestUsers = latestUsersRaw.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.name ? u.name.charAt(0).toUpperCase() : "U",
      plan: u.subscriptions[0]?.plan?.name || "Registered Student",
      joined: formatDateIST(u.createdAt),
    }));

    // -------------------------------------------------------------
    // 6. RECENT COURSE ENROLLMENTS (LATEST 5)
    // -------------------------------------------------------------
    const recentEnrollmentsRaw = await prisma.subscription.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      where: { deletedAt: null },
      include: {
        user: {
          select: { name: true, avatarUrl: true },
        },
        plan: {
          select: { name: true, type: true },
        },
      },
    });

    const recentEnrollments = recentEnrollmentsRaw.map((e) => ({
      id: e.id,
      student: e.user?.name || "Student",
      avatar: e.user?.name ? e.user.name.charAt(0).toUpperCase() : "S",
      course: e.plan?.name || "Academy Course Pass",
      plan: e.plan?.type === PlanType.YEARLY ? "Annual Pass" : "Monthly Pass",
      time: getRelativeTime(e.createdAt),
    }));

    // -------------------------------------------------------------
    // 7. RECENT SYSTEM ACTIVITY (LATEST 5)
    // -------------------------------------------------------------
    const activityLogsRaw = await prisma.userActivity.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
      },
    });

    let recentActivities = activityLogsRaw.map((act) => ({
      id: act.id,
      title: act.title,
      detail: act.details || `Action ${act.action} by ${act.user?.name || "user"}`,
      time: getRelativeTime(act.createdAt),
      iconCategory: act.action.includes("COURSE")
        ? "course"
        : act.action.includes("PAYMENT") || act.action.includes("ORDER")
          ? "order"
          : act.action.includes("CERTIFICATE")
            ? "certificate"
            : "user",
    }));

    if (recentActivities.length === 0) {
      // Fallback to real activity synthesized from recent registrations & payments
      const synthesized: typeof recentActivities = [];

      latestUsersRaw.slice(0, 3).forEach((u) => {
        synthesized.push({
          id: `act-usr-${u.id}`,
          title: "New Student Registered",
          detail: `${u.name} completed academy account registration.`,
          time: getRelativeTime(u.createdAt),
          iconCategory: "user",
        });
      });

      recentOrdersRaw.slice(0, 2).forEach((o) => {
        synthesized.push({
          id: `act-ord-${o.id}`,
          title: "Payment Received",
          detail: `${o.user?.name || "Student"} purchased ${o.planNameSnapshot || o.plan?.name} (${formatCurrencyINR(Number(o.totalAmount))}).`,
          time: getRelativeTime(o.paidAt || o.createdAt),
          iconCategory: "order",
        });
      });

      recentActivities = synthesized;
    }

    // -------------------------------------------------------------
    // 8. TOP SELLING PRICING PLANS
    // -------------------------------------------------------------
    const plansRaw = await prisma.subscriptionPlan.findMany({
      where: { deletedAt: null },
      include: {
        orders: {
          where: { status: OrderStatus.PAID, deletedAt: null },
          select: { totalAmount: true },
        },
        subscriptions: {
          where: { status: SubscriptionStatus.ACTIVE, deletedAt: null },
        },
      },
    });

    const topPlans = plansRaw
      .map((p) => {
        const rev = p.orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
        const activeSubCount = p.subscriptions.length;
        return {
          id: p.id,
          name: p.name,
          billing: `${p.type === PlanType.YEARLY ? "Yearly" : "Monthly"} (${formatCurrencyINR(Number(p.price))})`,
          revenue: formatCurrencyINR(rev),
          growth: `${activeSubCount} active ${activeSubCount === 1 ? "subscriber" : "subscribers"}`,
          numericRev: rev,
        };
      })
      .sort((a, b) => b.numericRev - a.numericRev)
      .slice(0, 4);

    // -------------------------------------------------------------
    // 9. TOP PERFORMING COURSES
    // -------------------------------------------------------------
    const coursesRaw = await prisma.course.findMany({
      where: { deletedAt: null },
      include: {
        userProgress: {
          select: { progressPercentage: true },
        },
      },
      take: 5,
    });

    const topCourses = coursesRaw.map((c) => {
      const studentCount = c.userProgress.length;
      const avgCompletion =
        studentCount > 0
          ? Math.round(
              c.userProgress.reduce(
                (sum, p) => sum + Number(p.progressPercentage || 0),
                0,
              ) / studentCount,
            )
          : 0;

      return {
        id: c.id,
        title: c.title,
        students: `${studentCount} ${studentCount === 1 ? "Student" : "Students"}`,
        revenue: formatCurrencyINR(studentCount * 4999),
        completion: `${avgCompletion}%`,
      };
    });

    // -------------------------------------------------------------
    // 10. FOOTER STATS
    // -------------------------------------------------------------
    const testimonialsCount = await prisma.testimonial.count({
      where: { deletedAt: null },
    });

    const certificatesCount = await prisma.showcaseCertificate.count({
      where: { deletedAt: null },
    });

    const mentorsCount = await prisma.user.count({
      where: {
        role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
        deletedAt: null,
      },
    });

    const categoriesCount = await prisma.course.count({
      where: {
        status: ContentStatus.PUBLISHED,
        deletedAt: null,
      },
    });

    const pendingTestimonialsCount = await prisma.testimonial.count({
      where: { status: ContentStatus.DRAFT, deletedAt: null },
    });

    const pendingOrdersCount = await prisma.order.count({
      where: { status: OrderStatus.PENDING_PAYMENT, deletedAt: null },
    });

    const pendingReviewsCount = pendingTestimonialsCount + pendingOrdersCount;

    const footerStats = {
      testimonials: `${testimonialsCount} Approved`,
      certificates: `${certificatesCount} Issued`,
      mentors: `${mentorsCount} Active`,
      categories: `${categoriesCount} Active`,
      pendingReviews: `${pendingReviewsCount} Required`,
    };

    // -------------------------------------------------------------
    // RETURN AGGREGATED DASHBOARD JSON
    // -------------------------------------------------------------
    return NextResponse.json({
      success: true,
      data: {
        range,
        kpis,
        revenueChart: {
          buckets,
          peakDayLabel,
        },
        subscriptionsDistribution,
        recentOrders,
        latestUsers,
        recentEnrollments,
        recentActivities,
        topPlans,
        topCourses,
        footerStats,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error fetching dashboard data" },
      { status: 500 },
    );
  }
}
