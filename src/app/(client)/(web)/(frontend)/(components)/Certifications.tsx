"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Dynamic Data Interface

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

// Sample dataset
const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: "cert-1",
    title: "NISM Series VIII - Equity Derivatives Certification",
    organization: "NATIONAL INSTITUTE OF SECURITIES MARKETS (NISM)",
    image: "/images/cert-nism.png",
    issuedYear: "2024",
    description:
      "Advanced accreditation covering derivative trading strategies, risk containment mechanisms, and regulatory compliance.",
    displayOrder: 1,
    isPublished: true,
  },
  {
    id: "cert-2",
    title: "Chartered Market Technician (CMT) Level II",
    organization: "CMT ASSOCIATION, USA",
    image: "/images/cert-cmt.png",
    issuedYear: "2023",
    description:
      "Institutional technical analysis charter certifying deep market structure expertise, trend identification, and quantitative risk management.",
    displayOrder: 2,
    isPublished: true,
  },
  {
    id: "cert-3",
    title: "CFA Institute Investment Foundations",
    organization: "CFA INSTITUTE, USA",
    image: "/images/cert-cfa.png",
    issuedYear: "2024",
    description:
      "Global standard qualification covering macroeconomic analysis, portfolio management, and ethical trading standards.",
    displayOrder: 3,
    isPublished: true,
  },
  {
    id: "cert-4",
    title: "Advanced Price Action & Liquidity Specialist",
    organization: "GLOBAL TRADING INSTITUTE",
    image: "/images/cert-nism.png",
    issuedYear: "2025",
    description:
      "Specialized accreditation in institutional order flow, market profile dynamics, and smart money liquidity concepts.",
    displayOrder: 4,
    isPublished: true,
  },
];

// Faint floating particle positions for background ambiance
const PARTICLES = Array.from({ length: 14 }).map((_, i) => ({
  id: i,
  x: (i * 7.5) % 100,
  y: (i * 13 + 5) % 100,
  size: (i % 3) + 2,
  duration: 8 + (i % 5) * 2,
  delay: (i % 4) * 0.7,
}));

export default function Certifications() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectionContentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const leftArrowDesktopRef = useRef<HTMLButtonElement>(null);
  const rightArrowDesktopRef = useRef<HTMLButtonElement>(null);
  const leftArrowMobileRef = useRef<HTMLButtonElement>(null);
  const rightArrowMobileRef = useRef<HTMLButtonElement>(null);
  const progressBarsRef = useRef<(HTMLDivElement | null)[]>([]);
  const particlesRef = useRef<(HTMLDivElement | null)[]>([]);

  // Clean, sorted certificates list
  const [certificates] = useState<Certificate[]>(() =>
    INITIAL_CERTIFICATES.filter((c) => c.isPublished).sort(
      (a, b) => a.displayOrder - b.displayOrder,
    ),
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const total = certificates.length;

  // Animation & state tracking refs
  const activeIndexRef = useRef(0);
  const isPausedRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const progressTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const transitionTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Keep activeIndexRef synced
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // GSAP Slide Change Transition Timeline

  const changeSlide = useCallback(
    (targetIndex: number) => {
      if (
        total <= 1 ||
        isAnimatingRef.current ||
        targetIndex === activeIndexRef.current
      ) {
        return;
      }

      isAnimatingRef.current = true;

      if (progressTimelineRef.current) {
        progressTimelineRef.current.kill();
        progressTimelineRef.current = null;
      }

      if (transitionTimelineRef.current) {
        transitionTimelineRef.current.kill();
      }

      const card = cardRef.current;
      const tl = gsap.timeline({
        onComplete: () => {
          isAnimatingRef.current = false;
        },
      });

      transitionTimelineRef.current = tl;

      // Outgoing card: opacity 1 -> 0, scale 1 -> 0.98, blur 0 -> 4px over 0.35s
      tl.to(card, {
        opacity: 0,
        scale: 0.98,
        filter: "blur(4px)",
        duration: 0.35,
        ease: "power2.inOut",
      })
        // Switch state
        .call(() => {
          setActiveIndex(targetIndex);
          activeIndexRef.current = targetIndex;
        })
        // Incoming card: opacity 0 -> 1, scale 0.98 -> 1, blur 4px -> 0px over 0.5s power3.out
        .fromTo(
          card,
          { opacity: 0, scale: 0.98, filter: "blur(4px)" },
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.5,
            ease: "power3.out",
          },
        );
    },
    [total],
  );

  const handleNext = useCallback(() => {
    const nextIdx = (activeIndexRef.current + 1) % total;
    changeSlide(nextIdx);
  }, [total, changeSlide]);

  const handlePrev = useCallback(() => {
    const prevIdx = (activeIndexRef.current - 1 + total) % total;
    changeSlide(prevIdx);
  }, [total, changeSlide]);

  const goToSlide = useCallback(
    (index: number) => {
      changeSlide(index);
    },
    [changeSlide],
  );

  // GSAP Progress Indicator & 3-Second Autoplay

  useEffect(() => {
    if (total <= 1) return;

    progressBarsRef.current.forEach((bar, idx) => {
      if (bar) {
        gsap.set(bar, { scaleX: idx === activeIndex ? 0 : 0 });
      }
    });

    const activeBar = progressBarsRef.current[activeIndex];

    if (activeBar) {
      const tl = gsap.timeline({
        onComplete: () => {
          handleNext();
        },
      });

      progressTimelineRef.current = tl;

      tl.fromTo(
        activeBar,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 3,
          ease: "none",
        },
      );

      if (isPausedRef.current) {
        tl.pause();
      }
    }

    return () => {
      if (progressTimelineRef.current) {
        progressTimelineRef.current.kill();
      }
    };
  }, [activeIndex, total, handleNext]);

  // GSAP Context: Entrance Animation & Floating Particles

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (sectionContentRef.current && sectionRef.current) {
        gsap.fromTo(
          sectionContentRef.current,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              once: true,
            },
          },
        );
      }

      particlesRef.current.forEach((particleEl, index) => {
        if (!particleEl) return;
        const particleData = PARTICLES[index];
        if (!particleData) return;

        gsap.to(particleEl, {
          y: "-=30",
          opacity: 0.2,
          duration: particleData.duration,
          delay: particleData.delay,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  // Hover & Pause Interactions

  const handleMouseEnterCard = () => {
    isPausedRef.current = true;
    if (progressTimelineRef.current) {
      progressTimelineRef.current.pause();
    }
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: -6,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const handleMouseLeaveCard = () => {
    isPausedRef.current = false;
    if (progressTimelineRef.current) {
      progressTimelineRef.current.resume();
    }
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const handleArrowMouseEnter = (
    arrowEl: HTMLButtonElement | null,
    isRight = false,
  ) => {
    if (!arrowEl) return;
    gsap.to(arrowEl, {
      scale: 1.08,
      rotation: isRight ? 4 : -4,
      boxShadow: "0 0 25px rgba(200, 168, 74, 0.45)",
      duration: 0.25,
      ease: "power2.out",
    });
  };

  const handleArrowMouseLeave = (arrowEl: HTMLButtonElement | null) => {
    if (!arrowEl) return;
    gsap.to(arrowEl, {
      scale: 1,
      rotation: 0,
      boxShadow: "0 0 15px rgba(200, 168, 74, 0.15)",
      duration: 0.25,
      ease: "power2.out",
    });
  };

  // Mobile Touch Swipe Gesture Handlers

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartXRef.current;

    if (diffX < -50) {
      handleNext();
    } else if (diffX > 50) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  // Keyboard Navigation

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

      if (!isInViewport) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  if (total === 0) return null;

  const currentCert = certificates[activeIndex];

  return (
    <section
      ref={sectionRef}
      aria-label="Professional Certifications Section"
      className="relative w-full  flex flex-col items-center justify-center py-6 sm:py-8 lg:py-10 bg-(--background,#090909) text-white select-none"
    >
      {/* BACKGROUND AMBIANCE: VIGNETTE, RADIAL GLOW & FAINT PARTICLES */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 sm:w-187.5 h-100 sm:h-125 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(200,168,74,0.12)_0%,rgba(9,9,9,0)_70%)] blur-3xl" />
        {PARTICLES.map((particle, index) => (
          <div
            key={particle.id}
            ref={(el) => {
              particlesRef.current[index] = el;
            }}
            className="absolute rounded-full bg-[#C8A84A] opacity-10"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
          />
        ))}
      </div>

      {/* SECTION CONTENT CONTAINER (Fits within 100vh on Desktop) */}
      <div
        ref={sectionContentRef}
        className="relative z-10 w-full max-w-250 mx-auto px-4 sm:px-6 flex flex-col items-center justify-center"
      >
        {/* Small Section Label */}
        <div className="mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#C8A84A]/30 text-[11px] font-semibold tracking-widest text-[#C8A84A] font-mono uppercase bg-[#C8A84A]/10 shadow-[0_0_12px_rgba(200,168,74,0.15)]">
            <ShieldCheck size={13} className="text-[#C8A84A]" />
            CERTIFICATIONS
          </div>
        </div>

        {/* Main Heading */}
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans mb-2 text-center max-w-2xl">
          Professional Certifications <br className="hidden sm:inline" />
          <span className="gold-gradient-text">Trusted Expertise.</span>
        </h2>

        {/* Supporting Subtitle */}
        <p className="text-xs sm:text-sm text-zinc-300/90 font-normal leading-relaxed max-w-lg text-center mb-5 sm:mb-6 italic">
          &ldquo;Our mentors continuously invest in professional development and
          industry-recognized certifications.&rdquo;
        </p>

        {/* COMPACT SHOWCASE CAROUSEL FRAME */}
        <div className="relative w-full max-w-170 mx-auto flex items-center justify-center">
          {/* Desktop Navigation Arrow - Left */}
          <button
            ref={leftArrowDesktopRef}
            onClick={handlePrev}
            onMouseEnter={() =>
              handleArrowMouseEnter(leftArrowDesktopRef.current, false)
            }
            onMouseLeave={() =>
              handleArrowMouseLeave(leftArrowDesktopRef.current)
            }
            aria-label="Previous Certificate"
            className="hidden md:flex absolute -left-12 lg:-left-16 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-[#121215]/80 backdrop-blur-xl border border-[#C8A84A]/40 items-center justify-center text-[#C8A84A] hover:text-white hover:border-[#C8A84A] hover:bg-[#C8A84A]/20 transition-colors duration-300 shadow-[0_0_15px_rgba(200,168,74,0.15)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C8A84A]"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Compact Certificate Card (Wraps Image + Title Only) */}
          <article
            ref={cardRef}
            onMouseEnter={handleMouseEnterCard}
            onMouseLeave={handleMouseLeaveCard}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full rounded-3xl bg-[#121215]/90 backdrop-blur-xl border border-[#C8A84A]/30 p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(200,168,74,0.12)] relative z-10 overflow-hidden flex flex-col items-center text-center cursor-pointer"
          >
            {/* Subtle Radial Glow behind image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-55 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(200,168,74,0.15)_0%,rgba(9,9,9,0)_70%)] blur-2xl pointer-events-none" />

            {/* Certificate Image Frame (Focused ~55-65% container width, 280-340px height) */}
            <div className="relative w-[90%] sm:w-[75%] lg:w-[75%] h-60 sm:h-75 lg:h-82.5 rounded-xl sm:rounded-2xl overflow-hidden border border-[#C8A84A]/30 bg-black/80 shadow-xl group">
              <Image
                src={currentCert.image}
                alt={currentCert.title}
                fill
                priority
                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 50vw, 450px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
            </div>

            {/* Certificate Title Directly Below Image */}
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#C8A84A] font-sans tracking-tight mt-4 sm:mt-5 text-center leading-snug line-clamp-2 max-w-lg">
              {currentCert.title}
            </h3>
          </article>

          {/* Desktop Navigation Arrow - Right */}
          <button
            ref={rightArrowDesktopRef}
            onClick={handleNext}
            onMouseEnter={() =>
              handleArrowMouseEnter(rightArrowDesktopRef.current, true)
            }
            onMouseLeave={() =>
              handleArrowMouseLeave(rightArrowDesktopRef.current)
            }
            aria-label="Next Certificate"
            className="hidden md:flex absolute -right-12 lg:-right-16 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-[#121215]/80 backdrop-blur-xl border border-[#C8A84A]/40 items-center justify-center text-[#C8A84A] hover:text-white hover:border-[#C8A84A] hover:bg-[#C8A84A]/20 transition-colors duration-300 shadow-[0_0_15px_rgba(200,168,74,0.15)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C8A84A]"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* MOBILE CONTROLS & ANIMATED PROGRESS INDICATORS */}
        <div className="mt-4 sm:mt-5 flex flex-col items-center gap-3 w-full z-20">
          {/* Mobile Navigation Buttons (below card) */}
          <div className="flex md:hidden items-center gap-5">
            <button
              ref={leftArrowMobileRef}
              onClick={handlePrev}
              onMouseEnter={() =>
                handleArrowMouseEnter(leftArrowMobileRef.current, false)
              }
              onMouseLeave={() =>
                handleArrowMouseLeave(leftArrowMobileRef.current)
              }
              aria-label="Previous Certificate"
              className="w-10 h-10 rounded-full bg-[#121215]/90 backdrop-blur-xl border border-[#C8A84A]/40 flex items-center justify-center text-[#C8A84A] active:bg-[#C8A84A]/20 shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C8A84A]"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-[11px] font-mono text-zinc-400 tracking-wider">
              0{activeIndex + 1} / 0{total}
            </span>

            <button
              ref={rightArrowMobileRef}
              onClick={handleNext}
              onMouseEnter={() =>
                handleArrowMouseEnter(rightArrowMobileRef.current, true)
              }
              onMouseLeave={() =>
                handleArrowMouseLeave(rightArrowMobileRef.current)
              }
              aria-label="Next Certificate"
              className="w-10 h-10 rounded-full bg-[#121215]/90 backdrop-blur-xl border border-[#C8A84A]/40 flex items-center justify-center text-[#C8A84A] active:bg-[#C8A84A]/20 shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C8A84A]"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Animated Progress Indicators */}
          <div
            className="flex items-center justify-center gap-2.5 sm:gap-3"
            aria-label="Certificate Progress Navigation"
          >
            {certificates.map((cert, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={cert.id}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to certificate ${index + 1}: ${cert.title}`}
                  className="relative h-2 rounded-full overflow-hidden transition-all duration-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C8A84A]"
                  style={{ width: isActive ? "48px" : "20px" }}
                >
                  <div className="absolute inset-0 bg-white/15 rounded-full" />
                  <div
                    ref={(el) => {
                      progressBarsRef.current[index] = el;
                    }}
                    className="absolute inset-0 bg-linear-to-r from-[#e6c55a] via-[#C8A84A] to-[#8f6b12] rounded-full shadow-[0_0_10px_rgba(200,168,74,0.8)] origin-left"
                    style={{ transform: "scaleX(0)" }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
