import type { OrderPaymentEventType, PaymentMethod, PaymentStatus } from "./types";

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  AUTHORIZED: "Authorized",
  CAPTURED: "Captured",
  PAID: "Paid",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  PARTIALLY_REFUNDED: "Partially Refunded",
};

export const paymentStatusBadge: Record<PaymentStatus, string> = {
  PENDING: "border-amber-500/30 bg-amber-500/15 text-amber-400",
  AUTHORIZED: "border-amber-500/30 bg-amber-500/15 text-amber-400",
  CAPTURED: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  PAID: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  FAILED: "border-rose-500/30 bg-rose-500/15 text-rose-400",
  CANCELLED: "border-rose-500/30 bg-rose-500/15 text-rose-400",
  REFUNDED: "border-sky-500/30 bg-sky-500/15 text-sky-400",
  PARTIALLY_REFUNDED: "border-sky-500/30 bg-sky-500/15 text-sky-400",
};

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  CRYPTO: "Crypto",
};

export const eventTypeDot: Record<OrderPaymentEventType, string> = {
  PURCHASED: "bg-emerald-400",
  RENEWED: "bg-emerald-400",
  PLAN_CHANGED: "bg-violet-400",
  EXTENDED: "bg-[#C9A227]",
  CANCELLED: "bg-rose-400",
  REACTIVATED: "bg-sky-400",
  EXPIRED: "bg-zinc-500",
  NOTE_ADDED: "bg-violet-400",
  STATUS_CHANGED: "bg-zinc-400",
};

export const eventTypeLabel: Record<OrderPaymentEventType, string> = {
  PURCHASED: "Purchased",
  RENEWED: "Renewed",
  PLAN_CHANGED: "Plan Changed",
  EXTENDED: "Extended",
  CANCELLED: "Cancelled",
  REACTIVATED: "Reactivated",
  EXPIRED: "Expired",
  NOTE_ADDED: "Note Added",
  STATUS_CHANGED: "Status Changed",
};
