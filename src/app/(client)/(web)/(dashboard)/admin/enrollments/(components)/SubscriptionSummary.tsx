"use client";

import React from "react";
import { Enrollment } from "./EnrollmentsTable";
import {
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  Clock,
  User as UserIcon,
} from "lucide-react";
import { DiscordIcon } from "@/components/Icons";

interface SubscriptionSummaryProps {
  enrollment: Enrollment;
}

export function SubscriptionSummary({ enrollment }: SubscriptionSummaryProps) {
  const initials = enrollment.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Compute remaining days
  let remainingDays = 0;
  if (enrollment.status !== "Expired" && enrollment.status !== "Cancelled") {
    const expTime = new Date(enrollment.expiryDate).getTime();
    const nowTime = new Date("2026-08-01").getTime();
    const diff = expTime - nowTime;
    remainingDays = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="space-y-4">
      {/* User Summary Card */}
      <div className="rounded-2xl bg-[#111113] border border-white/10 p-5 space-y-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="relative w-13 h-13 rounded-full bg-linear-to-br from-[#e6c55a]/20 to-[#C9A227]/30 border-2 border-[#C9A227]/50 flex items-center justify-center text-[#C9A227] font-extrabold text-base shadow-lg shrink-0">
            <span>{initials}</span>
          </div>

          <div>
            <h3 className="text-base font-black text-white font-sans">
              {enrollment.userName}
            </h3>
            <div className="flex flex-wrap mt-2 items-center gap-4 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1">
                <Mail size={12} className="text-zinc-500" />
                {enrollment.userEmail}
              </span>
              <span className="flex items-center gap-1">
                <Phone size={12} className="text-zinc-500" />
                {enrollment.userPhone}
              </span>
              <span className="flex items-center gap-1">
                <DiscordIcon className="text-zinc-500 h-4" />
                {enrollment.discordName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Subscription Card */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#151518] to-[#0d0d0f] border border-[#C9A227]/30 p-5 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#C9A227]/10 blur-[50px] pointer-events-none rounded-full" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#C9A227]/20 border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227]">
              <ShieldCheck size={16} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A227] font-bold">
                ACTIVE SUBSCRIPTION TIER
              </span>
              <h4 className="text-base font-extrabold text-white font-sans">
                {enrollment.currentPlan}
              </h4>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
              enrollment.status === "Active"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : enrollment.status === "Expiring Soon"
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : enrollment.status === "Expired"
                    ? "bg-zinc-500/15 text-zinc-400 border border-zinc-500/30"
                    : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
            }`}
          >
            {enrollment.status}
          </span>
        </div>

        {/* Dates & Remaining Days Grid */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10 text-center font-mono relative z-10">
          <div className="p-2.5 rounded-xl bg-[#09090b]/80 border border-white/5">
            <span className="text-[10px] text-zinc-500 uppercase block">
              Purchase Date
            </span>
            <span className="text-xs text-white font-semibold">
              {enrollment.purchaseDate}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#09090b]/80 border border-white/5">
            <span className="text-[10px] text-zinc-500 uppercase block">Expiry Date</span>
            <span className="text-xs text-white font-semibold">
              {enrollment.expiryDate}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30">
            <span className="text-[10px] text-[#C9A227] uppercase block font-semibold">
              Remaining Days
            </span>
            <span className="text-xs text-white font-black">
              {remainingDays > 0 ? `${remainingDays} Days` : "0 Days"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
