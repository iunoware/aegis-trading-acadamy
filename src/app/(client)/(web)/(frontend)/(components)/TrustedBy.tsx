"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function TrustedBy() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Counter values state
  const [membersCount, setMembersCount] = useState(0);
  const [yearsCount, setYearsCount] = useState(0);
  const [hoursCount, setHoursCount] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        setMembersCount(120);
        setYearsCount(4);
        setHoursCount(15);
        gsap.set(
          [
            labelRef.current,
            headingRef.current,
            textRef.current,
            metricsRef.current?.children,
          ],
          { opacity: 1, y: 0 },
        );
        return;
      }

      // Initial state
      gsap.set(labelRef.current, { opacity: 0, y: 20 });
      gsap.set(headingRef.current, { opacity: 0, y: 30 });
      gsap.set(textRef.current, { opacity: 0, y: 25 });
      if (metricsRef.current) {
        gsap.set(metricsRef.current.children, { opacity: 0, y: 30 });
      }

      // Main Entrance Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "power3.out" },
      });

      tl.to(labelRef.current, { opacity: 1, y: 0, duration: 0.7 })
        .to(headingRef.current, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
        .to(textRef.current, { opacity: 1, y: 0, duration: 0.7 }, "-=0.5");

      // Metrics Stagger Fade Up
      if (metricsRef.current) {
        tl.to(
          metricsRef.current.children,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
          },
          "-=0.4",
        );
      }

      // GSAP Text Count-up for Numbers (Duration 1.5s)
      const countObj = { members: 0, years: 0, hours: 0 };
      tl.to(
        countObj,
        {
          members: 120,
          years: 4,
          hours: 15,
          duration: 1.5,
          ease: "power2.out",
          onUpdate: () => {
            setMembersCount(Math.floor(countObj.members));
            setYearsCount(Math.floor(countObj.years));
            setHoursCount(Math.floor(countObj.hours));
          },
        },
        "-=0.9",
      );

      // Soft glow subtle animation
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.45,
          scale: 1.1,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
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
      aria-label="Trusted By Section"
      className="relative w-full py-28 lg:py-20 bg-background text-white overflow-hidden select-none"
    >
      {/* ------------------------------------------------------------- */}
      {/* BACKGROUND GLOW (No grid, no charts, no noise) */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          ref={glowRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-[700px] rounded-full gold-radial-glow opacity-25 blur-3xl transform-gpu"
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION CONTENT */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Small Label */}
        <div ref={labelRef} className="mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--primary)]/30 text-xs font-semibold tracking-widest text-[var(--primary)] font-mono uppercase bg-[var(--primary)]/5">
            <ShieldCheck size={14} className="text-[var(--primary)]" />
            TRUSTED BY
          </div>
        </div>

        {/* Main Heading */}
        <h2
          ref={headingRef}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans mb-4 max-w-3xl"
        >
          Built on Discipline. <br />
          <span className="gold-gradient-text">Trusted by Traders.</span>
        </h2>

        {/* Supporting Text (Max width 600px) */}
        <p
          ref={textRef}
          className="text-base sm:text-lg text-[var(--text)] font-normal leading-relaxed max-w-[600px] mb-16 sm:mb-20"
        >
          Every successful trader starts with the right foundation. Aegis
          Trading Academy has helped aspiring traders build confidence through
          structured learning, disciplined execution and continuous mentorship.
        </p>

        {/* ------------------------------------------------------------- */}
        {/* HORIZONTAL METRICS SECTION (No cards, no boxes, thin gold dividers) */}
        {/* ------------------------------------------------------------- */}
        <div
          ref={metricsRef}
          className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 items-center justify-between border-y border-white/10 py-10 md:py-14"
        >
          {/* Metric 1 */}
          <div className="group relative flex flex-col items-center justify-center px-4 transition-transform duration-300 hover:scale-105">
            <span className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-mono gold-gradient-text tracking-tight">
              {membersCount}+
            </span>
            <span className="text-xs sm:text-sm font-semibold tracking-wider text-muted uppercase font-mono mt-2.5 block group-hover:text-white transition-colors duration-300">
              Active Members
            </span>
            {/* Right Divider for desktop */}
            <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-16 bg-gradient-to-b from-[var(--primary)]/0 via-[var(--primary)]/30 to-[var(--primary)]/0 group-hover:via-[var(--primary)]/70 transition-colors duration-300" />
          </div>

          {/* Metric 2 */}
          <div className="group relative flex flex-col items-center justify-center px-4 transition-transform duration-300 hover:scale-105">
            <span className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-mono gold-gradient-text tracking-tight">
              {yearsCount}+
            </span>
            <span className="text-xs sm:text-sm font-semibold tracking-wider text-[var(--muted)] uppercase font-mono mt-2.5 block group-hover:text-white transition-colors duration-300">
              Years Experience
            </span>
            {/* Right Divider for desktop */}
            <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-16 bg-gradient-to-b from-[var(--primary)]/0 via-[var(--primary)]/30 to-[var(--primary)]/0 group-hover:via-[var(--primary)]/70 transition-colors duration-300" />
          </div>

          {/* Metric 3 */}
          <div className="group relative flex flex-col items-center justify-center px-4 transition-transform duration-300 hover:scale-105">
            <span className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-mono gold-gradient-text tracking-tight">
              {hoursCount}+
            </span>
            <span className="text-xs sm:text-sm font-semibold tracking-wider text-[var(--muted)] uppercase font-mono mt-2.5 block group-hover:text-white transition-colors duration-300">
              Hours of Structured Learning
            </span>
            {/* Right Divider for desktop */}
            <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-16 bg-gradient-to-b from-[var(--primary)]/0 via-[var(--primary)]/30 to-[var(--primary)]/0 group-hover:via-[var(--primary)]/70 transition-colors duration-300" />
          </div>

          {/* Metric 4 */}
          <div className="group relative flex flex-col items-center justify-center px-4 transition-transform duration-300 hover:scale-105">
            <span className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-mono gold-gradient-text tracking-tight">
              Lifetime
            </span>
            <span className="text-xs sm:text-sm font-semibold tracking-wider text-[var(--muted)] uppercase font-mono mt-2.5 block group-hover:text-white transition-colors duration-300">
              Community Support
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
