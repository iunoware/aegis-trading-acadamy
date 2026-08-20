"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
// import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Market ticker data for bottom edge bar
// const TICKER_ITEMS = [
//   { symbol: "BTC/USD", price: "$96,450.00", change: "+4.25%", isUp: true },
//   { symbol: "NIFTY 50", price: "24,350.80", change: "+1.15%", isUp: true },
//   { symbol: "BANK NIFTY", price: "52,180.50", change: "+0.85%", isUp: true },
//   { symbol: "GOLD (XAU)", price: "$2,745.50", change: "+1.48%", isUp: true },
//   { symbol: "EUR/USD", price: "1.0845", change: "+0.32%", isUp: true },
//   { symbol: "S&P 500", price: "5,864.20", change: "+0.62%", isUp: true },
// ];

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const leftTextRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Video Playback Control via IntersectionObserver

  useEffect(() => {
    const video = videoRef.current;
    const hero = heroRef.current;
    if (!video || !hero) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (video.paused) {
              video.play().catch(() => {});
            }
          } else {
            if (!video.paused) {
              video.pause();
            }
          }
        });
      },
      { threshold: 0.15 },
    );

    observer.observe(hero);

    return () => {
      observer.disconnect();
    };
  }, []);

  // GSAP Animations with gsap.context()

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set([logoRef.current, leftTextRef.current, buttonRef.current], {
          opacity: 1,
          scale: 1,
          y: 0,
        });
        return;
      }

      // Initial state
      gsap.set(logoRef.current, { opacity: 0, scale: 0.82 });
      gsap.set(leftTextRef.current, { opacity: 0, y: 30 });
      gsap.set(buttonRef.current, { opacity: 0, y: 20, scale: 0.95 });

      // 1. Video subtle zoom-out on load
      if (videoRef.current) {
        gsap.fromTo(
          videoRef.current,
          { scale: 1.12 },
          { scale: 1, duration: 2.2, ease: "power2.out" },
        );
      }

      // 2. Timeline Sequence
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 0.2,
      });

      // Logo fade & scale
      tl.to(logoRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1.1,
        ease: "back.out(1.2)",
      })
        // Left text fade up
        .to(
          leftTextRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
          },
          "-=0.6",
        )
        // Right button fade in
        .to(
          buttonRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
          },
          "-=0.5",
        );

      // 3. Gentle floating motion on logo
      if (logoRef.current) {
        gsap.to(logoRef.current, {
          y: "-=8",
          duration: 3.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1.3,
        });
      }

      // 4. Subtle pulse on background gold radial glow
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.65,
          scale: 1.1,
          duration: 4.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, heroRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      aria-label="Aegis Trading Academy Hero"
      className="relative w-full h-screen overflow-hidden bg-background text-white flex flex-col justify-between "
    >
      {/* VIDEO BACKGROUND */}

      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          className="w-full h-full object-cover transform-gpu"
          autoPlay
          muted
          playsInline
          preload="auto"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      </div>

      {/* BACKGROUND OVERLAYS */}

      {/* 1. Dark Overlay (rgba(0,0,0,0.55)) */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.25)" }}
      />

      {/* 2. Subtle Vignette */}
      <div
        className="absolute inset-0 z-15 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, transparent 15%, rgba(0, 0, 0, 0.8) 100%)",
        }}
      />

      {/* 3. Soft Gold Radial Glow centered behind logo */}
      <div
        ref={glowRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-162.5 h-162.5 rounded-full gold-radial-glow z-20 pointer-events-none opacity-35 blur-3xl transform-gpu"
      />

      {/* MAIN VIEWPORT CONTENT (100vh composition) */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grow flex items-center justify-between pointer-events-none">
        {/* Desktop Layout: Left Text, Center Logo, Right CTA */}
        <div className="w-full h-full flex flex-col md:flex-row items-center justify-between pt-16 pb-12">
          {/* LEFT SIDE: Compact Brand & Tagline */}
          {/* <div
            ref={leftTextRef}
            className="pointer-events-auto text-center md:text-left flex flex-col items-center md:items-start max-w-sm lg:max-w-md z-30 mb-6 md:mb-0"
          >
            <span className="text-xs sm:text-lg font-mono tracking-[0.25em] text-primary font-semibold uppercase mb-1.5 block">
              WELCOME TO
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans mb-3">
              Aegis Trading <br />
              <span className="gold-gradient-text">Academy</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
              Shaping disciplined traders for real market conditions.
            </p>
          </div> */}

          {/* dummy div */}
          <div></div>

          {/* RIGHT BOTTOM: Single CTA Button */}
          <div
            ref={buttonRef}
            className="pointer-events-auto flex justify-center md:justify-end w-full md:w-auto md:self-end mb-4 md:mb-8 z-30"
          >
            <Link
              href="/courses"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-sm sm:text-base tracking-wide bg-linear-to-r from-primary-light via-primary to-primary-dark text-black shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_40px_rgba(212,175,55,0.55)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Start Now</span>
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            {/* <a
              href="https://nowpayments.io/payment/?iid=5652962896&source=button"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Image
                src="https://nowpayments.io/images/embeds/payment-button-black.svg"
                alt="Crypto payment button by NOWPayments"
                width={36}
                height={36}
                className="object-contain"
              />
              
            </a> */}
          </div>
        </div>
      </div>

      {/* BOTTOM EDGE MARKET TICKER (Visually terminates Hero at bottom) */}

      {/* <div className="relative z-30 w-full bg-[#0d0d0d]/80 backdrop-blur-md border-t border-(--primary)/20 py-2.5 px-4 overflow-hidden">
        <div className="flex items-center space-x-8 animate-marquee whitespace-nowrap">
          {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, idx) => (
            <div
              key={`${item.symbol}-${idx}`}
              className="inline-flex items-center gap-2.5 text-xs font-mono"
            >
              <span className="text-muted font-semibold uppercase">
                {item.symbol}
              </span>
              <span className="text-white font-bold">{item.price}</span>
              <span className="text-primary font-medium inline-flex items-center gap-0.5">
                <TrendingUp size={12} />
                {item.change}
              </span>
              <span className="text-zinc-700 ml-4">•</span>
            </div>
          ))}
        </div>
      </div> */}
    </section>
  );
}
