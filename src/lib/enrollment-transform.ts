import {
  SubscriptionStatus,
  SubscriptionEventType,
  PaymentStatus,
} from "@/generated/prisma/client";

export interface PaymentRecord {
  id: string;
  plan: string;
  amount: string;
  purchaseDate: string;
  status: "Paid" | "Pending" | "Failed" | "Refunded";
  transactionId: string;
}

export interface TimelineRecord {
  id: string;
  action: string;
  date: string;
  details: string;
  type:
    | "purchase"
    | "renew"
    | "plan_change"
    | "extend"
    | "cancel"
    | "reactivate"
    | "note";
}

export interface Enrollment {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  discordName: string;
  avatar?: string;
  currentPlan: "Monthly Plan" | "Yearly Plan";
  purchaseDate: string;
  expiryDate: string;
  status: "Active" | "Expiring Soon" | "Expired" | "Cancelled";
  adminNotes?: string;
  paymentHistory: PaymentRecord[];
  subscriptionTimeline: TimelineRecord[];
}

export function formatDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function mapPaymentStatus(
  status: string,
): "Paid" | "Pending" | "Failed" | "Refunded" {
  switch (status) {
    case PaymentStatus.PAID:
    case PaymentStatus.CAPTURED:
      return "Paid";
    case PaymentStatus.PENDING:
    case PaymentStatus.AUTHORIZED:
      return "Pending";
    case PaymentStatus.FAILED:
    case PaymentStatus.CANCELLED:
      return "Failed";
    case PaymentStatus.REFUNDED:
    case PaymentStatus.PARTIALLY_REFUNDED:
      return "Refunded";
    default:
      return "Paid";
  }
}

export function mapEventType(type: string): TimelineRecord["type"] {
  switch (type) {
    case SubscriptionEventType.PURCHASED:
      return "purchase";
    case SubscriptionEventType.RENEWED:
      return "renew";
    case SubscriptionEventType.PLAN_CHANGED:
      return "plan_change";
    case SubscriptionEventType.EXTENDED:
      return "extend";
    case SubscriptionEventType.CANCELLED:
      return "cancel";
    case SubscriptionEventType.REACTIVATED:
      return "reactivate";
    case SubscriptionEventType.NOTE_ADDED:
      return "note";
    default:
      return "purchase";
  }
}

export function transformSubscriptionToUI(subscription: any): Enrollment {
  const now = new Date();
  const expiry = new Date(subscription.currentExpiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let computedStatus: "Active" | "Expiring Soon" | "Expired" | "Cancelled" = "Active";

  if (subscription.status === SubscriptionStatus.ACTIVE) {
    if (diffDays <= 5) {
      computedStatus = "Expiring Soon";
    } else {
      computedStatus = "Active";
    }
  } else if (subscription.status === SubscriptionStatus.EXPIRED) {
    computedStatus = "Expired";
  } else if (subscription.status === SubscriptionStatus.CANCELLED) {
    computedStatus = "Cancelled";
  } else {
    computedStatus = "Expired";
  }

  // Plan name mapping
  const planType = subscription.plan?.type;
  const planNameRaw = subscription.plan?.name || "";
  let currentPlan: "Monthly Plan" | "Yearly Plan" = "Monthly Plan";
  if (
    planType === "YEARLY" ||
    planNameRaw.toLowerCase().includes("yearly") ||
    planNameRaw.toLowerCase().includes("annual")
  ) {
    currentPlan = "Yearly Plan";
  } else {
    currentPlan = "Monthly Plan";
  }

  // Admin notes: latest note if exists
  const adminNotes =
    subscription.notes && subscription.notes.length > 0 ? subscription.notes[0].note : "";

  // Payment history mapping
  const paymentHistory: PaymentRecord[] = [];
  if (
    subscription.order &&
    subscription.order.payments &&
    subscription.order.payments.length > 0
  ) {
    for (const p of subscription.order.payments) {
      paymentHistory.push({
        id: p.id,
        plan: currentPlan,
        amount: `$${Number(p.amount).toLocaleString("en-IN")}`,
        purchaseDate: formatDate(p.paidAt || p.createdAt),
        status: mapPaymentStatus(p.status),
        transactionId: p.transactionId || p.gatewayPaymentId || `TXN-${p.id.slice(-7)}`,
      });
    }
  }

  // Subscription timeline mapping (sorted DESC)
  const events = subscription.events || [];
  const sortedEvents = [...events].sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const subscriptionTimeline: TimelineRecord[] = sortedEvents.map((e: any) => ({
    id: e.id,
    action: e.title,
    date: formatDate(e.createdAt),
    details: e.description || "",
    type: mapEventType(e.type),
  }));

  return {
    id: subscription.id,
    userName: subscription.user?.name || "Unknown User",
    userEmail: subscription.user?.email || "",
    userPhone: subscription.user?.phone || "",
    discordName: subscription.user?.discordName || "",
    avatar: subscription.user?.avatarUrl || undefined,
    currentPlan,
    purchaseDate: formatDate(subscription.purchaseDate),
    expiryDate: formatDate(subscription.currentExpiryDate),
    status: computedStatus,
    adminNotes,
    paymentHistory,
    subscriptionTimeline,
  };
}

export const subscriptionIncludeSelector = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      discordName: true,
      avatarUrl: true,
    },
  },
  plan: {
    select: {
      id: true,
      name: true,
      type: true,
      price: true,
    },
  },
  notes: {
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" as const },
    take: 1,
  },
  events: {
    orderBy: { createdAt: "desc" as const },
  },
  order: {
    include: {
      payments: {
        orderBy: { createdAt: "desc" as const },
      },
    },
  },
};
