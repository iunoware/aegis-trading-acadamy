"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Lock,
  Zap,
  Smartphone,
  Mail,
  ShieldCheck,
  Check,
  ArrowRight,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import axios from "axios";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Sub-component: PricingFeature

interface PricingFeatureProps {
  text: string;
  isPopularPlan?: boolean;
}

const PricingFeature: React.FC<PricingFeatureProps> = ({
  text,
  isPopularPlan = false,
}) => {
  return (
    <li className="flex items-start gap-3 py-1.5 text-sm sm:text-base text-zinc-300 font-normal leading-normal">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          isPopularPlan
            ? "bg-[var(--primary)] text-black shadow-[0_0_10px_rgba(212,175,55,0.4)]"
            : "bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--primary)]"
        }`}
      >
        <Check size={12} strokeWidth={3} />
      </div>
      <span className="text-zinc-200">{text}</span>
    </li>
  );
};

// Sub-component: TrustItem

interface TrustItemProps {
  icon: LucideIcon;
  text: string;
}

const TrustItem: React.FC<TrustItemProps> = ({ icon: Icon, text }) => {
  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-300">
      <div className="w-7 h-7 rounded-full bg-(--primary)/10 border border-(--primary)/20 flex items-center justify-center text-[var(--primary)] shrink-0">
        <Icon size={14} />
      </div>
      <span className="whitespace-nowrap tracking-wide">{text}</span>
    </div>
  );
};

// Sub-component: PaymentMethod

// interface PaymentMethodProps {
//   name: string;
// }

// const PaymentMethod: React.FC<PaymentMethodProps> = ({ name }) => {
//   return (
//     <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg glass-panel border border-white/10 text-xs font-mono font-semibold tracking-wider text-zinc-400 uppercase hover:text-primary hover:border-(--primary)/30 transition-colors duration-300">
//       <span className="w-1.5 h-1.5 rounded-full bg-(--primary)/60" />
//       <span>{name}</span>
//     </div>
//   );
// };

// Sub-component: PricingCard

interface PricingPlan {
  id: string;
  title: string;
  price: string;
  subtitle: string;
  savingsLabel?: string;
  isPopular?: boolean;
  popularBadgeText?: string;
  features: string[];
  buttonText: string;
  buttonHref: string;
}

interface ApiPlanFeature {
  id: string;
  text: string;
}

interface ApiPricingPlan {
  id: "monthly" | "yearly";
  databaseId: string;
  name: string;
  price: number;
  billingCycle: "Monthly" | "Yearly";
  badge: "Popular" | "Best Value" | "Recommended" | "None";
  status: boolean;
  description: string;
  features: ApiPlanFeature[];
}

interface PricingApiResponse {
  success: boolean;
  message: string;
  data: {
    monthly: ApiPricingPlan | null;
    yearly: ApiPricingPlan | null;
  };
}

interface PricingCardProps {
  plan: PricingPlan;
  className?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, className = "" }) => {
  const {
    title,
    price,
    subtitle,
    savingsLabel,
    isPopular,
    popularBadgeText,
    features,
    buttonText,
    buttonHref,
  } = plan;

  return (
    <article
      className={`relative rounded-3xl glass-panel p-8 sm:p-10 flex flex-col justify-between h-full transition-all duration-350 ease-out border ${
        isPopular
          ? "border-(--primary)/50 shadow-[0_20px_50px_rgba(212,175,55,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] bg-linear-to-b from-[#181818]/90 to-[#0d0d0d]/90"
          : "border-white/10 hover:border-(--primary)/30 bg-[#121212]/60"
      } hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_35px_rgba(212,175,55,0.2)] cursor-pointer ${className}`}
    >
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-primary text-black text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(212,175,55,0.5)] animate-pulse">
            <Sparkles size={12} className="fill-black" />
            <span>{popularBadgeText || "MOST POPULAR"}</span>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            {title}
          </h3>

          {savingsLabel && (
            <span className="px-3 py-1 rounded-full bg-(--primary)/15 border border-(--primary)/30 text-primary text-xs font-bold font-mono tracking-wide uppercase">
              {savingsLabel}
            </span>
          )}
        </div>

        <div className="mb-8 pb-6 border-b border-white/10">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-6xl font-extrabold font-mono gold-gradient-text tracking-tight">
              {price}
            </span>
            <span className="text-sm sm:text-base text-muted font-mono uppercase tracking-wider">
              / {subtitle}
            </span>
          </div>
        </div>

        <ul className="space-y-3 mb-8" aria-label={`${title} Features`}>
          {features.map((feature, idx) => (
            <PricingFeature
              key={`${plan.id}-feat-${idx}`}
              text={feature}
              isPopularPlan={isPopular}
            />
          ))}
        </ul>
      </div>

      <div className="pt-4">
        <a
          href={buttonHref}
          aria-label={buttonText}
          className={`w-full group inline-flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-sm sm:text-base tracking-wider uppercase transition-all duration-300 transform active:translate-y-0 text-center ${
            isPopular
              ? "bg-linear-to-r from-primary-light via-primary to-primary-dark text-black "
              : "glass-panel text-white hover:text-primary border border-white/15 hover:border-(--primary)/40"
          }`}
        >
          <span>{buttonText}</span>
          <ArrowRight
            size={18}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </a>
      </div>
    </article>
  );
};

// Datasets
// const PRICING_PLANS: PricingPlan[] = [
//   {
//     id: "monthly",
//     title: "Monthly Membership",
//     price: "$49",
//     subtitle: "Per Month",
//     features: [
//       "Full Course Library",
//       "Live Trading Sessions",
//       "Community Access",
//       "Course Updates",
//       "Mobile & Desktop Access",
//     ],
//     buttonText: "Start Monthly Plan",
//     buttonHref: "#checkout-monthly",
//     isPopular: false,
//   },
//   {
//     id: "yearly",
//     title: "Yearly Membership",
//     price: "$300",
//     subtitle: "Per Year",
//     savingsLabel: "Save 20%",
//     isPopular: true,
//     popularBadgeText: "MOST POPULAR",
//     features: [
//       "Full Course Library",
//       "Live Trading Sessions",
//       "Community Access",
//       "Lifetime Course Updates During Subscription",
//       "Priority Support",
//       "Best Value",
//     ],
//     buttonText: "Start Yearly Plan",
//     buttonHref: "#checkout-yearly",
//   },
// ];

const TRUST_ITEMS = [
  { id: "secure", icon: Lock, text: "Secure Payments" },
  { id: "instant", icon: Zap, text: "Instant Access" },
  { id: "mobile", icon: Smartphone, text: "Learn Anywhere" },
  { id: "renewal", icon: Mail, text: "Renewal Reminder Before Expiry" },
];

// const PAYMENT_METHODS = ["Razorpay", "Visa", "Mastercard", "UPI", "Net Banking"];

function convertApiPlanToPricingPlan(
  plan: ApiPricingPlan,
  monthlyPrice?: number,
): PricingPlan {
  let savingsLabel: string | undefined;

  if (plan.id === "yearly" && monthlyPrice) {
    const yearlyMonthlyCost = monthlyPrice * 12;
    const savingsAmount = yearlyMonthlyCost - plan.price;

    if (savingsAmount > 0) {
      const savingsPercentage = Math.round((savingsAmount / yearlyMonthlyCost) * 100);

      savingsLabel = `Save ${savingsPercentage}%`;
    }
  }

  return {
    id: plan.id,
    title: plan.name,
    price: `$${plan.price.toLocaleString("en-US")}`,
    subtitle: plan.id === "monthly" ? "Per Month" : "Per Year",
    savingsLabel,
    isPopular:
      plan.badge === "Popular" ||
      plan.badge === "Best Value" ||
      plan.badge === "Recommended",
    popularBadgeText: plan.badge === "None" ? undefined : plan.badge.toUpperCase(),
    features: plan.features.map((feature) => feature.text),
    buttonText: plan.id === "monthly" ? "Start Monthly Plan" : "Start Yearly Plan",
    buttonHref: plan.id === "monthly" ? "#checkout-monthly" : "#checkout-yearly",
  };
}

function PricingCardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-130">
      <div className="h-full min-h-130 animate-pulse rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-10">
        <div className="mb-8 h-7 w-40 rounded bg-white/10" />

        <div className="mb-8 h-14 w-52 rounded bg-white/10" />

        <div className="space-y-4">
          <div className="h-5 w-full rounded bg-white/10" />
          <div className="h-5 w-11/12 rounded bg-white/10" />
          <div className="h-5 w-10/12 rounded bg-white/10" />
          <div className="h-5 w-9/12 rounded bg-white/10" />
        </div>

        <div className="mt-12 h-14 w-full rounded-xl bg-white/10" />
      </div>
    </div>
  );
}

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);
  const trustStripRef = useRef<HTMLDivElement>(null);
  // const paymentSectionRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPricing = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await axios.get<PricingApiResponse>("/api/pricing");

      const monthlyPlan = response.data.data.monthly;
      const yearlyPlan = response.data.data.yearly;

      const formattedPlans: PricingPlan[] = [];

      if (monthlyPlan?.status) {
        formattedPlans.push(convertApiPlanToPricingPlan(monthlyPlan));
      }

      if (yearlyPlan?.status) {
        formattedPlans.push(convertApiPlanToPricingPlan(yearlyPlan, monthlyPlan?.price));
      }

      setPricingPlans(formattedPlans);
    } catch (error) {
      console.error("Failed to fetch pricing plans:", error);
      setPricingPlans([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  // GSAP
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
            cardsGridRef.current?.children,
            trustStripRef.current,
            // paymentSectionRef.current,
          ],
          { opacity: 1, y: 0 },
        );
        return;
      }

      gsap.set(labelRef.current, { opacity: 0, y: 20 });
      gsap.set(headingRef.current, { opacity: 0, y: 30 });
      gsap.set(paragraphRef.current, { opacity: 0, y: 25 });
      if (cardsGridRef.current) {
        gsap.set(cardsGridRef.current.children, {
          opacity: 0,
          y: 40,
          scale: 0.96,
        });
      }
      gsap.set(trustStripRef.current, { opacity: 0, y: 20 });
      // if (paymentSectionRef.current) {
      //   gsap.set(paymentSectionRef.current.children, { opacity: 0, y: 15 });
      // }

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

      if (cardsGridRef.current) {
        tl.to(
          cardsGridRef.current.children,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.2,
            ease: "back.out(1.2)",
          },
          "-=0.4",
        );
      }

      tl.to(trustStripRef.current, { opacity: 1, y: 0, duration: 0.7 }, "-=0.3");

      // if (paymentSectionRef.current) {
      //   tl.to(
      //     paymentSectionRef.current.children,
      //     {
      //       opacity: 1,
      //       y: 0,
      //       duration: 0.6,
      //       stagger: 0.1,
      //     },
      //     "-=0.4",
      //   );
      // }

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
      id="pricing"
      aria-label="Pricing Section"
      className="relative w-full py-10 lg:py-15 bg-background text-white overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          ref={glowRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 rounded-full gold-radial-glow opacity-30 blur-3xl transform-gpu"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div ref={labelRef} className="mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-(--primary)/30 text-xs font-semibold tracking-widest text-primary font-mono uppercase bg-(--primary)/5">
            <ShieldCheck size={14} className="text-primary" />
            PRICING
          </div>
        </div>

        <h2
          ref={headingRef}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans mb-4 text-center max-w-3xl"
        >
          Invest in Your <br />
          <span className="gold-gradient-text">Trading Future.</span>
        </h2>

        <p
          ref={paragraphRef}
          className="text-base sm:text-lg text-text font-normal leading-relaxed max-w-162.5 text-center mb-16 sm:mb-20"
        >
          Choose the membership plan that fits your learning journey. Every subscription
          gives you access to our structured curriculum, live sessions, community, and
          continuous course updates.
        </p>

        {/* <div
          ref={cardsGridRef}
          className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-220 mx-auto items-stretch mb-16 sm:mb-20"
        >
          {pricingPlans.map((plan) => (
            <div key={plan.id} className="w-full max-w-130 mx-auto">
              <PricingCard plan={plan} />
            </div>
          ))}
        </div> */}
        <div
          ref={cardsGridRef}
          className="mb-16 grid w-full max-w-220 grid-cols-1 items-stretch gap-8 sm:mb-20 md:grid-cols-2 lg:gap-10"
        >
          {isLoading ? (
            <>
              <PricingCardSkeleton />
              <PricingCardSkeleton />
            </>
          ) : pricingPlans.length > 0 ? (
            pricingPlans.map((plan) => (
              <div key={plan.id} className="mx-auto w-full max-w-130">
                <PricingCard plan={plan} />
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <p className="text-sm text-zinc-400">
                No active pricing plans are currently available.
              </p>
            </div>
          )}
        </div>

        <div
          ref={trustStripRef}
          className="w-full max-w-270 mx-auto glass-panel border border-white/10 rounded-2xl py-4 px-6 mb-12"
        >
          <div className="flex flex-wrap items-center justify-around gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {TRUST_ITEMS.map((item) => (
              <TrustItem key={item.id} icon={item.icon} text={item.text} />
            ))}
          </div>
        </div>

        {/* <div
          ref={paymentSectionRef}
          className="flex flex-col items-center space-y-4 text-center"
        >
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-muted">
            Secure Payments Accepted
          </span>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {PAYMENT_METHODS.map((method) => (
              <PaymentMethod key={method} name={method} />
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
}
