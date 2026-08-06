"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Compass,
  Layers,
  Activity,
  Target,
  ShieldCheck,
  Brain,
  Radio,
  Award,
  LucideIcon,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------
// Sub-component: RoadmapItem
// -------------------------------------------------------------
interface RoadmapItemProps {
  stepNumber: string;
  title: string;
  description: string;
  icon: LucideIcon;
  isEven: boolean;
}

const RoadmapItem: React.FC<RoadmapItemProps> = ({
  stepNumber,
  title,
  description,
  icon: Icon,
  isEven,
}) => {
  return (
    <div
      className={`relative flex flex-col md:flex-row items-center w-full mb-12 last:mb-0 ${
        isEven ? "md:flex-row-reverse" : ""
      }`}
    >
      <div className="w-full md:w-[calc(50%-2.5rem)]">
        <article className="glass-panel rounded-[20px] p-6 sm:p-7 border border-[var(--primary)]/20 hover:border-[var(--primary)]/50 transition-all duration-300 ease-out group hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(212,175,55,0.18)] cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--primary)]/70 group-hover:text-[var(--primary)] transition-colors duration-300">
              {stepNumber}
            </span>

            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] group-hover:rotate-6 group-hover:scale-110 group-hover:bg-[var(--primary)]/20 transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
              <Icon size={20} />
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-2 font-sans group-hover:text-[var(--primary-light)] transition-colors duration-300">
            {title}
          </h3>

          <p className="text-sm text-[var(--text)] font-normal leading-relaxed text-zinc-300">
            {description}
          </p>
        </article>
      </div>

      <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center z-20 my-4 md:my-0">
        <div className="roadmap-node w-7 h-7 rounded-full bg-[var(--background)] border-2 border-[var(--primary)] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)] group-hover:scale-125 transition-transform duration-300">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-pulse" />
        </div>
      </div>

      <div className="hidden md:block w-[calc(50%-2.5rem)]" />
    </div>
  );
};

const ROADMAP_STEPS = [
  {
    stepNumber: "01",
    title: "Market Fundamentals",
    description: "Understand how financial markets work before placing your first trade.",
    icon: Compass,
  },
  {
    stepNumber: "02",
    title: "Market Structure",
    description: "Learn trends, swings, support and resistance with clarity.",
    icon: Layers,
  },
  {
    stepNumber: "03",
    title: "Price Action",
    description: "Read candlesticks and market behavior without indicators.",
    icon: Activity,
  },
  {
    stepNumber: "04",
    title: "Liquidity Concepts",
    description: "Understand where institutions enter and exit the market.",
    icon: Target,
  },
  {
    stepNumber: "05",
    title: "Risk Management",
    description: "Protect your capital with disciplined position sizing.",
    icon: ShieldCheck,
  },
  {
    stepNumber: "06",
    title: "Trading Psychology",
    description: "Build emotional control and consistency.",
    icon: Brain,
  },
  {
    stepNumber: "07",
    title: "Live Market Sessions",
    description: "Apply everything in practical market environments.",
    icon: Radio,
  },
  {
    stepNumber: "08",
    title: "Become a Consistent Trader",
    description:
      "Graduate with a structured trading process built for long-term success.",
    icon: Award,
  },
];

export default function LearningJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const roadmapContainerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(
          [
            labelRef.current,
            headingRef.current,
            paragraphRef.current,
            roadmapContainerRef.current?.children,
          ],
          { opacity: 1, y: 0 },
        );
        if (lineRef.current) gsap.set(lineRef.current, { scaleY: 1 });
        return;
      }

      gsap.set(labelRef.current, { opacity: 0, y: 20 });
      gsap.set(headingRef.current, { opacity: 0, y: 30 });
      gsap.set(paragraphRef.current, { opacity: 0, y: 25 });
      if (lineRef.current) {
        gsap.set(lineRef.current, { scaleY: 0, transformOrigin: "top center" });
      }
      if (roadmapContainerRef.current) {
        gsap.set(roadmapContainerRef.current.children, { opacity: 0, y: 35 });
      }

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

      if (lineRef.current) {
        tl.to(
          lineRef.current,
          { scaleY: 1, duration: 1.4, ease: "power2.inOut" },
          "-=0.3",
        );
      }

      if (roadmapContainerRef.current) {
        tl.to(
          roadmapContainerRef.current.children,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.2)",
          },
          "-=1.1",
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
      aria-label="Learning Journey Section"
      className="relative w-full py-28 lg:py-36 bg-[var(--background)] text-white overflow-hidden "
    >
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          ref={glowRef}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full gold-radial-glow opacity-25 blur-3xl transform-gpu"
        />
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div ref={labelRef} className="mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--primary)]/30 text-xs font-semibold tracking-widest text-[var(--primary)] font-mono uppercase bg-[var(--primary)]/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
            LEARNING JOURNEY
          </div>
        </div>

        <h2
          ref={headingRef}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans mb-4 text-center max-w-3xl"
        >
          From Beginner to <br />
          <span className="gold-gradient-text">Consistent Trader.</span>
        </h2>

        <p
          ref={paragraphRef}
          className="text-base sm:text-lg text-[var(--text)] font-normal leading-relaxed text-zinc-300 max-w-[650px] text-center mb-16 sm:mb-24"
        >
          Our curriculum is carefully structured to build your confidence step by step.
          Every stage prepares you for the next, ensuring you develop the discipline,
          mindset, and technical skills required to trade real markets.
        </p>

        <div className="relative w-full">
          <div
            ref={lineRef}
            className="absolute left-4 md:left-1/2 -translate-x-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[var(--primary)]/10 via-[var(--primary)] to-[var(--primary)]/20 shadow-[0_0_15px_rgba(212,175,55,0.5)] z-10"
          />

          <div ref={roadmapContainerRef} className="w-full relative z-20">
            {ROADMAP_STEPS.map((step, idx) => (
              <RoadmapItem
                key={step.stepNumber}
                stepNumber={step.stepNumber}
                title={step.title}
                description={step.description}
                icon={step.icon}
                isEven={idx % 2 === 1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
