"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useMarketTicker } from "@/hooks/useMarketTicker";
import { MarketTickerItem } from "./MarketTickerItem";

export default function MarketTicker() {
  const { instruments } = useMarketTicker();
  const tickerContainerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  //Marquee Loop
  useEffect(() => {
    const track = trackRef.current;
    if (!track || instruments.length === 0) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      if (tweenRef.current) tweenRef.current.pause();
      return;
    }

    // Measure half track width for 100% seamless x-translation loop
    const halfWidth = track.scrollWidth / 2;

    if (tweenRef.current) {
      tweenRef.current.kill();
    }

    tweenRef.current = gsap.to(track, {
      x: `-=${halfWidth}`,
      duration: 35,
      ease: "none",
      repeat: -1,
      overwrite: "auto",
    });

    return () => {
      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }
    };
  }, [instruments.length]);

  const handleMouseEnter = () => {
    if (tweenRef.current) tweenRef.current.pause();
  };

  const handleMouseLeave = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (tweenRef.current && !prefersReducedMotion) {
      tweenRef.current.play();
    }
  };

  if (instruments.length === 0) return null;

  // Duplicate items twice to guarantee seamless infinite loop
  const duplicatedItems = [...instruments, ...instruments];

  return (
    <section
      aria-label="Live Financial Market Ticker"
      className="relative w-full z-40 bg-[#090909]/90 backdrop-blur-md border-y border-(--primary)/20 py-3 overflow-hidden select-none"
    >
      <div
        ref={tickerContainerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full overflow-hidden flex items-center"
      >
        <div
          ref={trackRef}
          className="flex items-center whitespace-nowrap transform-gpu"
        >
          {duplicatedItems.map((item, idx) => (
            <MarketTickerItem key={`${item.id}-${idx}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
