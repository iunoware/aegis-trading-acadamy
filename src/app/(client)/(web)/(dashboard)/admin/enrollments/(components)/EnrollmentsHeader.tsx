"use client";

import React from "react";
import { BadgeIndianRupee, Download, Plus } from "lucide-react";

interface EnrollmentsHeaderProps {
  onExport: () => void;
  onManualEnrollment: () => void;
  totalCount: number;
}

export function EnrollmentsHeader({
  onExport,
  onManualEnrollment,
  totalCount,
}: EnrollmentsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 text-[11px] font-mono uppercase tracking-widest text-[#C9A227] mb-2">
          <BadgeIndianRupee size={13} />
          SUBSCRIPTION CENTER
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans flex items-center gap-3">
          <span>Enrollments</span>
          <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#111113] border border-white/15 text-zinc-400">
            {totalCount} Enrolled
          </span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1 font-normal">
          Manage all academy subscriptions and member access.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#111113] border border-white/15 text-zinc-200 hover:text-white hover:border-[#C9A227]/50 hover:bg-[#C9A227]/10 transition-all duration-200 cursor-pointer shadow-md"
        >
          <Download size={15} className="text-[#C9A227]" />
          <span>Export Enrollments</span>
        </button>

        {/* <button
          type="button"
          onClick={onManualEnrollment}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] text-black hover:brightness-110 shadow-[0_0_20px_rgba(201,162,39,0.25)] transition-all duration-200 cursor-pointer"
        >
          <Plus size={15} />
          <span>Manual Enrollment</span>
        </button> */}
      </div>
    </div>
  );
}
