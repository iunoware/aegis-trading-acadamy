"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Target,
  Users,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ArrowUpRight,
  LucideIcon,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------
// Sub-component: FeatureCard
// -------------------------------------------------------------
interface FeatureCardProps {
  icon: LucideIcon;
  heading: string;
  description: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  heading,
  description,
  className = "",
}) => {
  return (
    <article
      className={`glass-panel rounded-[20px] p-7 sm:p-8 flex flex-col justify-between group transition-all duration-350 ease-out border border-[var(--primary)]/20 hover:border-[var(--primary)]/50 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(0,0,0,0.6),0_0_35px_rgba(212,175,55,0.18)] cursor-pointer ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/25 flex items-center justify-center text-[var(--primary)] group-hover:scale-110 group-hover:rotate-6 group-hover:bg-[var(--primary)]/20 transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <Icon size={24} />
          </div>

          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted group-hover:text-primary group-hover:border-[var(--primary)]/40 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
            <ArrowUpRight size={18} />
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2.5 font-sans group-hover:text-primary-light transition-colors duration-300">
          {heading}
        </h3>
        <p className="text-sm sm:text-base text-text font-normal leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>

      <div className="w-full h-[1px] bg-gradient-to-r from-[var(--primary)]/0 via-[var(--primary)]/20 to-[var(--primary)]/0 mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </article>
  );
};

// Features Dataset
const FEATURES = [
  {
    id: "strategy",
    icon: Target,
    heading: "Academy-Built Strategy",
    description:
      "Tested and refined methodologies engineered for disciplined, institutional market execution.",
  },
  {
    id: "community",
    icon: Users,
    heading: "Proven Learning Community",
    description:
      "Engage with active traders, exchange real-time market analysis and grow together in a focused ecosystem.",
  },
  {
    id: "mentorship",
    icon: ShieldCheck,
    heading: "Mentor-Led Support",
    description:
      "Direct guidance and continuous review from experienced traders to correct mistakes and build consistency.",
  },
  {
    id: "curriculum",
    icon: BookOpen,
    heading: "Structured Curriculum",
    description:
      "Step-by-step comprehensive modules taking you from market fundamentals to quantitative strategy design.",
  },
];

export default function WhyChooseAegis() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);

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
        return;
      }

      gsap.set(labelRef.current, { opacity: 0, y: 25 });
      gsap.set(headingRef.current, { opacity: 0, y: 35 });
      gsap.set(paragraphRef.current, { opacity: 0, y: 25 });
      gsap.set(statsRef.current, { opacity: 0, y: 25 });
      gsap.set(ctaRef.current, { opacity: 0, y: 20 });
      if (cardsGridRef.current) {
        gsap.set(cardsGridRef.current.children, { opacity: 0, y: 45, scale: 0.95 });
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
        .to(paragraphRef.current, { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
        .to(statsRef.current, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4")
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4");

      const statsObj = { members: 0, years: 0, hours: 0 };
      tl.to(
        statsObj,
        {
          members: 120,
          years: 4,
          hours: 15,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: () => {
            setMembersCount(Math.floor(statsObj.members));
            setYearsCount(Math.floor(statsObj.years));
            setHoursCount(Math.floor(statsObj.hours));
          },
        },
        "-=0.9",
      );

      if (cardsGridRef.current) {
        tl.to(
          cardsGridRef.current.children,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: "back.out(1.2)",
          },
          "-=1.5",
        );

        Array.from(cardsGridRef.current.children).forEach((card, index) => {
          gsap.to(card, {
            y: index % 2 === 0 ? "-=8" : "+=8",
            duration: 3.5 + index * 0.4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 1.5 + index * 0.2,
          });
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
      id="why-choose-aegis"
      aria-label="Why Choose Aegis Section"
      className="relative w-full py-28 lg:py-36 bg-background text-white overflow-hidden "
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(30,30,30,0.6)_0%,var(--background)_75%)]" />
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-150 h-150 gold-radial-glow opacity-30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-137.5 h-137.5 gold-radial-glow opacity-20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,var(--background)_100%)] opacity-80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 flex flex-col items-start text-left space-y-6 sm:space-y-8">
            <div ref={labelRef}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-[var(--primary)]/30 text-xs font-semibold tracking-widest text-[var(--primary)] uppercase font-mono shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                WHY CHOOSE AEGIS
              </div>
            </div>

            <h2
              ref={headingRef}
              className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12] font-sans"
            >
              Discipline Creates <br />
              <span className="gold-gradient-text">Consistent Traders.</span>
            </h2>

            <p
              ref={paragraphRef}
              className="text-base sm:text-lg text-[var(--text)] font-normal leading-relaxed text-zinc-300 max-w-[520px]"
            >
              At Aegis Trading Academy, we don&apos;t sell shortcuts or false promises. We
              build disciplined traders through structured education, practical market
              experience and continuous mentorship.
            </p>

            <div
              ref={statsRef}
              className="grid grid-cols-3 gap-4 sm:gap-6 pt-4 pb-2 border-y border-white/10 w-full"
            >
              <div>
                <span className="block text-2xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                  {membersCount}+
                </span>
                <span className="text-xs sm:text-sm text-muted font-medium">
                  Active Members
                </span>
              </div>

              <div>
                <span className="block text-2xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                  {yearsCount}+
                </span>
                <span className="text-xs sm:text-sm text-muted font-medium">
                  Years Experience
                </span>
              </div>

              <div>
                <span className="block text-2xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                  {hoursCount}+
                </span>
                <span className="text-xs sm:text-sm text-muted font-medium">
                  Hours of Learning
                </span>
              </div>
            </div>

            <div ref={ctaRef} className="w-full sm:w-auto pt-2">
              <a
                href="#register"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-sm sm:text-base tracking-wide bg-gradient-to-r from-[var(--primary-light)] via-[var(--primary)] to-[var(--primary-dark)] text-black shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto text-center"
              >
                <span>Start Your Journey</span>
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div
              ref={cardsGridRef}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 items-start"
            >
              <div className="space-y-6 sm:space-y-8">
                <FeatureCard
                  icon={FEATURES[0].icon}
                  heading={FEATURES[0].heading}
                  description={FEATURES[0].description}
                  className="min-h-[220px]"
                />

                <FeatureCard
                  icon={FEATURES[2].icon}
                  heading={FEATURES[2].heading}
                  description={FEATURES[2].description}
                  className="min-h-[240px] sm:translate-y-4"
                />
              </div>

              <div className="space-y-6 sm:space-y-8 sm:mt-10">
                <FeatureCard
                  icon={FEATURES[1].icon}
                  heading={FEATURES[1].heading}
                  description={FEATURES[1].description}
                  className="min-h-[240px]"
                />

                <FeatureCard
                  icon={FEATURES[3].icon}
                  heading={FEATURES[3].heading}
                  description={FEATURES[3].description}
                  className="min-h-[220px] sm:translate-y-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
