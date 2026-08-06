/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { X, Award, Maximize2 } from "lucide-react";
import { Certificate } from "./CertificatesGrid";

interface CertificateImageLightboxProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export function CertificateImageLightbox({
  certificate,
  onClose,
}: CertificateImageLightboxProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (certificate && backdropRef.current && modalRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );
      gsap.fromTo(
        modalRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [certificate]);

  if (!certificate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative z-10 max-w-3xl w-full bg-[#0a0a0c] border border-[#C9A227]/40 rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] space-y-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#111113]">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-[#C9A227]" />
            <h3 className="text-sm font-bold text-white font-sans truncate">
              {certificate.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* High Res Image Showcase */}
        <div className="p-6 bg-[#050505] flex items-center justify-center min-h-75">
          <img
            src={certificate.imageUrl}
            alt={certificate.title}
            className="max-h-[70vh] w-auto object-contain rounded-xl border border-white/10 shadow-2xl"
          />
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-[#111113] border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>Display Order: #{certificate.displayOrder}</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              certificate.status === "Published"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-zinc-500/15 text-zinc-400 border border-zinc-500/30"
            }`}
          >
            {certificate.status}
          </span>
        </div>
      </div>
    </div>
  );
}
