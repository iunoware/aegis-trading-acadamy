import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import {
  PaymentGateway,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  SubscriptionStatus,
  SubscriptionSource,
  SubscriptionEventType,
} from "@/generated/prisma/client";
import { sendPaymentSuccessEmail } from "@/lib/mail";

export const runtime = "nodejs";

interface NowPaymentsIpnPayload {
  payment_id?: string | number;
  invoice_id?: string | number;
  payment_status?: string;
  pay_address?: string;
  price_amount?: number | string;
  price_currency?: string;
  pay_amount?: number | string;
  pay_currency?: string;
  actually_paid?: number | string;
  outcome_amount?: number | string;
  outcome_currency?: string;
  order_id?: string;
  order_description?: string;
  purchase_id?: string | number;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

function verifyNowPaymentsSignature(
  rawBody: string,
  payload: Record<string, unknown>,
  receivedSig: string,
  secret: string,
): boolean {
  if (!receivedSig || !secret) return false;

  try {
    // NOWPayments requires sorting keys alphabetically and stringifying to JSON
    const sortedKeys = Object.keys(payload).sort();
    const sortedPayload: Record<string, unknown> = {};
    for (const key of sortedKeys) {
      sortedPayload[key] = payload[key];
    }

    const sortedJson = JSON.stringify(sortedPayload);
    const computedSortedSig = crypto
      .createHmac("sha512", secret)
      .update(sortedJson)
      .digest("hex");

    const computedRawSig = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    const recBuf = Buffer.from(receivedSig.trim().toLowerCase(), "utf-8");
    const sortBuf = Buffer.from(
      computedSortedSig.trim().toLowerCase(),
      "utf-8",
    );
    const rawBuf = Buffer.from(computedRawSig.trim().toLowerCase(), "utf-8");

    const isSortedMatch =
      recBuf.length === sortBuf.length &&
      crypto.timingSafeEqual(recBuf, sortBuf);
    const isRawMatch =
      recBuf.length === rawBuf.length && crypto.timingSafeEqual(recBuf, rawBuf);

    return isSortedMatch || isRawMatch;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Read signature header
    const signatureHeader = request.headers.get("x-nowpayments-sig");

    if (!signatureHeader) {
      console.warn("[POST /api/payment/ipn] Missing x-nowpayments-sig header");
      return NextResponse.json(
        { success: false, message: "Missing signature header" },
        { status: 401 },
      );
    }

    // 2. Read raw request body before parsing JSON
    const rawBody = await request.text();

    if (!rawBody) {
      return NextResponse.json(
        { success: false, message: "Empty request body" },
        { status: 400 },
      );
    }

    // Parse JSON after reading raw text
    let payload: NowPaymentsIpnPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, message: "Malformed JSON payload" },
        { status: 400 },
      );
    }

    // 3. Verify NOWPayments IPN signature using secret
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

    if (!ipnSecret) {
      console.error(
        "[POST /api/payment/ipn] IPN Secret is not configured on server.",
      );
      return NextResponse.json(
        { success: false, message: "IPN configuration error" },
        { status: 500 },
      );
    }

    const isValidSignature = verifyNowPaymentsSignature(
      rawBody,
      payload,
      signatureHeader,
      ipnSecret,
    );

    if (!isValidSignature) {
      console.warn("[POST /api/payment/ipn] Invalid IPN signature received.");
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 401 },
      );
    }

    const orderNumber = payload.order_id ? String(payload.order_id).trim() : "";
    const paymentStatus = (payload.payment_status || "").toLowerCase().trim();
    const gatewayPaymentId = payload.payment_id
      ? String(payload.payment_id)
      : payload.invoice_id
        ? String(payload.invoice_id)
        : "";

    if (!orderNumber) {
      console.warn("[POST /api/payment/ipn] Received IPN without order_id");
      return NextResponse.json(
        { success: true, message: "No order_id in IPN" },
        { status: 200 },
      );
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[NOWPAYMENTS IPN TEST]", {
        orderNumber,
        paymentStatus,
        gatewayPaymentId,
        priceAmount: payload.price_amount,
        priceCurrency: payload.price_currency,
      });
    }

    // 4. Find order by orderNumber
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        payments: true,
        plan: true,
        user: true,
        subscription: true,
      },
    });

    if (!order) {
      console.warn(
        `[POST /api/payment/ipn] Order not found for orderNumber: ${orderNumber}`,
      );
      return NextResponse.json(
        { success: true, message: "Order not found" },
        { status: 200 },
      );
    }

    // Find NOWPayments payment record belonging to this order
    const payment =
      order.payments.find((p) => p.gateway === PaymentGateway.NOWPAYMENTS) ||
      order.payments[0];

    if (!payment) {
      console.warn(
        `[POST /api/payment/ipn] No payment record found for orderId: ${order.id}`,
      );
      return NextResponse.json(
        { success: true, message: "Payment record not found" },
        { status: 200 },
      );
    }

    // 5. Amount/Currency mismatch verification
    if (
      payload.price_currency &&
      payload.price_currency.toUpperCase() !== order.currency.toUpperCase()
    ) {
      console.error(
        `[POST /api/payment/ipn] Currency mismatch for ${orderNumber}: IPN=${payload.price_currency}, Order=${order.currency}`,
      );
      return NextResponse.json(
        { success: true, message: "Currency mismatch ignored" },
        { status: 200 },
      );
    }

    if (payload.price_amount !== undefined && payload.price_amount !== null) {
      const incomingAmount = Number(payload.price_amount);
      const expectedAmount = Number(order.totalAmount);

      if (Math.abs(incomingAmount - expectedAmount) > 0.01) {
        console.error(
          `[POST /api/payment/ipn] Amount mismatch for ${orderNumber}: IPN=${incomingAmount}, Order=${expectedAmount}`,
        );
        return NextResponse.json(
          { success: true, message: "Amount mismatch ignored" },
          { status: 200 },
        );
      }
    }

    // 6. Handle Payment Statuses

    // Pending / Intermediate statuses
    const pendingStatuses = [
      "waiting",
      "confirming",
      "confirmed",
      "sending",
      "partially_paid",
    ];
    if (pendingStatuses.includes(paymentStatus)) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          gatewayPaymentId: gatewayPaymentId || payment.gatewayPaymentId,
          gatewayOrderId: order.orderNumber,
          gatewayResponse: JSON.parse(JSON.stringify(payload)),
        },
      });

      return NextResponse.json(
        { success: true, message: `Status ${paymentStatus} recorded` },
        { status: 200 },
      );
    }

    // Failed or Expired statuses
    if (paymentStatus === "failed" || paymentStatus === "expired") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            failureCode: paymentStatus.toUpperCase(),
            failureMessage: `NOWPayments reported payment status: ${paymentStatus}`,
            failedAt: new Date(),
            gatewayPaymentId: gatewayPaymentId || payment.gatewayPaymentId,
            gatewayResponse: JSON.parse(JSON.stringify(payload)),
          },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.FAILED,
            failedAt: new Date(),
          },
        }),
      ]);

      return NextResponse.json(
        { success: true, message: `Payment failed (${paymentStatus})` },
        { status: 200 },
      );
    }

    // Refunded status
    if (paymentStatus === "refunded") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          gatewayResponse: JSON.parse(JSON.stringify(payload)),
        },
      });

      return NextResponse.json(
        { success: true, message: "Refund status recorded" },
        { status: 200 },
      );
    }

    // 7. Successful Payment: payment_status === "finished"
    if (paymentStatus === "finished") {
      const now = new Date();

      let subscriptionStartDate = now;
      let subscriptionExpiryDate: Date = new Date();

      await prisma.$transaction(async (tx) => {
        const existingSubscription =
          order.subscription ||
          (await tx.subscription.findUnique({
            where: { orderId: order.id },
          }));

        // A. Update Payment to PAID
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.PAID,
            gateway: PaymentGateway.NOWPAYMENTS,
            method: PaymentMethod.CRYPTO,
            paidAt: payment.paidAt || now,
            capturedAt: payment.capturedAt || now,
            gatewayOrderId: order.orderNumber,
            gatewayPaymentId: gatewayPaymentId || payment.gatewayPaymentId,
            gatewayResponse: JSON.parse(JSON.stringify(payload)),
            transactionId:
              gatewayPaymentId || payment.transactionId || undefined,
          },
        });

        // B. Update Order to PAID
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.PAID,
            paidAt: order.paidAt || now,
          },
        });

        // C. Existing subscription = idempotent webhook
        if (existingSubscription) {
          subscriptionStartDate =
            existingSubscription.startDate ||
            existingSubscription.purchaseDate ||
            now;

          subscriptionExpiryDate =
            existingSubscription.currentExpiryDate ||
            existingSubscription.originalExpiryDate;

          if (existingSubscription.status !== SubscriptionStatus.ACTIVE) {
            await tx.subscription.update({
              where: { id: existingSubscription.id },
              data: {
                status: SubscriptionStatus.ACTIVE,
              },
            });
          }

          return;
        }

        // D. Calculate subscription expiry
        const durationMonths =
          order.plan.durationMonths || (order.plan.type === "YEARLY" ? 12 : 1);

        subscriptionExpiryDate = new Date(now);
        subscriptionExpiryDate.setMonth(
          subscriptionExpiryDate.getMonth() + durationMonths,
        );

        // E. Create Subscription
        const newSubscription = await tx.subscription.create({
          data: {
            userId: order.userId,
            planId: order.planId,
            orderId: order.id,
            status: SubscriptionStatus.ACTIVE,
            source: SubscriptionSource.PAYMENT,
            purchaseDate: now,
            startDate: now,
            originalExpiryDate: subscriptionExpiryDate,
            currentExpiryDate: subscriptionExpiryDate,
            autoRenew: false,
            gateway: PaymentGateway.NOWPAYMENTS,
            gatewaySubscriptionId: null,
          },
        });

        // F. Create SubscriptionEvent
        await tx.subscriptionEvent.create({
          data: {
            subscriptionId: newSubscription.id,
            type: SubscriptionEventType.PURCHASED,
            title: "Subscription purchased",
            description: `Purchased ${order.plan.name} via NOWPayments (Order #${order.orderNumber}).`,
            actorId: null,
            metadata: {
              orderNumber: order.orderNumber,
              gatewayPaymentId,
              amount: Number(order.totalAmount),
              currency: order.currency,
            },
          },
        });
      });

      // IMPORTANT:
      // The database transaction has successfully completed.
      // Email failure must NOT cause the payment webhook to fail.
      try {
        if (order.user?.email) {
          const emailResult = await sendPaymentSuccessEmail({
            to: order.user.email,
            userName:
              order.user.name || order.user.email.split("@")[0] || "Student",
            planName: order.plan.name,
            amount: Number(order.totalAmount),
            currency: order.currency,
            orderNumber: order.orderNumber,
            paymentId: gatewayPaymentId || payment.gatewayPaymentId || "N/A",
            startDate: subscriptionStartDate,
            expiryDate: subscriptionExpiryDate,
          });

          if (!emailResult.success) {
            console.error("[PAYMENT_SUCCESS_EMAIL_FAILED]", emailResult.error);
          }
        } else {
          console.warn(
            "[PAYMENT_SUCCESS_EMAIL_SKIPPED] User email not available",
          );
        }
      } catch (emailError) {
        console.error("[PAYMENT_SUCCESS_EMAIL_ERROR]", emailError);
      }

      return NextResponse.json(
        {
          success: true,
          message: "IPN processed successfully",
        },
        { status: 200 },
      );
    }

    // Default response for unhandled status
    return NextResponse.json(
      { success: true, message: `Unhandled status: ${paymentStatus}` },
      { status: 200 },
    );
  } catch (error) {
    console.error("[POST /api/payment/ipn] Error processing IPN:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
