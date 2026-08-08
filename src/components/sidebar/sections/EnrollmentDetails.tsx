"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Calendar,
  Clock,
  Tag,
  Settings,
  CalendarPlus,
  RefreshCw,
  Ban,
  CheckCircle,
  Check,
} from "lucide-react";

export interface SubscriptionDetailsData {
  id: string;
  currentPlan: "Monthly Plan" | "Yearly Plan";
  purchaseDate: string;
  expiryDate: string;
  status: "Active" | "Expiring Soon" | "Expired" | "Cancelled";
}

interface EnrollmentDetailsProps {
  subscription: SubscriptionDetailsData;
  onExtendSubscription?: (enrollmentId: string, days: number) => void;
  onChangePlan?: (
    enrollmentId: string,
    newPlan: "Monthly Plan" | "Yearly Plan"
  ) => void;
  onToggleStatus?: (enrollmentId: string) => void;
}

export function EnrollmentDetails({
  subscription,
  onExtendSubscription,
  onChangePlan,
  onToggleStatus,
}: EnrollmentDetailsProps) {
  const [showExtendMenu, setShowExtendMenu] = useState(false);
  const [showPlanMenu, setShowPlanMenu] = useState(false);

  return (
    <div className="space-y-4">
      {/* 1. Subscription Overview Card */}
      <div className="rounded-2xl bg-[#111113] border border-white/10 p-5 space-y-4 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#C9A227]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              Subscription Status
            </span>
          </div>

          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
              subscription.status === "Active"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : subscription.status === "Expiring Soon"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : subscription.status === "Cancelled"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                : "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
            }`}
          >
            {subscription.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#09090b] border border-white/5 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1.5">
              <Tag size={12} className="text-[#C9A227]" /> Plan
            </span>
            <span className="text-white font-bold text-sm block">
              {subscription.currentPlan}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#09090b] border border-white/5 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1.5">
              <Calendar size={12} className="text-[#C9A227]" /> Purchased
            </span>
            <span className="text-zinc-200 font-semibold block">
              {subscription.purchaseDate}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#09090b] border border-white/5 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1.5">
              <Clock size={12} className="text-[#C9A227]" /> Expiry Date
            </span>
            <span className="text-zinc-200 font-semibold block">
              {subscription.expiryDate}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Lifecycle Actions Controls */}
      {(onExtendSubscription || onChangePlan || onToggleStatus) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Settings size={15} className="text-[#C9A227]" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              Subscription Lifecycle Actions
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Extend Subscription */}
            {onExtendSubscription && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowExtendMenu(!showExtendMenu);
                    setShowPlanMenu(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#09090b] border border-white/10 hover:border-[#C9A227]/40 hover:bg-[#111113] text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CalendarPlus size={14} className="text-[#C9A227]" />
                    <span>Extend</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">+Days</span>
                </button>

                {showExtendMenu && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 p-2 rounded-xl bg-[#141417] border border-[#C9A227]/40 shadow-xl space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        onExtendSubscription(subscription.id, 30);
                        setShowExtendMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-white hover:bg-[#C9A227]/15 hover:text-[#C9A227] transition-colors cursor-pointer"
                    >
                      + 30 Days (1 Month)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onExtendSubscription(subscription.id, 90);
                        setShowExtendMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-white hover:bg-[#C9A227]/15 hover:text-[#C9A227] transition-colors cursor-pointer"
                    >
                      + 90 Days (3 Months)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onExtendSubscription(subscription.id, 365);
                        setShowExtendMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-white hover:bg-[#C9A227]/15 hover:text-[#C9A227] transition-colors cursor-pointer"
                    >
                      + 365 Days (1 Year)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Change Plan */}
            {onChangePlan && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowPlanMenu(!showPlanMenu);
                    setShowExtendMenu(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#09090b] border border-white/10 hover:border-[#C9A227]/40 hover:bg-[#111113] text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <RefreshCw size={14} className="text-[#C9A227]" />
                    <span>Change Plan</span>
                  </span>
                </button>

                {showPlanMenu && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 p-2 rounded-xl bg-[#141417] border border-[#C9A227]/40 shadow-xl space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        onChangePlan(subscription.id, "Monthly Plan");
                        setShowPlanMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-white hover:bg-[#C9A227]/15 hover:text-[#C9A227] flex items-center justify-between cursor-pointer"
                    >
                      <span>Monthly Plan</span>
                      {subscription.currentPlan === "Monthly Plan" && (
                        <Check size={12} className="text-[#C9A227]" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onChangePlan(subscription.id, "Yearly Plan");
                        setShowPlanMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-white hover:bg-[#C9A227]/15 hover:text-[#C9A227] flex items-center justify-between cursor-pointer"
                    >
                      <span>Yearly Plan</span>
                      {subscription.currentPlan === "Yearly Plan" && (
                        <Check size={12} className="text-[#C9A227]" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cancel / Reactivate Toggle */}
            {onToggleStatus && (
              <button
                type="button"
                onClick={() => onToggleStatus(subscription.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  subscription.status === "Cancelled"
                    ? "bg-[#09090b] border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-300"
                    : "bg-[#09090b] border-rose-500/30 hover:bg-rose-500/10 text-rose-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  {subscription.status === "Cancelled" ? (
                    <CheckCircle size={14} className="text-emerald-400" />
                  ) : (
                    <Ban size={14} className="text-rose-400" />
                  )}
                  <span>
                    {subscription.status === "Cancelled"
                      ? "Reactivate"
                      : "Cancel Pass"}
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
