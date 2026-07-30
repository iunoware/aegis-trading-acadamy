"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MarketInstrument } from "@/lib/market/market.types";

interface MarketTickerItemProps {
  item: MarketInstrument;
}

export const MarketTickerItem: React.FC<MarketTickerItemProps> = React.memo(
  function MarketTickerItem({ item }) {
    const { symbol, price, changePercent, direction, icon } = item;
    const priceRef = useRef<HTMLSpanElement>(null);
    const prevPriceRef = useRef<string>(price);

    // Subtle value update animation when price changes
    useEffect(() => {
      if (prevPriceRef.current !== price && priceRef.current) {
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        if (!prefersReducedMotion) {
          gsap.fromTo(
            priceRef.current,
            { scale: 1.15, color: direction === "up" ? "#34d399" : "#f87171" },
            { scale: 1, color: "#d4af37", duration: 0.6, ease: "power2.out" }
          );
        }
        prevPriceRef.current = price;
      }
    }, [price, direction]);

    const isUp = direction === "up";

    return (
      <div className="inline-flex items-center gap-2.5 text-xs sm:text-sm select-none font-mono whitespace-nowrap px-1">
        {/* Optional Icon / Badge */}
        {icon && <span className="text-sm">{icon}</span>}

        {/* Symbol */}
        <span className="text-white font-bold font-sans tracking-wide">
          {symbol}
        </span>

        {/* Price (Gold) */}
        <span
          ref={priceRef}
          className="text-[var(--primary)] font-bold tracking-tight font-mono transition-colors duration-300"
        >
          {price}
        </span>

        {/* Percentage + Arrow */}
        <span
          className={`inline-flex items-center gap-0.5 font-semibold text-xs px-1.5 py-0.5 rounded ${
            isUp
              ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
              : "text-rose-400 bg-rose-500/10 border border-rose-500/20"
          }`}
          aria-label={`${symbol} price ${isUp ? "up" : "down"} ${changePercent}`}
        >
          <span>{isUp ? "▲" : "▼"}</span>
          <span>{changePercent}</span>
        </span>

        {/* Luxury Gold Bullet Separator */}
        <span className="text-[var(--primary)]/50 font-bold ml-6 sm:ml-8" aria-hidden="true">
          •
        </span>
      </div>
    );
  }
);
