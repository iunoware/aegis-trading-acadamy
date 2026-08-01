"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Star, Quote, Eye, Sparkles } from "lucide-react";
import { Testimonial } from "./TestimonialsGrid";

interface TestimonialPreviewProps {
  testimonial: Partial<Testimonial>;
}

export function TestimonialPreview({ testimonial }: TestimonialPreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const name = testimonial.customerName?.trim() || "Aarav Sharma";
  const designation = testimonial.designation?.trim() || "Full-Time Options Trader";
  const company = testimonial.company?.trim() || "Equity Alpha Capital";
  const rating = testimonial.rating || 5;
  const reviewText =
    testimonial.reviewText?.trim() ||
    "Aegis Trading Academy completely transformed my risk management and order flow strategy. The mentorship and structure are unmatched in the Indian trading space!";
  const status = testimonial.status || "Published";
  const avatarUrl = testimonial.avatarUrl;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Pulse animation when preview props update
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.98, opacity: 0.9 },
        { scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [testimonial]);

  return (
    <div className="rounded-2xl bg-[#09090b]/90 backdrop-blur-2xl border border-white/10 p-5 space-y-4 shadow-[0_15px_35px_rgba(0,0,0,0.8)] relative overflow-hidden">
      {/* Background Gold Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#C9A227]/10 blur-[60px] pointer-events-none rounded-full" />

      {/* Header Label */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
            <Eye size={13} />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C9A227]">
            PUBLIC WEBSITE LIVE PREVIEW
          </span>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            status === "Published"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-zinc-500/15 text-zinc-400 border border-zinc-500/30"
          }`}
        >
          {status === "Published" ? "Live Preview" : "Hidden Preview"}
        </span>
      </div>

      {/* Public Card Container */}
      <div
        ref={cardRef}
        className="rounded-2xl bg-gradient-to-b from-[#141417] to-[#0a0a0c] border border-[#C9A227]/30 p-5 space-y-4 shadow-xl relative z-10"
      >
        {/* Top Quotes & Stars Row */}
        <div className="flex items-center justify-between">
          <Quote size={24} className="text-[#C9A227] opacity-80" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < rating
                    ? "text-[#C9A227] fill-[#C9A227]"
                    : "text-zinc-700 fill-zinc-900"
                }
              />
            ))}
          </div>
        </div>

        {/* Review Content */}
        <p className="text-xs text-zinc-200 leading-relaxed font-sans min-h-[56px] italic">
          &ldquo;{reviewText}&rdquo;
        </p>

        {/* Author Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-10 h-10 rounded-full object-cover border border-[#C9A227]/50 shadow-md shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#e6c55a]/20 to-[#C9A227]/30 border border-[#C9A227]/50 flex items-center justify-center text-[#C9A227] font-bold text-xs shrink-0 shadow-inner">
              {initials}
            </div>
          )}

          <div className="overflow-hidden">
            <h5 className="text-xs font-bold text-white font-sans truncate">
              {name}
            </h5>
            <span className="text-[10px] font-mono text-[#C9A227] truncate block">
              {designation}
              {designation && company ? " • " : ""}
              {company}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
