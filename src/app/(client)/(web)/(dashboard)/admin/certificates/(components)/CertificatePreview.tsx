"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Eye, Award, Sparkles } from "lucide-react";
import { Certificate } from "./CertificatesGrid";

interface CertificatePreviewProps {
  certificate: Partial<Certificate>;
}

export function CertificatePreview({ certificate }: CertificatePreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const title = certificate.title?.trim() || "NISM Series VIII Derivatives Certification";
  const imageUrl =
    certificate.imageUrl ||
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80";
  const status = certificate.status || "Published";
  const displayOrder = certificate.displayOrder || 1;

  // Pulse animation when preview props change
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.98, opacity: 0.9 },
        { scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [certificate]);

  return (
    <div className="rounded-2xl bg-[#09090b]/90 backdrop-blur-2xl border border-white/10 p-5 space-y-4 shadow-[0_15px_35px_rgba(0,0,0,0.8)] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#C9A227]/10 blur-[60px] pointer-events-none rounded-full" />

      {/* Header Label */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
            <Eye size={13} />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C9A227]">
            PUBLIC SHOWCASE LIVE PREVIEW
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

      {/* Public Showcase Card Container */}
      <div
        ref={cardRef}
        className="rounded-2xl bg-gradient-to-b from-[#141417] to-[#0a0a0c] border border-[#C9A227]/30 p-4 space-y-3 shadow-xl relative z-10"
      >
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-white/5">
          <span className="flex items-center gap-1 text-[#C9A227] font-semibold">
            <Award size={13} />
            Verified Academy Achievement
          </span>
          <span>Pos: #{displayOrder}</span>
        </div>

        {/* Image Preview Box */}
        <div className="relative w-full h-44 rounded-xl bg-black border border-[#C9A227]/20 overflow-hidden flex items-center justify-center">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Certificate Title */}
        <h5 className="text-sm font-black text-white font-sans tracking-tight leading-snug">
          {title}
        </h5>
      </div>
    </div>
  );
}
