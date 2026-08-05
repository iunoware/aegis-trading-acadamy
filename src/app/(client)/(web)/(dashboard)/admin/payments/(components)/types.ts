export type SubscriptionPlan = "Monthly Subscription" | "Yearly Subscription";

export type PaymentStatus = "Paid" | "Pending" | "Failed" | "Refunded";

export type AccessStatus = "Active" | "Expiring Soon" | "Expired" | "Cancelled";

export type PaymentMethod =
  | "UPI"
  | "Credit Card"
  | "Debit Card"
  | "Net Banking"
  | "Wallet"
  | "Bank Transfer"
  | "Cash";

export type OrderPaymentEventType =
  | "order_created"
  | "payment_completed"
  | "payment_failed"
  | "expiry_extended"
  | "refund_completed"
  | "note";

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
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  discordName: string;
  userEmail: string;
  userPhone: string;

  plan: SubscriptionPlan;
  amount: number;
  currency: "INR";

  purchaseDate: string;
  originalExpiryDate: string;
  currentExpiryDate: string;
  accessStatus: AccessStatus;

  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
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
  orderId: string;
  newExpiryDate: string;
  reason: string;
}
