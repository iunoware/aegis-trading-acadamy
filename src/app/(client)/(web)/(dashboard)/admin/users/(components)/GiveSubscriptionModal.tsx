"use client";

import React, { useState, useEffect } from "react";
import { X, ShieldCheck, CheckCircle2, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { User } from "./UsersTable";
import {
  getSubscriptionPlans,
  grantUserSubscription,
  SubscriptionPlanItem,
} from "@/lib/services/users.service";
import { formatJoinedDate } from "@/lib/user-transform";

interface GiveSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: (updatedUser: User) => void;
}

export function GiveSubscriptionModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: GiveSubscriptionModalProps) {
  const [plans, setPlans] = useState<SubscriptionPlanItem[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const res = await getSubscriptionPlans();
        if (res.success && Array.isArray(res.plans)) {
          setPlans(res.plans);
          if (res.plans.length > 0) {
            // Pre-select user's current plan if changing, otherwise select first available plan
            const matchingPlan = user?.activeSubscription
              ? res.plans.find((p) => p.id === user.activeSubscription?.planId)
              : null;
            setSelectedPlanId(matchingPlan ? matchingPlan.id : res.plans[0].id);
          }
        } else {
          toast.error(res.message || "Failed to load subscription plans");
        }
      } catch (err: any) {
        console.error("Error fetching subscription plans:", err);
        toast.error("Failed to load subscription plans");
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const isChangingPlan = Boolean(user.activeSubscription);

  // Calculate Start and End Dates based on selected plan's durationMonths
  const today = new Date();
  const startDateStr = formatJoinedDate(today);

  const calculateEndDate = () => {
    if (!selectedPlan) return "N/A";
    const exp = new Date(today);
    exp.setMonth(exp.getMonth() + (selectedPlan.durationMonths || 1));
    return formatJoinedDate(exp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) {
      toast.error("Please select a subscription plan");
      return;
    }

    setSubmitting(true);
    try {
      const res = await grantUserSubscription(user.id, selectedPlanId);
      if (res.success && res.user) {
        toast.success(
          res.message ||
            `${selectedPlan?.name || "Subscription"} granted successfully to ${user.name}!`,
        );
        onSuccess(res.user);
        onClose();
      } else {
        toast.error(res.message || "Failed to grant subscription");
      }
    } catch (err: any) {
      console.error("Grant subscription error:", err);
      toast.error(err?.response?.data?.message || "Failed to grant subscription");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121214] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5 bg-[#17171a]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C9A227]/30 bg-[#C9A227]/10 text-[#C9A227]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isChangingPlan ? "Change Subscription Plan" : "Give Subscription"}
              </h2>
              <p className="text-xs text-zinc-400">
                Grant manual access to{" "}
                <span className="text-white font-medium">{user.name}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {loadingPlans ? (
            <div className="py-12 text-center text-zinc-400 space-y-3">
              <Loader2 size={24} className="animate-spin mx-auto text-[#C9A227]" />
              <p className="text-xs font-mono">Loading active subscription plans...</p>
            </div>
          ) : (
            <>
              {/* Select Plan Section */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Select Plan
                </label>

                <div className="space-y-2.5">
                  {plans.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#C9A227] bg-[#C9A227]/10 shadow-[0_0_15px_rgba(201,162,39,0.15)]"
                            : "border-white/10 bg-[#0a0a0c] hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {isSelected ? (
                              <CheckCircle2 size={18} className="text-[#C9A227]" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-zinc-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">
                                {plan.name}
                              </span>
                              {plan.badge && (
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#C9A227]/20 text-[#C9A227]">
                                  {plan.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">
                              Duration: {plan.durationMonths}{" "}
                              {plan.durationMonths === 1 ? "Month" : "Months"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-extrabold text-white">
                            {plan.currency === "INR" || !plan.currency ? "$" : "$"}
                            {plan.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Validity Information */}
              <div className="rounded-xl border border-white/10 bg-[#09090b] p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C9A227]">
                  <Calendar size={14} />
                  <span>Subscription Validity</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">
                      Start Date
                    </span>
                    <span className="text-white font-semibold">{startDateStr}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">
                      End Date
                    </span>
                    <span className="text-[#C9A227] font-semibold">
                      {calculateEndDate()}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingPlans || !selectedPlanId}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#B38F1F] text-xs font-bold text-black shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{isChangingPlan ? "Update Subscription" : "Give Access"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
