"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, Check, ArrowRight, MessageSquare } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TRUST_BADGES = [
  "Structured Curriculum",
  "Expert Mentor Guidance",
  "Community Access",
  "Certificate of Completion",
];

// Faint floating particles for luxury background ambiance
const PARTICLES = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  x: (i * 8.5 + 3) % 100,
  y: (i * 11 + 7) % 100,
  size: (i % 3) + 2,
  duration: 7 + (i % 5) * 2,
  delay: (i % 4) * 0.6,
}));

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const badgeItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const particlesRef = useRef<(HTMLDivElement | null)[]>([]);
  const scrollDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Slow Breathing Animation on Background Radial Glow (Scale 1 -> 1.08 -> 1 over 8s)
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          scale: 1.08,
          opacity: 0.25,
          duration: 8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // 2. Background Floating Particles
      particlesRef.current.forEach((particleEl, index) => {
        if (!particleEl) return;
        const pData = PARTICLES[index];
        if (!pData) return;

        gsap.to(particleEl, {
          y: "-=25",
          opacity: 0.15,
          duration: pData.duration,
          delay: pData.delay,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      // 3. Sequential Entrance Timeline
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // Label Entrance
      if (labelRef.current) {
        tl.fromTo(
          labelRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7 },
        );
      }

      // Main Heading (opacity: 0 -> 1, y: 50 -> 0, duration: 1s, ease: power3.out)
      if (headingRef.current) {
        tl.fromTo(
          headingRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
          "-=0.4",
        );
      }

      // Subtitle (Fade in after heading, delay: 0.2s)
      if (subtitleRef.current) {
        tl.fromTo(
          subtitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.6",
        );
      }

      // Buttons (Animate upward with stagger: 0.15s)
      if (buttonsRef.current) {
        const buttonEls = Array.from(buttonsRef.current.children);
        tl.fromTo(
          buttonEls,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.15 },
          "-=0.4",
        );
      }

      // Trust Badges (Animate individually, scale: 0.9 -> 1, opacity: 0 -> 1, stagger)
      const validBadges = badgeItemsRef.current.filter(Boolean);
      if (validBadges.length > 0) {
        tl.fromTo(
          validBadges,
          { opacity: 0, scale: 0.9, y: 15 },
          { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.1 },
          "-=0.3",
        );
      }

      // 4. Infinite Scroll Dot Animation
      if (scrollDotRef.current) {
        gsap.to(scrollDotRef.current, {
          y: 10,
          opacity: 0.3,
          duration: 1.8,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        });
      }
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Pricing Hero Section"
      className="relative w-full h-[82vh] min-h-150 max-h-212.5 bg-(--background,#090909) text-white overflow-hidden flex flex-col items-center justify-between select-none pt-20 pb-8"
    >
      {/* BACKGROUND EFFECTS: VIGNETTE, RADIAL GLOW, GRID & CANDLESTICKS */}

      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] z-10" />

        {/* Thin Golden Grid Lines (Extremely subtle) */}
        <div
          className="absolute inset-0 z-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #C8A84A 1px, transparent 1px), linear-gradient(to bottom, #C8A84A 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Low-Opacity Candlestick Chart Pattern */}
        <div className="absolute inset-0 opacity-[0.08] z-0 flex items-center justify-center">
          <svg
            className="w-full h-full text-[#C8A84A]"
            viewBox="0 0 1200 600"
            fill="none"
            stroke="currentColor"
          >
            <line x1="120" y1="100" x2="120" y2="420" strokeWidth="1.5" />
            <rect
              x="111"
              y="160"
              width="18"
              height="150"
              fill="currentColor"
              opacity="0.6"
            />
            <line x1="280" y1="80" x2="280" y2="480" strokeWidth="1.5" />
            <rect
              x="271"
              y="130"
              width="18"
              height="240"
              fill="currentColor"
              opacity="0.8"
            />
            <line x1="440" y1="140" x2="440" y2="520" strokeWidth="1.5" />
            <rect
              x="431"
              y="200"
              width="18"
              height="190"
              fill="currentColor"
              opacity="0.5"
            />
            <line x1="600" y1="60" x2="600" y2="400" strokeWidth="1.5" />
            <rect
              x="591"
              y="100"
              width="18"
              height="220"
              fill="currentColor"
              opacity="0.7"
            />
            <line x1="760" y1="110" x2="760" y2="490" strokeWidth="1.5" />
            <rect
              x="751"
              y="170"
              width="18"
              height="200"
              fill="currentColor"
              opacity="0.6"
            />
            <line x1="920" y1="90" x2="920" y2="440" strokeWidth="1.5" />
            <rect
              x="911"
              y="130"
              width="18"
              height="210"
              fill="currentColor"
              opacity="0.8"
            />
            <line x1="1080" y1="150" x2="1080" y2="540" strokeWidth="1.5" />
            <rect
              x="1071"
              y="210"
              width="18"
              height="240"
              fill="currentColor"
              opacity="0.5"
            />
          </svg>
        </div>

        {/* Soft Radial Golden Glow behind Heading */}
        <div
          ref={glowRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-162.5 sm:w-212.5 h-112.5 sm:h-137.5 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(200,168,74,0.18)_0%,rgba(9,9,9,0)_70%)] blur-3xl transform-gpu z-0"
        />

        {/* Small Floating Particles (5% opacity) */}
        {PARTICLES.map((particle, idx) => (
          <div
            key={particle.id}
            ref={(el) => {
              particlesRef.current[idx] = el;
            }}
            className="absolute rounded-full bg-[#C8A84A] opacity-15 z-0"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
          />
        ))}
      </div>

      {/* SECTION CONTENT CONTAINER (Vertically Centered, Max Width 1200px) */}

      <div className="relative z-10 w-full max-w-300 mx-auto px-4 sm:px-6 lg:px-8 my-auto flex flex-col items-center justify-center text-center">
        {/* Small Label */}
        {/* <div ref={labelRef} className="mb-3 sm:mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C8A84A]/30 text-xs font-semibold tracking-[0.2em] text-[#C8A84A] font-mono uppercase bg-[#C8A84A]/10 shadow-[0_0_15px_rgba(200,168,74,0.15)]">
            <ShieldCheck size={14} className="text-[#C8A84A]" />
            PRICING
          </div>
        </div> */}

        {/* Main Heading */}
        <h1
          ref={headingRef}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] font-sans mb-4 max-w-4xl"
        >
          Choose the Right Plan <br className="hidden sm:inline" />
          for Your <span className="gold-gradient-text">Trading Journey.</span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-sm sm:text-base lg:text-lg text-zinc-300/90 font-normal leading-relaxed max-w-175 text-center mb-8 sm:mb-10"
        >
          Gain access to structured trading education, expert mentorship, and a
          supportive trading community designed to help you build confidence and
          consistency in the financial markets.
        </p>

        {/* Call to Actions (Side by Side Desktop, Stacked Mobile) */}
        <div
          ref={buttonsRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 sm:mb-12 w-full sm:w-auto"
        >
          {/* Primary Button */}
          <a
            href="#pricing"
            className="group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base tracking-wide bg-linear-to-r from-(--primary-light,#e6c55a) via-(--primary,#d4af37) to-(--primary-dark,#8f6b12) text-black  transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto cursor-pointer"
          >
            <span>View Plans</span>
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </a>

          {/* Secondary Button */}
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm sm:text-base tracking-wide bg-[#121215]/80 backdrop-blur-md border border-[#C8A84A]/40 text-[#C8A84A] hover:bg-[#C8A84A]/15 hover:text-white hover:border-[#C8A84A] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto cursor-pointer"
          >
            <MessageSquare size={17} />
            <span>Contact Us</span>
          </a>
        </div>

        {/* Trust Badges (One row Desktop, Wrapped 2 rows Mobile) */}
        {/* <div className="w-full flex justify-center">
          <div
            ref={buttonsRef}
            className="grid grid-cols-2 sm:flex sm:flex-wrap lg:flex-nowrap items-center justify-center gap-3 sm:gap-4 max-w-4xl"
          >
            {TRUST_BADGES.map((badgeText, idx) => (
              <div
                key={idx}
                ref={(el) => {
                  badgeItemsRef.current[idx] = el;
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#121215]/80 backdrop-blur-md border border-[#C8A84A]/30 text-xs sm:text-sm font-medium text-zinc-200 shadow-md transition-colors hover:border-[#C8A84A]/60"
              >
                <Check size={14} className="text-[#C8A84A] shrink-0 stroke-3" />
                <span className="whitespace-nowrap">{badgeText}</span>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
}
