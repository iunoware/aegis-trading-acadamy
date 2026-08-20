"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  ShieldCheck,
  Calendar,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export interface EnrollmentKpi {
  id: string;
  title: string;
  value: number;
  description: string;
  trend: string;
  isUp: boolean;
  icon: React.ElementType;
}

interface EnrollmentOverviewCardsProps {
  activeCount: number;
  monthlyCount: number;
  yearlyCount: number;
  expiringSoonCount: number;
  expiredCount: number;
}

export function EnrollmentOverviewCards({
  activeCount,
  monthlyCount,
  yearlyCount,
  expiringSoonCount,
  expiredCount,
}: EnrollmentOverviewCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const kpis: EnrollmentKpi[] = [
    {
      id: "active-enrollments",
      title: "Active Enrollments",
      value: activeCount,
      description: "Currently active passes",
      trend: "+8.5%",
      isUp: true,
      icon: ShieldCheck,
    },
    {
      id: "monthly-plans",
      title: "Monthly Plans",
      value: monthlyCount,
      description: "$999/month subscriptions",
      trend: "+6.2%",
      isUp: true,
      icon: Calendar,
    },
    {
      id: "yearly-plans",
      title: "Yearly Plans",
      value: yearlyCount,
      description: "$7,999/year subscriptions",
      trend: "+14.1%",
      isUp: true,
      icon: Users,
    },
    {
      id: "expiring-soon",
      title: "Expiring Soon",
      value: expiringSoonCount,
      description: "Expires within 7 days",
      trend: "-2.4%",
      isUp: false,
      icon: AlertTriangle,
    },
    {
      id: "expired-enrollments",
      title: "Expired",
      value: expiredCount,
      description: "Pending renewal action",
      trend: "-4.0%",
      isUp: false,
      icon: Clock,
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current.children,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.08,
            ease: "power2.out",
          },
        );
      }

      kpis.forEach((kpi, idx) => {
        const numEl = numberRefs.current[idx];
        if (!numEl) return;

        const targetVal = kpi.value;
        const obj = { val: 0 };

        gsap.to(obj, {
          val: targetVal,
          duration: 1.2,
          ease: "power2.out",
          onUpdate: () => {
            if (numEl) {
              numEl.innerText = Math.round(obj.val).toLocaleString("en-US");
            }
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [activeCount, monthlyCount, yearlyCount, expiringSoonCount, expiredCount]);

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
    >
      {kpis.map((kpi, idx) => {
        const IconComponent = kpi.icon;
        return (
          <div
            key={kpi.id}
            className="group rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-4 flex flex-col justify-between hover:border-[#C9A227]/40 hover:bg-[#151518] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          >
            {/* Top Row: Icon & Trend */}
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] shadow-sm group-hover:scale-105 transition-transform duration-200">
                <IconComponent size={16} />
              </div>

              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                  kpi.isUp
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {kpi.isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                <span>{kpi.trend}</span>
              </div>
            </div>

            {/* Middle: Title & Value */}
            <div>
              <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider block mb-1">
                {kpi.title}
              </span>
              <div className="text-2xl font-extrabold text-white font-sans tracking-tight">
                <span
                  ref={(el) => {
                    numberRefs.current[idx] = el;
                  }}
                >
                  0
                </span>
              </div>
            </div>

            {/* Bottom: Description */}
            <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-zinc-500 font-mono">
              <span>{kpi.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
