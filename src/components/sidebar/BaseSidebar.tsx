"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { X, Settings } from "lucide-react";

export interface BaseSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export function BaseSidebar({
  isOpen,
  onClose,
  title = "DETAILS",
  subtitle,
  icon,
  children,
  maxWidthClass = "max-w-2xl",
}: BaseSidebarProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && backdropRef.current && drawerRef.current) {
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
  }, [isOpen]);

  if (!isOpen) return null;

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
      {/* Backdrop Overlay */}
      <div
        ref={backdropRef}
        onClick={handleClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Slide-over Drawer */}
      <aside
        ref={drawerRef}
        className={`fixed top-0 bottom-0 right-0 z-50 w-full ${maxWidthClass} bg-[#050507]/95 backdrop-blur-2xl border-l border-white/10 p-6 flex flex-col justify-between shadow-[-10px_0_40px_rgba(0,0,0,0.9)] overflow-y-auto`}
      >
        <div className="space-y-6">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
                {icon || <Settings size={16} />}
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#C9A227] font-bold uppercase tracking-widest block">
                  {title}
                </span>
                {subtitle && (
                  <h2 className="text-base font-extrabold text-white font-sans leading-none">
                    {subtitle}
                  </h2>
                )}
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

          {/* Drawer Content */}
          {children}
        </div>
      </aside>
    </div>
  );
}
