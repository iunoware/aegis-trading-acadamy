"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { RotateCcw, Save, AlertCircle, CheckCircle2 } from "lucide-react";

interface StickyActionBarProps {
  hasChanges: boolean;
  onReset: () => void;
  onSave: () => void;
}

export function StickyActionBar({
  hasChanges,
  onReset,
  onSave,
}: StickyActionBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  // GSAP animation when changes status toggles
  useEffect(() => {
    if (barRef.current) {
      gsap.fromTo(
        barRef.current,
        { y: 30, opacity: 0.8 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [hasChanges]);

  return (
    <div
      ref={barRef}
      className="sticky bottom-4 z-40 w-full max-w-[1600px] mx-auto rounded-2xl bg-[#09090b]/95 backdrop-blur-2xl border border-white/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_10px_40px_rgba(0,0,0,0.9)]"
    >
      {/* Unsaved status indicator */}
      <div className="flex items-center gap-2 text-xs font-mono">
        {hasChanges ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227] animate-pulse" />
            <span className="text-white font-semibold flex items-center gap-1.5">
              <AlertCircle size={14} className="text-[#C9A227]" />
              You have unsaved changes in subscription plans
            </span>
          </>
        ) : (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-zinc-400 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              All pricing plans are up to date
            </span>
          </>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={onReset}
          disabled={!hasChanges}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            hasChanges
              ? "bg-white/5 border border-white/15 text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/30 cursor-pointer"
              : "bg-white/[0.02] border border-white/5 text-zinc-600 cursor-not-allowed"
          }`}
        >
          <RotateCcw size={14} />
          <span>Reset Changes</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={!hasChanges}
          className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-lg cursor-pointer ${
            hasChanges
              ? "bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] text-black hover:brightness-110 shadow-[0_0_20px_rgba(201,162,39,0.3)] cursor-pointer"
              : "bg-white/5 border border-white/10 text-zinc-500 cursor-not-allowed"
          }`}
        >
          <Save size={15} />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}
