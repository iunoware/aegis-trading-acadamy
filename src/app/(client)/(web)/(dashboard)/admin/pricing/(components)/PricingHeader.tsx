/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useRef } from "react";
import { BadgeIndianRupee, Save, ShieldCheck } from "lucide-react";
import { gsap } from "gsap";

interface PricingHeaderProps {
  hasChanges: boolean;
  onSave: () => void;
}

export function PricingHeader({ hasChanges, onSave }: PricingHeaderProps) {
  const saveBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (saveBtnRef.current && hasChanges) {
      gsap.to(saveBtnRef.current, {
        scale: 1.03,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
      });
    }
  }, [hasChanges]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 text-[11px] font-mono uppercase tracking-widest text-[#C9A227] mb-2">
          <BadgeIndianRupee size={13} />
          SUBSCRIPTION CONTROL
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
          Pricing Management
        </h1>
        <p className="text-sm text-zinc-400 mt-1 font-normal">
          Manage your academy subscription plans and pricing.
        </p>
      </div>

      {/* <div className="flex items-center gap-3">
        <button
          ref={saveBtnRef}
          onClick={onSave}
          disabled={!hasChanges}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-lg cursor-pointer ${
            hasChanges
              ? "bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] text-black hover:brightness-110 shadow-[0_0_20px_rgba(201,162,39,0.3)] cursor-pointer"
              : "bg-white/5 border border-white/10 text-zinc-500 cursor-not-allowed"
          }`}
        >
          <Save size={15} />
          <span>Save Changes</span>
        </button>
      </div> */}
    </div>
  );
}
