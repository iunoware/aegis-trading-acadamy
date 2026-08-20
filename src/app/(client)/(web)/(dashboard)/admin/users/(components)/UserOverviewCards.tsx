"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Users, ShieldCheck, UserX, UserPlus } from "lucide-react";

export interface UserKpi {
  id: string;
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
}

interface UserOverviewCardsProps {
  totalRegistered: number;
  subscribedCount: number;
  nonSubscribedCount: number;
  newThisMonth: number;
}

export function UserOverviewCards({
  totalRegistered,
  subscribedCount,
  nonSubscribedCount,
  newThisMonth,
}: UserOverviewCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const currentMonthYear = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const kpis: UserKpi[] = [
    {
      id: "total-registered",
      title: "Total Registered Users",
      value: totalRegistered,
      description: "Master account directory",
      icon: Users,
    },
    {
      id: "subscribed-users",
      title: "Subscribed Users",
      value: subscribedCount,
      description: "Active Academy Pass",
      icon: ShieldCheck,
    },
    {
      id: "non-subscribed-users",
      title: "Non-Subscribed Users",
      value: nonSubscribedCount,
      description: "Free registered accounts",
      icon: UserX,
    },
    {
      id: "new-this-month",
      title: "New Users This Month",
      value: newThisMonth,
      description: `Joined in ${currentMonthYear}`,
      icon: UserPlus,
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
          }
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
  }, [totalRegistered, subscribedCount, nonSubscribedCount, newThisMonth]);

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {kpis.map((kpi, idx) => {
        const IconComponent = kpi.icon;
        return (
          <div
            key={kpi.id}
            className="group rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-4.5 flex flex-col justify-between hover:border-[#C9A227]/40 hover:bg-[#151518] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          >
            {/* Top Row: Icon */}
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] shadow-sm group-hover:scale-105 transition-transform duration-200">
                <IconComponent size={18} />
              </div>
            </div>

            {/* Middle: Title & Value */}
            <div>
              <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider block mb-1">
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
            <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-zinc-500 font-mono flex items-center justify-between">
              <span>{kpi.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
