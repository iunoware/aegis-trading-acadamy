"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Enrollment } from "./EnrollmentsTable";
import { SubscriptionSummary } from "./SubscriptionSummary";
import { PaymentHistoryTable } from "./PaymentHistoryTable";
import { SubscriptionTimeline } from "./SubscriptionTimeline";
import { AdminNotes } from "./AdminNotes";
import {
  X,
  Settings,
  CalendarPlus,
  RefreshCw,
  Ban,
  CheckCircle,
  ShieldCheck,
  Check,
} from "lucide-react";

interface ManageSubscriptionDrawerProps {
  enrollment: Enrollment | null;
  onClose: () => void;
  onExtendSubscription: (enrollmentId: string, days: number) => void;
  onChangePlan: (enrollmentId: string, newPlan: "Monthly Plan" | "Yearly Plan") => void;
  onToggleStatus: (enrollmentId: string) => void;
  onSaveNotes: (enrollmentId: string, notes: string) => void;
}

export function ManageSubscriptionDrawer({
  enrollment,
  onClose,
  onExtendSubscription,
  onChangePlan,
  onToggleStatus,
  onSaveNotes,
}: ManageSubscriptionDrawerProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const [showExtendMenu, setShowExtendMenu] = useState(false);
  const [showPlanMenu, setShowPlanMenu] = useState(false);

  useEffect(() => {
    if (enrollment && backdropRef.current && drawerRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        drawerRef.current,
        { x: "100%" },
        { x: "0%", duration: 0.4, ease: "power2.out" }
      );
    }
  }, [enrollment]);

  if (!enrollment) return null;

  const handleClose = () => {
    if (backdropRef.current && drawerRef.current) {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.25 });
      gsap.to(drawerRef.current, {
        x: "100%",
        duration: 0.3,
        ease: "power2.in",
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Slide-over Drawer */}
      <aside
        ref={drawerRef}
        className="fixed top-0 bottom-0 right-0 z-50 w-full max-w-2xl bg-[#050507]/95 backdrop-blur-2xl border-l border-white/10 p-6 flex flex-col justify-between shadow-[-10px_0_40px_rgba(0,0,0,0.9)] overflow-y-auto"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
                <Settings size={16} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#C9A227] font-bold uppercase tracking-widest block">
                  MANAGE SUBSCRIPTION LIFECYCLE
                </span>
                <h2 className="text-base font-extrabold text-white font-sans leading-none">
                  {enrollment.userName}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* User Summary & Current Subscription Details */}
          <SubscriptionSummary enrollment={enrollment} />

          {/* Admin Actions Panel */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings size={15} className="text-[#C9A227]" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                Subscription Lifecycle Actions
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Extend Subscription Dropdown */}
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
                        onExtendSubscription(enrollment.id, 30);
                        setShowExtendMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-white hover:bg-[#C9A227]/15 hover:text-[#C9A227] transition-colors cursor-pointer"
                    >
                      + 30 Days (1 Month)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onExtendSubscription(enrollment.id, 90);
                        setShowExtendMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-white hover:bg-[#C9A227]/15 hover:text-[#C9A227] transition-colors cursor-pointer"
                    >
                      + 90 Days (3 Months)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onExtendSubscription(enrollment.id, 365);
                        setShowExtendMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-white hover:bg-[#C9A227]/15 hover:text-[#C9A227] transition-colors cursor-pointer"
                    >
                      + 365 Days (1 Year)
                    </button>
                  </div>
                )}
              </div>

              {/* Change Plan Dropdown */}
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
                        onChangePlan(enrollment.id, "Monthly Plan");
                        setShowPlanMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-white hover:bg-[#C9A227]/15 hover:text-[#C9A227] flex items-center justify-between cursor-pointer"
                    >
                      <span>Monthly Plan</span>
                      {enrollment.currentPlan === "Monthly Plan" && (
                        <Check size={12} className="text-[#C9A227]" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onChangePlan(enrollment.id, "Yearly Plan");
                        setShowPlanMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-white hover:bg-[#C9A227]/15 hover:text-[#C9A227] flex items-center justify-between cursor-pointer"
                    >
                      <span>Yearly Plan</span>
                      {enrollment.currentPlan === "Yearly Plan" && (
                        <Check size={12} className="text-[#C9A227]" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Cancel / Reactivate Toggle */}
              <button
                type="button"
                onClick={() => onToggleStatus(enrollment.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  enrollment.status === "Cancelled"
                    ? "bg-[#09090b] border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-300"
                    : "bg-[#09090b] border-rose-500/30 hover:bg-rose-500/10 text-rose-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  {enrollment.status === "Cancelled" ? (
                    <CheckCircle size={14} className="text-emerald-400" />
                  ) : (
                    <Ban size={14} className="text-rose-400" />
                  )}
                  <span>
                    {enrollment.status === "Cancelled" ? "Reactivate" : "Cancel Pass"}
                  </span>
                </span>
              </button>
            </div>
          </div>

          {/* Payment History */}
          <PaymentHistoryTable payments={enrollment.paymentHistory} />

          {/* Subscription Timeline */}
          <SubscriptionTimeline timeline={enrollment.subscriptionTimeline} />

          {/* Admin Internal Notes */}
          <AdminNotes
            initialNotes={enrollment.adminNotes}
            onSaveNotes={(notes) => onSaveNotes(enrollment.id, notes)}
          />
        </div>
      </aside>
    </div>
  );
}
