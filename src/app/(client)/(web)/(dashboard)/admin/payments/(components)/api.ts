import axios from "axios";
import type { ExtensionRequest, OrderPaymentRecord } from "./types";

interface OrdersPaymentsResponse {
  success: boolean;
  message: string;
  records: OrderPaymentRecord[];
}

interface ExtendExpiryResponse {
  success: boolean;
  message: string;
  currentExpiryDate: string;
}

export async function fetchOrdersPayments() {
  const { data } = await axios.get<OrdersPaymentsResponse>("/api/admin/orders-payments");
  return data;
}

export async function extendOrderExpiry(request: ExtensionRequest) {
  const { data } = await axios.patch<ExtendExpiryResponse>(
    `/api/admin/orders-payments/${request.orderId}/extend-expiry`,
    { newExpiryDate: request.newExpiryDate, reason: request.reason },
  );
  return data;
}
