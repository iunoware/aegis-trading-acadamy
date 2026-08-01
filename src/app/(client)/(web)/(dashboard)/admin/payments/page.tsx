"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { OrderPaymentDrawer } from "./(components)/OrderPaymentDrawer";
import { OrdersPaymentsHeader } from "./(components)/OrdersPaymentsHeader";
import { OrdersPaymentsOverview } from "./(components)/OrdersPaymentsOverview";
import { OrdersPaymentsTable } from "./(components)/OrdersPaymentsTable";
import { MOCK_ORDER_PAYMENTS } from "./(components)/mock-data";
import type {
  AccessStatus,
  ExtensionRequest,
  OrderPaymentRecord,
} from "./(components)/types";

const calculateAccessStatus = (expiryDate: string): AccessStatus => {
  const remainingDays = Math.ceil(
    (new Date(expiryDate).getTime() - Date.now()) / 86_400_000,
  );

  if (remainingDays <= 0) return "Expired";
  if (remainingDays <= 7) return "Expiring Soon";
  return "Active";
};

export default function OrdersPaymentsPage() {
  const [records, setRecords] = useState<OrderPaymentRecord[]>(MOCK_ORDER_PAYMENTS);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const selectedRecord = useMemo(
    () => records.find((record) => record.id === selectedRecordId) ?? null,
    [records, selectedRecordId],
  );

  const handleExtendExpiry = (request: ExtensionRequest) => {
    setRecords((currentRecords) =>
      currentRecords.map((record) => {
        if (record.orderId !== request.orderId) return record;

        const previousExpiry = new Date(record.currentExpiryDate);
        const newExpiry = new Date(request.newExpiryDate);
        const extensionDays = Math.max(
          1,
          Math.ceil((newExpiry.getTime() - previousExpiry.getTime()) / 86_400_000),
        );
        const now = new Date().toISOString();

        return {
          ...record,
          currentExpiryDate: request.newExpiryDate,
          accessStatus: calculateAccessStatus(request.newExpiryDate),
          extensions: [
            {
              id: `extension-${Date.now()}`,
              previousExpiryDate: record.currentExpiryDate,
              newExpiryDate: request.newExpiryDate,
              extensionDays,
              reason: request.reason,
              extendedBy: "Super Admin",
              extendedAt: now,
            },
            ...record.extensions,
          ],
          timeline: [
            {
              id: `event-${Date.now()}`,
              type: "expiry_extended",
              title: "Expiry extended by Super Admin",
              description: `Access extended by ${extensionDays} days without additional payment. Reason: ${request.reason}`,
              createdAt: now,
            },
            ...record.timeline,
          ],
        };
      }),
    );

    toast.success("Expiry date extended successfully", {
      description: "No additional payment record was created.",
    });
  };

  const handleExport = () => {
    const rows = records.map((record) => ({
      orderId: record.orderId,
      userName: record.userName,
      email: record.userEmail,
      package: record.plan,
      amount: record.amount,
      paymentStatus: record.paymentStatus,
      purchaseDate: record.purchaseDate,
      expiryDate: record.currentExpiryDate,
    }));

    const headers = Object.keys(rows[0] ?? {});
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => JSON.stringify(row[header as keyof typeof row] ?? ""))
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `orders-payments-${Date.now()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);

    toast.success("Orders and payments exported");
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8 pb-12">
      <div>
        <OrdersPaymentsHeader totalCount={records.length} onExport={handleExport} />
      </div>

      <div>
        <OrdersPaymentsOverview records={records} />
      </div>

      <div>
        <OrdersPaymentsTable
          records={records}
          onSelect={(record) => setSelectedRecordId(record.id)}
        />
      </div>

      <OrderPaymentDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecordId(null)}
        onExtend={handleExtendExpiry}
      />
    </div>
  );
}
