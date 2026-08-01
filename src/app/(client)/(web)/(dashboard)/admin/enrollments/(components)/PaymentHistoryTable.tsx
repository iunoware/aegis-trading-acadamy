"use client";

import React from "react";
import { PaymentRecord } from "./EnrollmentsTable";
import { Receipt, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";

interface PaymentHistoryTableProps {
  payments: PaymentRecord[];
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt size={15} className="text-[#C9A227]" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            Payment History ({payments.length})
          </h4>
        </div>
      </div>

      <div className="rounded-xl bg-[#09090b] border border-white/10 overflow-hidden">
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#111113] text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  <th className="py-2.5 px-3 font-semibold">Plan</th>
                  <th className="py-2.5 px-3 font-semibold">Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Purchase Date</th>
                  <th className="py-2.5 px-3 font-semibold">Transaction ID</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-mono text-zinc-300">
                {payments.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {item.plan}
                    </td>
                    <td className="py-2.5 px-3 text-[#C9A227] font-bold">
                      {item.amount}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400">
                      {item.purchaseDate}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-500 font-mono text-[11px]">
                      {item.transactionId}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.status === "Paid"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : item.status === "Pending"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : item.status === "Refunded"
                            ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {item.status === "Paid" && <CheckCircle size={10} />}
                        {item.status === "Pending" && <Clock size={10} />}
                        {item.status === "Failed" && <XCircle size={10} />}
                        {item.status === "Refunded" && <RefreshCw size={10} />}
                        <span>{item.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center text-xs font-mono text-zinc-500">
            No payment history records found.
          </div>
        )}
      </div>
    </div>
  );
}
