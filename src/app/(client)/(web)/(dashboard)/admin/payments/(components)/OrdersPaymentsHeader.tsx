"use client";

import { BadgeIndianRupee, Download } from "lucide-react";

interface OrdersPaymentsHeaderProps {
  totalCount: number;
  onExport: () => void;
}

export function OrdersPaymentsHeader({
  totalCount,
  onExport,
}: OrdersPaymentsHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#C9A227]/30 bg-[#C9A227]/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-[#C9A227]">
          <BadgeIndianRupee size={13} />
          Revenue Center
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Orders & Payments
          </h1>
          <span className="rounded-full border border-white/15 bg-[#111113] px-2.5 py-0.5 font-mono text-xs font-semibold text-zinc-400">
            {totalCount} Records
          </span>
        </div>

        <p className="mt-1 text-sm text-zinc-400">
          Review payments, subscription access, expiry dates and extensions.
        </p>
      </div>

      <button
        type="button"
        onClick={onExport}
        className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-[#111113] px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:border-[#C9A227]/50 hover:bg-[#C9A227]/10 hover:text-white"
      >
        <Download size={15} className="text-[#C9A227]" />
        Export Records
      </button>
    </header>
  );
}
