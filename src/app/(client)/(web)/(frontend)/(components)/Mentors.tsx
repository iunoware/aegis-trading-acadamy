"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Globe, Mail, ShieldCheck } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface MentorData {
  id: string;
  name: string;
  role: string;
  experience: string;
  image: string;
  expertise: string[];
  philosophy: string;
  linkedinUrl?: string;
  email?: string;
}

const MENTORS_DATA: MentorData[] = [
  {
    id: "devendra",
    name: "Devendra Kulkarni",
    role: "FOUNDER & LEAD MENTOR",
    experience: "10+ Years Market Experience",
    image: "/images/mentor-devendra.png",
    expertise: ["Price Action", "Market Structure", "Risk Management"],
    philosophy: "Discipline and patience are the true edge in trading.",
    linkedinUrl: "https://linkedin.com",
    email: "mailto:devendra@aegistrading.com",
  },
  {
    id: "arjun",
    name: "Arjun Mehta",
    role: "CHIEF MARKET ANALYST",
    experience: "8+ Years Market Experience",
    image: "/images/mentor-arjun.png",
    expertise: ["Liquidity Concepts", "Options Strategy", "Quantitative Analysis"],
    philosophy: "Trade what you see, not what you think.",
    linkedinUrl: "https://linkedin.com",
    email: "mailto:arjun@aegistrading.com",
  },
  {
    id: "vikram",
    name: "Vikramaditya Rao",
    role: "HEAD OF RISK MANAGEMENT",
    experience: "7+ Years Market Experience",
    image: "/images/mentor-vikram.png",
    expertise: ["Position Sizing", "Trading Psychology", "Portfolio Hedging"],
    philosophy: "Capital preservation must precede capital growth.",
    linkedinUrl: "https://linkedin.com",
    email: "mailto:vikram@aegistrading.com",
  },
];

export default function Mentors() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(
          [
            labelRef.current,
            headingRef.current,
            paragraphRef.current,
            cardsGridRef.current?.children,
          ],
          { opacity: 1, y: 0, scale: 1 }
        );
        return;
      }

      // Initial States
      gsap.set(labelRef.current, { opacity: 0, y: 20 });
      gsap.set(headingRef.current, { opacity: 0, y: 30 });
      gsap.set(paragraphRef.current, { opacity: 0, y: 25 });
      if (cardsGridRef.current) {
        gsap.set(cardsGridRef.current.children, { opacity: 0, y: 40, scale: 0.95 });
      }

      // Timeline Sequence
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
        .to(paragraphRef.current, { opacity: 1, y: 0, duration: 0.7 }, "-=0.5");

      // Stagger Cards Slide & Fade Up (0.15s stagger)
      if (cardsGridRef.current) {
        tl.to(
          cardsGridRef.current.children,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            stagger: 0.15,
            ease: "back.out(1.2)",
          },
          "-=0.4"
        );
      }

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.4,
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

  return (
    <section
      ref={sectionRef}
      id="mentors"
      aria-label="Our Mentors Section"
      className="relative w-full py-28 lg:py-36 bg-[var(--background)] text-white overflow-hidden select-none"
    >
      {/* ------------------------------------------------------------- */}
      {/* BACKGROUND GLOW */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          ref={glowRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full gold-radial-glow opacity-25 blur-3xl transform-gpu"
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
            OUR MENTORS
          </div>
        </div>

        {/* Main Heading */}
        <h2
          ref={headingRef}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans mb-4 text-center max-w-3xl"
        >
          Learn from <br />
          <span className="gold-gradient-text">Experienced Traders.</span>
        </h2>

        {/* Supporting Paragraph (Max width 650px) */}
        <p
          ref={paragraphRef}
          className="text-base sm:text-lg text-[var(--text)] font-normal leading-relaxed text-zinc-300 max-w-[650px] text-center mb-16 sm:mb-20"
        >
          Our mentors combine practical market experience with structured education to help you build confidence, discipline and consistency in every stage of your trading journey.
        </p>

        {/* ------------------------------------------------------------- */}
        {/* MENTORS GRID (3 Columns Desktop, 2 Tablet, 1 Mobile, Gap 32px) */}
        {/* ------------------------------------------------------------- */}
        <div
          ref={cardsGridRef}
          className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch"
        >
          {MENTORS_DATA.map((mentor) => (
            <article
              key={mentor.id}
              className="group rounded-[24px] glass-panel p-6 sm:p-7 flex flex-col justify-between h-full border border-[var(--primary)]/20 hover:border-[var(--primary)]/50 transition-all duration-350 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_35px_rgba(212,175,55,0.18)] cursor-pointer"
            >
              <div>
                {/* PORTRAIT (Rounded Rectangle, NO circular avatars) */}
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-6 border border-[var(--primary)]/30 group-hover:border-[var(--primary)]/60 transition-colors duration-300 shadow-md">
                  <Image
                    src={mentor.image}
                    alt={`${mentor.name} - ${mentor.role}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                </div>

                {/* MENTOR DETAILS */}
                <div className="mb-4">
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                    {mentor.role}
                  </span>

                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--primary-light)] font-sans group-hover:text-[var(--primary)] transition-colors duration-300">
                    {mentor.name}
                  </h3>

                  <span className="text-xs font-mono text-[var(--primary)]/90 font-medium block mt-1">
                    {mentor.experience}
                  </span>
                </div>

                {/* EXPERTISE PILL TAGS */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {mentor.expertise.map((tag, idx) => (
                    <span
                      key={`${mentor.id}-tag-${idx}`}
                      className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 group-hover:border-[var(--primary)]/30 group-hover:text-white transition-colors duration-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* PHILOSOPHY QUOTE */}
                <p className="text-sm text-zinc-300 italic font-sans leading-relaxed border-l-2 border-[var(--primary)]/40 pl-3 mb-6">
                  &ldquo;{mentor.philosophy}&rdquo;
                </p>
              </div>

              {/* BOTTOM SOCIAL LINKS */}
              {(mentor.linkedinUrl || mentor.email) && (
                <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                  {mentor.linkedinUrl && (
                    <a
                      href={mentor.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`LinkedIn profile of ${mentor.name}`}
                      className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition-colors duration-300"
                    >
                      <Globe size={16} />
                    </a>
                  )}

                  {mentor.email && (
                    <a
                      href={mentor.email}
                      aria-label={`Send email to ${mentor.name}`}
                      className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition-colors duration-300"
                    >
                      <Mail size={16} />
                    </a>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
