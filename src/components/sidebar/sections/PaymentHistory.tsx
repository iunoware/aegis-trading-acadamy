"use client";

import React from "react";
import { CreditCard, CheckCircle, AlertCircle, Clock, RotateCcw } from "lucide-react";

export interface PaymentRecord {
  id: string;
  plan: string;
  amount: string;
  purchaseDate: string;
  status: "Paid" | "Pending" | "Failed" | "Refunded";
  transactionId: string;
}

interface PaymentHistoryProps {
  payments: PaymentRecord[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CreditCard size={15} className="text-[#C9A227]" />
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
          Payment History
        </h4>
      </div>

      {!payments || payments.length === 0 ? (
        <div className="p-4 rounded-xl bg-[#111113] border border-white/10 text-center text-xs font-mono text-zinc-500">
          No payment records found.
        </div>
      ) : (
        <div className="rounded-2xl bg-[#111113] border border-white/10 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#09090b] text-zinc-500 border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-semibold text-white">{p.plan}</td>
                    <td className="py-2.5 px-3 text-[#C9A227] font-bold">{p.amount}</td>
                    <td className="py-2.5 px-3 text-zinc-400">{p.purchaseDate}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          p.status === "Paid"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : p.status === "Pending"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : p.status === "Refunded"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {p.status === "Paid" && <CheckCircle size={10} />}
                        {p.status === "Pending" && <Clock size={10} />}
                        {p.status === "Failed" && <AlertCircle size={10} />}
                        {p.status === "Refunded" && <RotateCcw size={10} />}
                        <span>{p.status}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-zinc-500 text-[10px]">
                      {p.transactionId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
