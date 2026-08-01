"use client";

import React from "react";
import { Users, Download } from "lucide-react";

interface UsersHeaderProps {
  onExport: () => void;
  totalCount: number;
}

export function UsersHeader({ onExport, totalCount }: UsersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 text-[11px] font-mono uppercase tracking-widest text-[#C9A227] mb-2">
          <Users size={13} />
          ACCOUNT DIRECTORY
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans flex items-center gap-3">
          <span>Users</span>
          <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#111113] border border-white/15 text-zinc-400">
            {totalCount} Total
          </span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1 font-normal">
          Manage all registered users of the academy.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#111113] border border-white/15 text-zinc-200 hover:text-white hover:border-[#C9A227]/50 hover:bg-[#C9A227]/10 transition-all duration-200 cursor-pointer shadow-md"
        >
          <Download size={15} className="text-[#C9A227]" />
          <span>Export Users</span>
        </button>
      </div>
    </div>
  );
}
