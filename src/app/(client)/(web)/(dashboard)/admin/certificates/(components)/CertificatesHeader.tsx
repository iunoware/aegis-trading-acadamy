"use client";

import React from "react";
import { Award, Plus } from "lucide-react";

interface CertificatesHeaderProps {
  onAddCertificate: () => void;
  totalCount: number;
}

export function CertificatesHeader({
  onAddCertificate,
  totalCount,
}: CertificatesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 text-[11px] font-mono uppercase tracking-widest text-[#C9A227] mb-2">
          <Award size={13} />
          ACCREDITATION & ACHIEVEMENTS CMS
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans flex items-center gap-3">
          <span>Certificates</span>
          <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#111113] border border-white/15 text-zinc-400">
            {totalCount} Total
          </span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1 font-normal">
          Manage certificates displayed on the website showcase.
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={onAddCertificate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] text-black hover:brightness-110 shadow-[0_0_20px_rgba(201,162,39,0.25)] transition-all duration-200 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Certificate</span>
        </button>
      </div>
    </div>
  );
}
