import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { getCurrentStudentUser } from "@/lib/current-user";
import {
  PlanType,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  PaymentGateway,
} from "@/generated/prisma/client";

export const runtime = "nodejs";

interface CreatePaymentRequestBody {
  planId?: string;
}

export async function POST(request: NextRequest) {
  let isAuthSuccess = false;
  let currentStep = "STEP_1_AUTH";

  try {
    // STEP 1: Authentication
    const user = await getCurrentStudentUser();
    isAuthSuccess = !!user;

    console.log("[PAYMENT CREATE] Authenticated student:", isAuthSuccess);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
          ...(process.env.NODE_ENV !== "production"
            ? { errorCode: "UNAUTHORIZED", details: "Student session invalid or user not logged in" }
            : {}),
        },
        { status: 401 },
      );
    }

    // Validate request body
    const body = (await request.json().catch(() => ({}))) as CreatePaymentRequestBody;
    const planId = body.planId;

    if (!planId || typeof planId !== "string" || !planId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid planId provided.",
          ...(process.env.NODE_ENV !== "production"
            ? { errorCode: "INVALID_PLAN_ID", details: "Request body missing valid planId string" }
            : {}),
        },
        { status: 400 },
      );
    }

    // STEP 2: Plan lookup
    currentStep = "STEP_2_PLAN_LOOKUP";
    const plan = await prisma.subscriptionPlan.findFirst({
      where: {
        id: planId.trim(),
        active: true,
        deletedAt: null,
      },
    });

    console.log("[PAYMENT CREATE] Plan lookup:", {
      planId: planId.trim(),
      planFound: !!plan,
      planType: plan?.type,
      planCurrency: plan?.currency,
      planPrice: plan ? Number(plan.price) : null,
    });

    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription plan not found or inactive.",
          ...(process.env.NODE_ENV !== "production"
            ? { errorCode: "PLAN_NOT_FOUND", details: `No active plan found with id: ${planId}` }
            : {}),
        },
        { status: 404 },
      );
    }

    if (plan.type !== PlanType.MONTHLY && plan.type !== PlanType.YEARLY) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported subscription plan type.",
          ...(process.env.NODE_ENV !== "production"
            ? { errorCode: "UNSUPPORTED_PLAN_TYPE", details: `Plan type ${plan.type} is not supported` }
            : {}),
        },
        { status: 400 },
      );
    }

    const numericPrice = Number(plan.price);
    const currency = plan.currency;

    if (!numericPrice || numericPrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid plan price configured.",
          ...(process.env.NODE_ENV !== "production"
            ? { errorCode: "INVALID_PLAN_PRICE", details: `Configured price is ${plan.price}` }
            : {}),
        },
        { status: 400 },
      );
    }

    // STEP 3: Order creation
    currentStep = "STEP_3_ORDER_CREATION";
    const orderNumber = `ATA-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        planId: plan.id,
        status: OrderStatus.PENDING_PAYMENT,
        planTypeSnapshot: plan.type,
        planNameSnapshot: plan.name,
        planPriceSnapshot: plan.price,
        subtotalAmount: plan.price,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: plan.price,
        currency,
      },
    });

    console.log("[PAYMENT CREATE] Order created:", {
      orderNumber: order.orderNumber,
      orderId: order.id,
    });

    // STEP 4: Payment creation
    currentStep = "STEP_4_PAYMENT_CREATION";
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: user.id,
        status: PaymentStatus.PENDING,
        method: PaymentMethod.CRYPTO,
        gateway: PaymentGateway.NOWPAYMENTS,
        amount: plan.price,
        currency,
      },
    });

    console.log("[PAYMENT CREATE] Payment created:", {
      paymentId: payment.id,
    });

    // STEP 5: NOWPayments configuration check
    currentStep = "STEP_5_CONFIG_CHECK";
    const apiKey = process.env.NOWPAYMENTS_API_KEY || process.env.NP_LIVE_KEY;
    const isApiKeyConfigured = !!(apiKey && apiKey.trim());

    console.log("NOWPAYMENTS_API_KEY configured:", isApiKeyConfigured);

    if (!isApiKeyConfigured) {
      console.error("[POST /api/payment/create] NOWPAYMENTS_API_KEY environment variable is not configured.");

      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            failureCode: "MISSING_API_KEY",
            failureMessage: "Payment gateway key is not configured.",
            failedAt: new Date(),
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
        {
          success: false,
          message: "Payment initialization failed. Please contact support.",
          ...(process.env.NODE_ENV !== "production"
            ? { errorCode: "MISSING_API_KEY", details: "NOWPAYMENTS_API_KEY is not defined in environment variables" }
            : {}),
        },
        { status: 500 },
      );
    }

    // Build IPN Callback URL
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    const origin = host
      ? `${proto}://${host}`
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const ipnCallbackUrl = `${origin}/api/payment/ipn`;

    // STEP 6: NOWPayments request logging
    currentStep = "STEP_6_SENDING_INVOICE";
    console.log("[PAYMENT CREATE] Sending invoice request:", {
      orderNumber: order.orderNumber,
      priceAmount: numericPrice,
      dbCurrency: currency,
      priceCurrency: currency.toLowerCase(),
      ipnCallbackUrl,
    });

    // STEP 7 / 8: Call NOWPayments Invoice API
    try {
      const nowPaymentsResponse = await axios.post(
        "https://api.nowpayments.io/v1/invoice",
        {
          price_amount: numericPrice,
          price_currency: currency.toLowerCase(),
          order_id: order.orderNumber,
          order_description: `${plan.name} Subscription`,
          ipn_callback_url: ipnCallbackUrl,
        },
        {
          headers: {
            "x-api-key": apiKey.trim(),
            "Content-Type": "application/json",
          },
          timeout: 15000,
        },
      );

      const responseData = nowPaymentsResponse.data;
      const checkoutUrl = responseData.invoice_url;

      console.log("[PAYMENT CREATE] NOWPayments invoice created:", {
        status: nowPaymentsResponse.status,
        invoiceId: responseData.id,
        invoiceUrlExists: !!checkoutUrl,
        orderId: responseData.order_id || order.orderNumber,
      });

      if (!checkoutUrl) {
        throw new Error("NOWPayments API did not return an invoice_url");
      }

      // Update Payment record with NOWPayments details
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          gatewayOrderId: String(responseData.order_id || order.orderNumber),
          gatewayPaymentId: String(responseData.id || ""),
          gatewayResponse: JSON.parse(JSON.stringify(responseData)),
        },
      });

      return NextResponse.json(
        {
          success: true,
          checkoutUrl,
          orderId: order.orderNumber,
        },
        { status: 200 },
      );
    } catch (nowPaymentsError: any) {
      // STEP 8: NOWPayments error logging
      const status = nowPaymentsError?.response?.status;
      const rawData = nowPaymentsError?.response?.data;
      const rawMessage = nowPaymentsError?.message;

      const safeErrorMsg =
        typeof rawData === "object"
          ? JSON.stringify(rawData).replace(/key=[^&]+/gi, "key=HIDDEN")
          : String(rawMessage || "NOWPayments request failed");

      console.error("[PAYMENT CREATE] NOWPayments error:", {
        httpStatus: status || "NETWORK_ERROR",
        message: safeErrorMsg,
      });

      const errorMessage =
        nowPaymentsError?.response?.data?.message ||
        nowPaymentsError?.message ||
        "NOWPayments API request failed";

      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            failureCode: status ? `NOWPAYMENTS_HTTP_${status}` : "NOWPAYMENTS_ERROR",
            failureMessage: String(errorMessage).substring(0, 500),
            failedAt: new Date(),
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
        {
          success: false,
          message: "Failed to create payment invoice. Please try again later.",
          ...(process.env.NODE_ENV !== "production"
            ? {
                errorCode: "NOWPAYMENTS_API_ERROR",
                details: safeErrorMsg,
              }
            : {}),
        },
        { status: 502 },
      );
    }
  } catch (error: any) {
    console.error(`[PAYMENT CREATE] Internal server error at step [${currentStep}]:`, error?.message || error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while starting the payment. Please try again.",
        ...(process.env.NODE_ENV !== "production"
          ? {
              errorCode: "INTERNAL_SERVER_ERROR",
              details: `Failed at ${currentStep}: ${error?.message || String(error)}`,
            }
          : {}),
      },
      { status: 500 },
    );
  }
}
