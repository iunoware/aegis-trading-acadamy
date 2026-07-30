"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight, Award, ShieldCheck } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------
// Dynamic Data Interface (Super Admin & API Ready)
// -------------------------------------------------------------
export interface Certificate {
  id: string;
  title: string;
  organization: string;
  image: string;
  issuedYear: string;
  description?: string;
  displayOrder: number;
  isPublished: boolean;
}

// Sample API / Admin dataset
const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: "cert-1",
    title: "NISM Series VIII - Equity Derivatives Certification",
    organization: "NATIONAL INSTITUTE OF SECURITIES MARKETS (NISM)",
    image: "/images/cert-nism.png",
    issuedYear: "2024",
    description: "Advanced certification covering derivative trading strategies, risk containment, and regulatory compliance.",
    displayOrder: 1,
    isPublished: true,
  },
  {
    id: "cert-2",
    title: "Chartered Market Technician (CMT) Level II",
    organization: "CMT ASSOCIATION, USA",
    image: "/images/cert-cmt.png",
    issuedYear: "2023",
    description: "Institutional technical analysis charter certifying deep market structure, trend identification, and risk management.",
    displayOrder: 2,
    isPublished: true,
  },
  {
    id: "cert-3",
    title: "CFA Institute Investment Foundations",
    organization: "CFA INSTITUTE, USA",
    image: "/images/cert-cfa.png",
    issuedYear: "2024",
    description: "Global standard qualification covering macroeconomic analysis, portfolio management, and ethical trading standards.",
    displayOrder: 3,
    isPublished: true,
  },
  {
    id: "cert-4",
    title: "Advanced Price Action & Liquidity Specialist",
    organization: "GLOBAL TRADING INSTITUTE",
    image: "/images/cert-nism.png",
    issuedYear: "2025",
    description: "Specialized accreditation in institutional order flow, market profile, and smart money liquidity concepts.",
    displayOrder: 4,
    isPublished: true,
  },
];

export default function Certifications() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const carouselFrameRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Filter published certificates sorted by displayOrder
  const [certificates] = useState<Certificate[]>(() =>
    INITIAL_CERTIFICATES.filter((c) => c.isPublished).sort(
      (a, b) => a.displayOrder - b.displayOrder
    )
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % certificates.length);
  }, [certificates.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + certificates.length) % certificates.length);
  }, [certificates.length]);

  // -------------------------------------------------------------
  // 5-Second Infinite Auto-Slide Loop (Pauses on Hover)
  // -------------------------------------------------------------
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isPaused || prefersReducedMotion || certificates.length === 0) return;

    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, handleNext, certificates.length]);

  // -------------------------------------------------------------
  // GSAP Animations with ScrollTrigger
  // -------------------------------------------------------------
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(
          [
            labelRef.current,
            headingRef.current,
            paragraphRef.current,
            carouselFrameRef.current,
            controlsRef.current,
          ],
          { opacity: 1, y: 0 }
        );
        return;
      }

      gsap.set(labelRef.current, { opacity: 0, y: 20 });
      gsap.set(headingRef.current, { opacity: 0, y: 30 });
      gsap.set(paragraphRef.current, { opacity: 0, y: 25 });
      gsap.set(carouselFrameRef.current, { opacity: 0, y: 35 });
      gsap.set(controlsRef.current, { opacity: 0, y: 15 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "power3.out" },
      });

      tl.to(labelRef.current, { opacity: 1, y: 0, duration: 0.7 })
        .to(headingRef.current, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
        .to(paragraphRef.current, { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
        .to(carouselFrameRef.current, { opacity: 1, y: 0, duration: 0.9 }, "-=0.4")
        .to(controlsRef.current, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.45,
          scale: 1.1,
          duration: 4.5,
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

  if (certificates.length === 0) return null;

  // Compute 3 visible card positions for carousel
  const count = certificates.length;
  const leftIdx = (activeIndex - 1 + count) % count;
  const rightIdx = (activeIndex + 1) % count;

  const visibleCards = [
    { data: certificates[leftIdx], position: "left" },
    { data: certificates[activeIndex], position: "center" },
    { data: certificates[rightIdx], position: "right" },
  ];

  return (
    <section
      ref={sectionRef}
      aria-label="Certifications Showcase Section"
      className="relative w-full py-28 lg:py-36 bg-[var(--background)] text-white overflow-hidden select-none"
    >
      {/* ------------------------------------------------------------- */}
      {/* BACKGROUND GLOW */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          ref={glowRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full gold-radial-glow opacity-30 blur-3xl transform-gpu"
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION CONTAINER */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Small Label */}
        <div ref={labelRef} className="mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--primary)]/30 text-xs font-semibold tracking-widest text-[var(--primary)] font-mono uppercase bg-[var(--primary)]/5">
            <ShieldCheck size={14} className="text-[var(--primary)]" />
            CERTIFICATIONS
          </div>
        </div>

        {/* Main Heading */}
        <h2
          ref={headingRef}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans mb-4 text-center max-w-3xl"
        >
          Certified Mentors. <br />
          <span className="gold-gradient-text">Trusted Expertise.</span>
        </h2>

        {/* Supporting Paragraph (Max width 650px) */}
        <p
          ref={paragraphRef}
          className="text-base sm:text-lg text-[var(--text)] font-normal leading-relaxed text-zinc-300 max-w-[650px] text-center mb-16 sm:mb-20"
        >
          Our mentors continuously invest in professional development and industry-recognized certifications to provide structured, up-to-date trading education.
        </p>

        {/* ------------------------------------------------------------- */}
        {/* CERTIFICATE CAROUSEL FRAME (3 Visible Cards Desktop, 2 Tablet, 1 Mobile) */}
        {/* ------------------------------------------------------------- */}
        <div
          ref={carouselFrameRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="w-full relative max-w-[1200px] mx-auto min-h-[380px] flex items-center justify-center mb-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center w-full">
            {visibleCards.map(({ data, position }) => {
              const isCenter = position === "center";
              return (
                <div
                  key={data.id}
                  className={`transition-all duration-500 ease-out transform ${
                    isCenter
                      ? "scale-100 opacity-100 z-20"
                      : "hidden md:block scale-95 opacity-85 hover:opacity-100 z-10"
                  }`}
                >
                  <article
                    className={`group relative rounded-[24px] glass-panel p-6 sm:p-7 flex flex-col justify-between h-full border transition-all duration-350 ease-out ${
                      isCenter
                        ? "border-[var(--primary)]/50 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_35px_rgba(212,175,55,0.18)] bg-[#141414]/95"
                        : "border-white/10 bg-[#101010]/70"
                    } hover:-translate-y-2 hover:scale-[1.02] cursor-pointer`}
                  >
                    <div>
                      {/* Large Certificate Image Frame */}
                      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-5 border border-white/10 group-hover:border-[var(--primary)]/40 transition-colors duration-300 shadow-lg bg-black/40">
                        <Image
                          src={data.image}
                          alt={`${data.title} - ${data.organization}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />
                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] shadow-md">
                          <Award size={16} />
                        </div>
                      </div>

                      {/* Certificate Meta (Pure typography, no avatars or social icons) */}
                      <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                        {data.organization}
                      </span>

                      <h3 className="text-base sm:text-lg font-bold text-[var(--primary-light)] font-sans group-hover:text-[var(--primary)] transition-colors duration-300 leading-snug">
                        {data.title}
                      </h3>

                      <span className="text-xs font-mono text-[var(--primary)]/90 font-medium block mt-1.5">
                        Issued {data.issuedYear}
                      </span>

                      {data.description && (
                        <p className="text-xs text-zinc-300 mt-2 font-sans leading-relaxed line-clamp-2">
                          {data.description}
                        </p>
                      )}
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CAROUSEL CONTROLS: PREV/NEXT & PAGINATION DOTS */}
        {/* ------------------------------------------------------------- */}
        <div ref={controlsRef} className="flex items-center gap-6">
          <button
            onClick={handlePrev}
            aria-label="Previous Certificate"
            className="w-11 h-11 rounded-full glass-panel border border-white/15 flex items-center justify-center text-white hover:text-[var(--primary)] hover:border-[var(--primary)]/50 hover:scale-110 active:scale-95 transition-all duration-300 shadow-md cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2.5" aria-label="Certificate Carousel Pagination">
            {certificates.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to certificate ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "w-8 bg-[var(--primary)] shadow-[0_0_12px_rgba(212,175,55,0.6)]"
                      : "w-2.5 bg-white/20 hover:bg-white/40"
                  }`}
                />
              );
            })}
          </div>

          <button
            onClick={handleNext}
            aria-label="Next Certificate"
            className="w-11 h-11 rounded-full glass-panel border border-white/15 flex items-center justify-center text-white hover:text-[var(--primary)] hover:border-[var(--primary)]/50 hover:scale-110 active:scale-95 transition-all duration-300 shadow-md cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>

      </div>
    </section>
  );
}
