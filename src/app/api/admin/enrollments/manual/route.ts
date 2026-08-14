import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  PlanType,
  OrderStatus,
  PaymentStatus,
  PaymentGateway,
  PaymentMethod,
  SubscriptionSource,
  SubscriptionStatus,
  SubscriptionEventType,
  UserRole,
} from "@/generated/prisma/client";
import {
  transformSubscriptionToUI,
  subscriptionIncludeSelector,
} from "@/lib/enrollment-transform";

import { getCurrentAdminUser } from "@/lib/current-user";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const adminUser = await getCurrentAdminUser();

    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      userName,
      userEmail,
      userPhone,
      discordName,
      plan,
      currentPlan,
      adminNotes,
    } = body;

    const targetPlanName = plan || currentPlan || "Monthly Plan";
    const emailStr = String(userEmail || "").trim().toLowerCase();
    const nameStr = String(userName || "").trim();

    if (!emailStr || !nameStr) {
      return NextResponse.json(
        { success: false, message: "Name and Email are required" },
        { status: 400 }
      );
    }

    // 1. Find or create User
    let user = await prisma.user.findUnique({
      where: { email: emailStr },
    });

    if (!user) {
      const parts = nameStr.split(/\s+/);
      const firstName = parts.shift() || nameStr;
      const lastName = parts.length > 0 ? parts.join(" ") : null;

      user = await prisma.user.create({
        data: {
          name: nameStr,
          firstName,
          lastName,
          email: emailStr,
          phone: userPhone?.trim() || null,
          discordName: discordName?.trim() || null,
          password: "MANUAL_ENROLLMENT_NO_PASSWORD",
          role: UserRole.STUDENT,
          // Admin-created accounts are trusted and pre-verified
          emailVerifiedAt: new Date(),
          emailVerificationCode: null,
          emailVerificationExpiresAt: null,
          emailVerificationAttempts: 0,
          emailVerificationLastSentAt: null,
        },
      });
    }

    // 2. Find target SubscriptionPlan
    const planType =
      targetPlanName === "Yearly Plan" || targetPlanName === "YEARLY"
        ? PlanType.YEARLY
        : PlanType.MONTHLY;

    let subPlan = await prisma.subscriptionPlan.findFirst({
      where: {
        type: planType,
        deletedAt: null,
      },
    });

    if (!subPlan) {
      subPlan = await prisma.subscriptionPlan.create({
        data: {
          type: planType,
          name: planType === PlanType.YEARLY ? "Yearly Plan" : "Monthly Plan",
          price: planType === PlanType.YEARLY ? 7999 : 999,
          durationMonths: planType === PlanType.YEARLY ? 12 : 1,
          currency: "INR",
        },
      });
    }

    // 3. Calculate Dates & Amounts
    const now = new Date();
    const expDate = new Date();
    if (planType === PlanType.YEARLY) {
      expDate.setFullYear(expDate.getFullYear() + 1);
    } else {
      expDate.setMonth(expDate.getMonth() + 1);
    }

    const planPrice = Number(subPlan.price) || (planType === PlanType.YEARLY ? 7999 : 999);

    // 4. Create Order & Payment for transaction history
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: user.id,
        planId: subPlan.id,
        status: OrderStatus.PAID,
        planTypeSnapshot: planType,
        planNameSnapshot: subPlan.name,
        planPriceSnapshot: planPrice,
        subtotalAmount: planPrice,
        totalAmount: planPrice,
        currency: "INR",
        paidAt: now,
        payments: {
          create: {
            userId: user.id,
            status: PaymentStatus.PAID,
            method: PaymentMethod.OTHER,
            gateway: PaymentGateway.MANUAL,
            amount: planPrice,
            currency: "INR",
            transactionId: `MANUAL-${Math.floor(100000 + Math.random() * 900000)}`,
            paidAt: now,
          },
        },
      },
    });

    // 5. Author for Note
    const author =
      (await prisma.user.findFirst({
        where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
      })) || user;

    // 6. Create Subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: subPlan.id,
        orderId: order.id,
        status: SubscriptionStatus.ACTIVE,
        source: SubscriptionSource.MANUAL,
        purchaseDate: now,
        startDate: now,
        originalExpiryDate: expDate,
        currentExpiryDate: expDate,
        notes: adminNotes?.trim()
          ? {
              create: {
                note: adminNotes.trim(),
                authorId: author.id,
              },
            }
          : undefined,
        events: {
          create: {
            type: SubscriptionEventType.PURCHASED,
            title: `Manual Enrollment (${subPlan.name})`,
            description: `Enrolled manually by admin pass (${planType === PlanType.YEARLY ? "₹7,999" : "₹999"}).`,
          },
        },
      },
      include: subscriptionIncludeSelector,
    });

    const transformed = transformSubscriptionToUI(subscription);

    return NextResponse.json({
      success: true,
      enrollment: transformed,
      message: `User ${nameStr} enrolled manually!`,
    });
  } catch (error) {
    console.error("POST /api/enrollments/manual error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create manual enrollment" },
      { status: 500 }
    );
  }
}
