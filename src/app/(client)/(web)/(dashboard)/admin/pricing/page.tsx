/* eslint-disable react-hooks/immutability */
"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";
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

interface PricingApiResponse {
  success: boolean;
  message: string;
  data: {
    monthly: SubscriptionPlan | null;
    yearly: SubscriptionPlan | null;
  };
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
    description: "Unlimited access to every course for a full year with maximum savings.",
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
  const [pricingState, setPricingState] = useState<PricingState>(INITIAL_PRICING_STATE);

  const [savedState, setSavedState] = useState<PricingState>(INITIAL_PRICING_STATE);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!pageRef.current) return;

      gsap.fromTo(
        pageRef.current.children,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out",
        },
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    fetchPricing();
  }, []);

  async function fetchPricing() {
    try {
      setIsLoading(true);

      const response = await axios.get<PricingApiResponse>("/api/admin/pricing");

      const monthly = response.data.data.monthly;
      const yearly = response.data.data.yearly;

      /*
       * The plans may not exist in the database yet.
       * In that case, use the initial frontend values.
       */
      const fetchedPricing: PricingState = {
        monthly: monthly ?? INITIAL_PRICING_STATE.monthly,
        yearly: yearly ?? INITIAL_PRICING_STATE.yearly,
      };

      setPricingState(fetchedPricing);
      setSavedState(fetchedPricing);
    } catch (error) {
      console.error("Failed to fetch pricing:", error);

      toast.error("Failed to fetch pricing plans", {
        description: "The default pricing values are being displayed.",
      });

      setPricingState(INITIAL_PRICING_STATE);
      setSavedState(INITIAL_PRICING_STATE);
    } finally {
      setIsLoading(false);
    }
  }

  const hasChanges = JSON.stringify(pricingState) !== JSON.stringify(savedState);

  async function handleSave() {
    if (!hasChanges || isSaving) return;

    try {
      setIsSaving(true);

      const response = await axios.put<PricingApiResponse>(
        "/api/admin/pricing",
        pricingState,
      );

      const monthly = response.data.data.monthly;
      const yearly = response.data.data.yearly;

      if (!monthly || !yearly) {
        throw new Error("Updated pricing data was not returned.");
      }

      const updatedPricing: PricingState = {
        monthly,
        yearly,
      };

      setPricingState(updatedPricing);
      setSavedState(updatedPricing);

      toast.success("Pricing changes saved successfully!", {
        description: "Monthly and yearly subscription plans were updated.",
      });
    } catch (error) {
      console.error("Failed to save pricing:", error);

      if (axios.isAxiosError(error)) {
        toast.error("Failed to save pricing changes", {
          description:
            error.response?.data?.message ??
            "Something went wrong while updating the pricing plans.",
        });

        return;
      }

      toast.error("Failed to save pricing changes");
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    if (!hasChanges || isSaving) return;

    setPricingState(savedState);

    toast.info("Changes reset to the last saved state.");
  }

  if (isLoading) {
    return (
      <div className="flex min-h-125 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#C9A227]" />

          <p className="text-sm text-zinc-400">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={pageRef}
      aria-label="Pricing Management Page"
      className="mx-auto w-full max-w-[1600px] space-y-8 pb-20"
    >
      <PricingHeader hasChanges={hasChanges && !isSaving} onSave={handleSave} />

      <h2 className="flex items-center gap-2 font-sans text-lg font-bold text-white">
        <span>Subscription Plans</span>

        <span className="rounded-full border border-[#C9A227]/30 bg-[#C9A227]/10 px-2.5 py-0.5 font-mono text-xs text-[#C9A227]">
          2 Plans Total
        </span>
      </h2>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-6">
          <SubscriptionPlanCard
            plan={pricingState.monthly}
            onChange={(updatedMonthly) => {
              setPricingState((previousState) => ({
                ...previousState,
                monthly: updatedMonthly,
              }));
            }}
          />
        </div>

        <div className="lg:col-span-6">
          <SubscriptionPlanCard
            plan={pricingState.yearly}
            monthlyPriceForSavings={pricingState.monthly.price}
            onChange={(updatedYearly) => {
              setPricingState((previousState) => ({
                ...previousState,
                yearly: updatedYearly,
              }));
            }}
          />
        </div>
      </div>

      <StickyActionBar
        hasChanges={hasChanges && !isSaving}
        onReset={handleReset}
        onSave={handleSave}
      />

      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#111113] px-5 py-4 shadow-2xl">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[#C9A227]" />

            <span className="text-sm font-medium text-white">
              Saving pricing changes...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
