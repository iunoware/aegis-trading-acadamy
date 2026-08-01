"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  Calendar,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  BadgePercent,
  IndianRupee,
  ShieldAlert,
} from "lucide-react";
import { FeatureList, PlanFeature } from "./FeatureList";

export interface SubscriptionPlan {
  id: "monthly" | "yearly";
  name: string;
  price: number;
  billingCycle: "Monthly" | "Yearly";
  badge: "Popular" | "Best Value" | "Recommended" | "None";
  status: boolean;
  description: string;
  features: PlanFeature[];
}

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  monthlyPriceForSavings?: number; // Used by Yearly plan to calculate savings
  onChange: (updatedPlan: SubscriptionPlan) => void;
}

const BADGE_OPTIONS = ["Popular", "Best Value", "Recommended", "None"] as const;

export function SubscriptionPlanCard({
  plan,
  monthlyPriceForSavings,
  onChange,
}: SubscriptionPlanCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const savingsRef = useRef<HTMLDivElement>(null);

  // GSAP animation on load and price updates
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, []);

  // Calculate annual savings for Yearly Plan
  let savingsAmount = 0;
  let savingsPercentage = 0;
  if (plan.id === "yearly" && typeof monthlyPriceForSavings === "number") {
    const annualMonthlyCost = monthlyPriceForSavings * 12;
    savingsAmount = Math.max(0, annualMonthlyCost - plan.price);
    if (annualMonthlyCost > 0 && savingsAmount > 0) {
      savingsPercentage = Math.round((savingsAmount / annualMonthlyCost) * 100);
    }
  }

  // Animate savings banner on price changes
  useEffect(() => {
    if (savingsRef.current && plan.id === "yearly") {
      gsap.fromTo(
        savingsRef.current,
        { scale: 0.97 },
        { scale: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [plan.price, monthlyPriceForSavings, plan.id]);

  const handleFieldChange = <K extends keyof SubscriptionPlan>(
    key: K,
    value: SubscriptionPlan[K]
  ) => {
    onChange({
      ...plan,
      [key]: value,
    });
  };

  return (
    <div
      ref={cardRef}
      className={`relative rounded-2xl bg-[#111113]/90 backdrop-blur-xl border p-6 flex flex-col justify-between transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.6)] ${
        plan.status
          ? "border-white/10 hover:border-[#C9A227]/40"
          : "border-rose-500/20 bg-[#0f0b0c]/80 opacity-90"
      }`}
    >
      {/* Top Card Header: Badge & Status Toggle */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
            <Calendar size={16} />
          </div>
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-[#C9A227] uppercase">
              {plan.billingCycle} PLAN
            </span>
            {!plan.status && (
              <span className="ml-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">
                INACTIVE
              </span>
            )}
          </div>
        </div>

        {/* Status Toggle Switch */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-400">
            {plan.status ? "Active" : "Inactive"}
          </span>
          <button
            type="button"
            onClick={() => handleFieldChange("status", !plan.status)}
            aria-label={`Toggle status for ${plan.name}`}
            className="cursor-pointer text-zinc-400 hover:text-white transition-colors"
          >
            {plan.status ? (
              <ToggleRight size={32} className="text-[#C9A227]" />
            ) : (
              <ToggleLeft size={32} className="text-zinc-600" />
            )}
          </button>
        </div>
      </div>

      {/* Form Fields Grid */}
      <div className="space-y-5 my-5">
        {/* Row 1: Plan Name & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Plan Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
              Plan Name
            </label>
            <input
              type="text"
              value={plan.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              placeholder="e.g. Monthly Plan"
              className="w-full bg-[#09090b] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
            />
          </div>

          {/* Plan Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
              Plan Price (₹)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#C9A227] font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                min={0}
                value={plan.price}
                onChange={(e) =>
                  handleFieldChange("price", Math.max(0, Number(e.target.value) || 0))
                }
                placeholder="0"
                className="w-full bg-[#09090b] border border-white/15 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white font-extrabold font-mono focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Billing Cycle (Read Only) & Plan Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Billing Cycle */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
              Billing Cycle <span className="text-zinc-500">(Read Only)</span>
            </label>
            <input
              type="text"
              value={plan.billingCycle}
              readOnly
              className="w-full bg-[#09090b]/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-400 font-mono font-medium cursor-not-allowed select-none"
            />
          </div>

          {/* Plan Badge */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
              Plan Badge
            </label>
            <select
              value={plan.badge}
              onChange={(e) =>
                handleFieldChange(
                  "badge",
                  e.target.value as SubscriptionPlan["badge"]
                )
              }
              className="w-full bg-[#09090b] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all cursor-pointer"
            >
              {BADGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-[#111113] text-white">
                  {opt === "None" ? "None (No Badge)" : opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Yearly Plan Savings Extra Callout Banner */}
        {plan.id === "yearly" && (
          <div
            ref={savingsRef}
            className="p-3.5 rounded-xl bg-linear-to-r from-[#C9A227]/15 via-[#C9A227]/10 to-transparent border border-[#C9A227]/30 flex items-center justify-between shadow-inner"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C9A227]/20 border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227]">
                <BadgePercent size={18} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-semibold">
                  AUTOMATIC SAVINGS CALCULATION
                </span>
                <span className="text-xs font-bold text-white font-sans">
                  {savingsAmount > 0 ? (
                    <>
                      Customer saves{" "}
                      <span className="text-[#C9A227] font-extrabold font-mono">
                        ₹{savingsAmount.toLocaleString("en-IN")}
                      </span>{" "}
                      annually
                      {savingsPercentage > 0 && (
                        <span className="ml-1 text-[11px] font-mono font-semibold text-emerald-400">
                          ({savingsPercentage}% OFF)
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-zinc-400">
                      Set yearly price lower than 12x monthly price to show savings.
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Short Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
            Short Description
          </label>
          <textarea
            rows={2}
            value={plan.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            placeholder="e.g. Unlimited access to every course for one month."
            className="w-full bg-[#09090b] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all resize-none"
          />
        </div>

        {/* Plan Features Component */}
        <div className="pt-2">
          <FeatureList
            features={plan.features}
            onChange={(features) => handleFieldChange("features", features)}
          />
        </div>
      </div>
    </div>
  );
}
