"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { toast } from "sonner";
import { PricingHeader } from "./(components)/PricingHeader";
import {
  SubscriptionPlanCard,
  SubscriptionPlan,
} from "./(components)/SubscriptionPlanCard";
import { StickyActionBar } from "./(components)/StickyActionBar";

export interface PricingState {
  monthly: SubscriptionPlan;
  yearly: SubscriptionPlan;
}

const INITIAL_PRICING_STATE: PricingState = {
  monthly: {
    id: "monthly",
    name: "Monthly Pass",
    price: 999,
    billingCycle: "Monthly",
    badge: "Popular",
    status: true,
    description: "Unlimited access to every course for one month.",
    features: [
      { id: "feat-m1", text: "Unlimited Course Access" },
      { id: "feat-m2", text: "Watch Anytime on Any Device" },
      { id: "feat-m3", text: "Community Access" },
      { id: "feat-m4", text: "Verified Certificates" },
    ],
  },
  yearly: {
    id: "yearly",
    name: "Yearly Pass",
    price: 7999,
    billingCycle: "Yearly",
    badge: "Best Value",
    status: true,
    description:
      "Unlimited access to every course for a full year with maximum savings.",
    features: [
      { id: "feat-y1", text: "Unlimited Course Access" },
      { id: "feat-y2", text: "Watch Anytime on Any Device" },
      { id: "feat-y3", text: "Community Access" },
      { id: "feat-y4", text: "Verified Certificates" },
      { id: "feat-y5", text: "Priority 1-on-1 Mentor Support" },
    ],
  },
};

export default function PricingManagementPage() {
  const [pricingState, setPricingState] = useState<PricingState>(
    INITIAL_PRICING_STATE,
  );
  const [savedState, setSavedState] = useState<PricingState>(
    INITIAL_PRICING_STATE,
  );
  const pageRef = useRef<HTMLDivElement>(null);

  // GSAP Page Entrance Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (pageRef.current) {
        gsap.fromTo(
          pageRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out",
          },
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Check if state has unsaved changes compared to savedState
  const hasChanges =
    JSON.stringify(pricingState) !== JSON.stringify(savedState);

  const handleSave = () => {
    if (!hasChanges) return;
    setSavedState(pricingState);
    toast.success("Pricing changes saved successfully!", {
      description: "Monthly and Yearly subscription plans updated.",
    });
  };

  const handleReset = () => {
    if (!hasChanges) return;
    setPricingState(savedState);
    toast.info("Changes reset to last saved state.");
  };

  return (
    <div
      ref={pageRef}
      aria-label="Pricing Management Page"
      className="w-full max-w-[1600px] mx-auto space-y-8 pb-20"
    >
      {/* 1. Header */}
      <PricingHeader hasChanges={hasChanges} onSave={handleSave} />

      <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
        <span>Subscription Plans</span>
        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30">
          2 Plans Total
        </span>
      </h2>
      {/* 3. Main Content: Plans on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Monthly & Yearly Plan Editors (7 Cols) */}
        <div className="lg:col-span-6 space-y-8">
          {/* Monthly Plan Card */}
          <SubscriptionPlanCard
            plan={pricingState.monthly}
            onChange={(updatedMonthly) =>
              setPricingState((prev) => ({
                ...prev,
                monthly: updatedMonthly,
              }))
            }
          />
        </div>

        {/* Right Column: Live Preview Card (5 Cols) */}
        <div className="lg:col-span-6">
          {/* <PricingPreview
            monthlyPlan={pricingState.monthly}
            yearlyPlan={pricingState.yearly}
          /> */}
          {/* Yearly Plan Card */}
          <SubscriptionPlanCard
            plan={pricingState.yearly}
            monthlyPriceForSavings={pricingState.monthly.price}
            onChange={(updatedYearly) =>
              setPricingState((prev) => ({ ...prev, yearly: updatedYearly }))
            }
          />
        </div>
      </div>

      {/* 4. Sticky Bottom Action Bar */}
      <StickyActionBar
        hasChanges={hasChanges}
        onReset={handleReset}
        onSave={handleSave}
      />
    </div>
  );
}
