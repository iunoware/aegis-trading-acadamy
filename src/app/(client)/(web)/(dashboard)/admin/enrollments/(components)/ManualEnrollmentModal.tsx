"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Plus, X, ShieldCheck } from "lucide-react";
import { Enrollment } from "./EnrollmentsTable";

interface ManualEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (enrollment: Enrollment) => void;
}

export function ManualEnrollmentModal({
  isOpen,
  onClose,
  onEnroll,
}: ManualEnrollmentModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [plan, setPlan] = useState<"Monthly Plan" | "Yearly Plan">("Monthly Plan");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (isOpen && backdropRef.current && modalRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        modalRef.current,
        { scale: 0.95, opacity: 0, y: 10 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail) return;

    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const expDate = new Date();
    if (plan === "Yearly Plan") {
      expDate.setFullYear(expDate.getFullYear() + 1);
    } else {
      expDate.setMonth(expDate.getMonth() + 1);
    }

    const expiryStr = expDate.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const newEnrollment: Enrollment = {
      id: `enr-${Date.now()}`,
      userName: userName.trim(),
      userEmail: userEmail.trim(),
      userPhone: userPhone.trim() || "+91 98765 43210",
      currentPlan: plan,
      purchaseDate: todayStr,
      expiryDate: expiryStr,
      status: "Active",
      adminNotes: adminNotes.trim() || "Manual offline enrollment granted by admin.",
      paymentHistory: [
        {
          id: `pay-${Date.now()}`,
          plan,
          amount: plan === "Yearly Plan" ? "₹7,999" : "₹999",
          purchaseDate: todayStr,
          status: "Paid",
          transactionId: `MANUAL-${Math.floor(100000 + Math.random() * 900000)}`,
        },
      ],
      subscriptionTimeline: [
        {
          id: `tl-1-${Date.now()}`,
          action: `Manual Enrollment (${plan})`,
          date: todayStr,
          details: `Enrolled manually by admin pass (${plan === "Yearly Plan" ? "₹7,999" : "₹999"}).`,
          type: "purchase",
        },
      ],
    };

    onEnroll(newEnrollment);
    setUserName("");
    setUserEmail("");
    setUserPhone("");
    setAdminNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-2xl bg-[#09090b] border border-white/15 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-10 space-y-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
              <Plus size={16} />
            </div>
            <h3 className="text-base font-extrabold text-white font-sans">
              Manual Enrollment
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
              User Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aarav Sharma"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
              User Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. aarav@gmail.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
              User Phone Number
            </label>
            <input
              type="text"
              placeholder="e.g. +91 98765 43210"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
              Subscription Plan
            </label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as "Monthly Plan" | "Yearly Plan")}
              className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all cursor-pointer"
            >
              <option value="Monthly Plan" className="bg-[#111113]">
                Monthly Plan (₹999/mo)
              </option>
              <option value="Yearly Plan" className="bg-[#111113]">
                Yearly Plan (₹7,999/yr)
              </option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
              Admin Internal Notes
            </label>
            <textarea
              rows={2}
              placeholder="Reason for manual enrollment..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full bg-[#111113] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] text-black hover:brightness-110 shadow-md transition-all cursor-pointer"
            >
              Grant Enrollment Pass
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
