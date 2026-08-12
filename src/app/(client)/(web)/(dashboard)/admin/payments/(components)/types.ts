// export type SubscriptionPlan = "Monthly Subscription" | "Yearly Subscription";

// export type PaymentStatus = "Paid" | "Pending" | "Failed" | "Refunded";

// export type AccessStatus = "Active" | "Expiring Soon" | "Expired" | "Cancelled";

// export type PaymentMethod =
//   | "UPI"
//   | "Credit Card"
//   | "Debit Card"
//   | "Net Banking"
//   | "Wallet"
//   | "Bank Transfer"
//   | "Cash";

// export type OrderPaymentEventType =
//   | "order_created"
//   | "payment_completed"
//   | "payment_failed"
//   | "expiry_extended"
//   | "refund_completed"
//   | "note";

// export interface ExpiryExtension {
//   id: string;
//   previousExpiryDate: string;
//   newExpiryDate: string;
//   extensionDays: number;
//   reason: string;
//   extendedBy: string;
//   extendedAt: string;
// }

// export interface OrderPaymentEvent {
//   id: string;
//   type: OrderPaymentEventType;
//   title: string;
//   description: string;
//   createdAt: string;
// }

// export interface OrderPaymentRecord {
//   id: string;
//   orderId: string;
//   userId: string;
//   userName: string;
//   discordName: string;
//   userEmail: string;
//   userPhone: string;

//   plan: SubscriptionPlan;
//   amount: number;
//   currency: "INR";

//   purchaseDate: string;
//   originalExpiryDate: string;
//   currentExpiryDate: string;
//   accessStatus: AccessStatus;

//   paymentStatus: PaymentStatus;
//   paymentMethod: PaymentMethod;
//   paymentGateway?: string;
//   transactionId: string;
//   gatewayPaymentId?: string;

//   invoiceNumber?: string;
//   invoiceUrl?: string;
//   receiptUrl?: string;

//   adminNotes?: string;
//   extensions: ExpiryExtension[];
//   timeline: OrderPaymentEvent[];
// }

// export interface ExtensionRequest {
//   orderId: string;
//   newExpiryDate: string;
//   reason: string;
// }

export type SubscriptionPlan = "Monthly Subscription" | "Yearly Subscription";

export type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "CAPTURED"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type AccessStatus = "Active" | "Expiring Soon" | "Expired" | "Cancelled";

export type PaymentMethod =
  | "UPI"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "NET_BANKING"
  | "WALLET"
  | "BANK_TRANSFER"
  | "CASH"
  | "OTHER";

export type OrderPaymentEventType =
  | "PURCHASED"
  | "RENEWED"
  | "PLAN_CHANGED"
  | "EXTENDED"
  | "CANCELLED"
  | "REACTIVATED"
  | "EXPIRED"
  | "NOTE_ADDED"
  | "STATUS_CHANGED";

export interface ExpiryExtension {
  id: string;
  previousExpiryDate: string;
  newExpiryDate: string;
  extensionDays: number;
  reason: string;
  extendedBy: string;
  extendedAt: string;
}

export interface OrderPaymentEvent {
  id: string;
  type: OrderPaymentEventType;
  title: string;
  description: string;
  createdAt: string;
}

export interface OrderPaymentRecord {
  id: string; // Order.id
  orderId: string; // Order.orderNumber
  subscriptionId: string | null;
  userId: string;
  userName: string;
  discordName: string;
  userEmail: string;
  userPhone: string;

  plan: SubscriptionPlan;
  amount: number;
  currency: string;

  purchaseDate: string;
  originalExpiryDate: string | null;
  currentExpiryDate: string | null;
  accessStatus: AccessStatus;

  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  paymentGateway?: string;
  transactionId: string;
  gatewayPaymentId?: string;

  invoiceNumber?: string;
  invoiceUrl?: string;
  receiptUrl?: string;

  adminNotes?: string;
  extensions: ExpiryExtension[];
  timeline: OrderPaymentEvent[];
}

export interface ExtensionRequest {
  orderId: string; // Order.orderNumber
  newExpiryDate: string;
  reason: string;
}
