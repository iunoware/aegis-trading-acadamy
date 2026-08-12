import { NextResponse } from "next/server";
import { getRequiredSuperAdmin } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { PlanType, SubscriptionStatus } from "@/generated/prisma/client";

const planLabel: Record<PlanType, string> = {
  MONTHLY: "Monthly Subscription",
  YEARLY: "Yearly Subscription",
};

function calculateAccessStatus(
  subscription: {
    status: SubscriptionStatus;
    currentExpiryDate: Date;
  } | null,
) {
  if (!subscription) return "Cancelled" as const;

  if (
    subscription.status === SubscriptionStatus.CANCELLED ||
    subscription.status === SubscriptionStatus.REVOKED
  ) {
    return "Cancelled" as const;
  }

  const remainingDays = Math.ceil(
    (subscription.currentExpiryDate.getTime() - Date.now()) / 86_400_000,
  );

  if (remainingDays <= 0) return "Expired" as const;
  if (remainingDays <= 7) return "Expiring Soon" as const;
  return "Active" as const;
}

export async function GET() {
  try {
    await getRequiredSuperAdmin();

    const orders = await prisma.order.findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, discordName: true },
        },
        payments: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
        },
        invoice: true,
        subscription: {
          include: {
            extensions: {
              orderBy: { createdAt: "desc" },
              include: { extendedBy: { select: { name: true } } },
            },
            events: { orderBy: { createdAt: "desc" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const records = orders.map((order) => {
      const latestPayment = order.payments[0] ?? null;
      const subscription = order.subscription;

      return {
        id: order.id,
        orderId: order.orderNumber,
        subscriptionId: subscription?.id ?? null,
        userId: order.userId,
        userName: order.user.name,
        userEmail: order.user.email,
        userPhone: order.user.phone ?? "",
        discordName: order.user.discordName ?? "",

        plan: planLabel[order.planTypeSnapshot],
        amount: Number(order.totalAmount),
        currency: order.currency,

        purchaseDate: order.createdAt.toISOString(),
        originalExpiryDate: subscription?.originalExpiryDate.toISOString() ?? null,
        currentExpiryDate: subscription?.currentExpiryDate.toISOString() ?? null,
        accessStatus: calculateAccessStatus(subscription),

        paymentStatus: latestPayment?.status ?? "PENDING",
        paymentMethod: latestPayment?.method ?? null,
        paymentGateway: latestPayment?.gateway ?? undefined,
        transactionId: latestPayment?.transactionId ?? "",
        gatewayPaymentId: latestPayment?.gatewayPaymentId ?? undefined,

        invoiceNumber: order.invoice?.invoiceNumber ?? undefined,
        invoiceUrl: order.invoice?.invoiceUrl ?? undefined,
        receiptUrl: order.invoice?.receiptUrl ?? undefined,

        adminNotes: order.adminNotes ?? undefined,

        extensions:
          subscription?.extensions.map((ext) => ({
            id: ext.id,
            previousExpiryDate: ext.previousExpiryDate.toISOString(),
            newExpiryDate: ext.newExpiryDate.toISOString(),
            extensionDays: ext.extensionDays,
            reason: ext.reason,
            extendedBy: ext.extendedBy.name,
            extendedAt: ext.createdAt.toISOString(),
          })) ?? [],

        timeline:
          subscription?.events.map((event) => ({
            id: event.id,
            type: event.type,
            title: event.title,
            description: event.description ?? "",
            createdAt: event.createdAt.toISOString(),
          })) ?? [],
      };
    });

    return NextResponse.json({
      success: true,
      message: "Orders and payments fetched successfully.",
      records,
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

    console.error("GET orders-payments error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders and payments." },
      { status: 500 },
    );
  }
}
