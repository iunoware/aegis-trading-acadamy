"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  IndianRupee,
  Users,
  ShieldCheck,
  BookOpen,
  ShoppingBag,
  Award,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  UserPlus,
  ChevronRight,
  MessageSquareQuote,
  FolderTree,
  UserRound,
} from "lucide-react";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  deletedAt: string | null;
};

export type KpiItem = {
  id: string;
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  description: string;
  trend: string;
  isUp: boolean;
  icon: React.ElementType;
};

export type RecentOrder = {
  id: string;
  student: string;
  email: string;
  plan: string;
  amount: string;
  status: string;
  date: string;
};

export type LatestUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: string;
  joined: string;
};

export type RecentEnrollment = {
  id: string;
  student: string;
  avatar: string;
  course: string;
  plan: string;
  time: string;
};

export type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  iconCategory?: string;
};

export type TopPlan = {
  id: string;
  name: string;
  billing: string;
  revenue: string;
  growth: string;
};

export type TopCourse = {
  id: string;
  title: string;
  students: string;
  revenue: string;
  completion: string;
};

export type DashboardData = {
  range: string;
  kpis: {
    revenue: {
      title: string;
      value: number;
      prefix: string;
      description: string;
      trend: string;
      isUp: boolean;
    };
    students: {
      title: string;
      value: number;
      prefix: string;
      description: string;
      trend: string;
      isUp: boolean;
    };
    subscriptions: {
      title: string;
      value: number;
      prefix: string;
      description: string;
      trend: string;
      isUp: boolean;
    };
    monthlySubscribers: {
      title: string;
      value: number;
      prefix: string;
      description: string;
      trend: string;
      isUp: boolean;
    };
    yearlySubscribers: {
      title: string;
      value: number;
      prefix: string;
      description: string;
      trend: string;
      isUp: boolean;
    };
  };
  revenueChart: {
    buckets: { label: string; amount: number }[];
    peakDayLabel: string;
  };
  subscriptionsDistribution: {
    total: number;
    monthly: { count: number; percent: number };
    yearly: { count: number; percent: number };
    inactive: { count: number; percent: number };
  };
  recentOrders: RecentOrder[];
  latestUsers: LatestUser[];
  recentEnrollments: RecentEnrollment[];
  recentActivities: ActivityItem[];
  topPlans: TopPlan[];
  topCourses: TopCourse[];
  footerStats: {
    testimonials: string;
    certificates: string;
    mentors: string;
    categories: string;
    pendingReviews: string;
  };
};

// 1. DASHBOARD HEADER COMPONENT

export function DashboardHeader({ admin }: { admin: AdminUser | null }) {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [greeting, setGreeting] = useState("Good Morning");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 17) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");

      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }) + " IST",
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
      {/* Left: Greeting */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 text-[11px] font-mono uppercase tracking-widest text-[#C9A227] mb-2">
          <ShieldCheck size={13} />
          ADMIN DASHBOARD
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
          {greeting}, {admin?.name || "Super Admin"}
        </h1>
        <p className="text-sm text-zinc-400 mt-1 font-normal">
          Here&apos;s what&apos;s happening in your academy today.
        </p>
      </div>

      {/* Right: Date, Time & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Time & Date Display */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#111113]/90 border border-white/10 text-xs font-mono text-zinc-300 shadow-inner">
          <Calendar size={14} className="text-[#C9A227]" />
          <span>{currentDate || "Loading date..."}</span>
          <span className="text-zinc-600">|</span>
          <Clock size={14} className="text-[#C9A227]" />
          <span className="text-white font-semibold">
            {currentTime || "Loading time..."}
          </span>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <a
            href="/admin/courses"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] text-black transition-all duration-200 cursor-pointer hover:brightness-110"
          >
            <Plus size={14} className="stroke-3" />
            <span>Add Course</span>
          </a>

          <a
            href="/admin/mentors"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#161619] border border-white/15 text-zinc-200 hover:text-white hover:border-[#C9A227]/50 hover:bg-[#C9A227]/10 transition-all duration-200 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Mentor</span>
          </a>

          <a
            href="/admin/pricing"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#161619] border border-white/15 text-zinc-200 hover:text-white hover:border-[#C9A227]/50 hover:bg-[#C9A227]/10 transition-all duration-200 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Plan</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// 2. KPI SECTION COMPONENT WITH GSAP COUNT-UP ANIMATION

export function KPISection({
  kpis,
  loading,
}: {
  kpis?: DashboardData["kpis"] | null;
  loading?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const kpiItems: KpiItem[] = [
    {
      id: "revenue",
      title: kpis?.revenue?.title || "Total Revenue",
      value: kpis?.revenue?.value ?? 0,
      prefix: "₹",
      description: kpis?.revenue?.description || "vs previous period",
      trend: kpis?.revenue?.trend || "0%",
      isUp: kpis?.revenue?.isUp ?? true,
      icon: IndianRupee,
    },
    {
      id: "students",
      title: kpis?.students?.title || "Total Students",
      value: kpis?.students?.value ?? 0,
      prefix: "",
      description: kpis?.students?.description || "Total Enrolled",
      trend: kpis?.students?.trend || "0%",
      isUp: kpis?.students?.isUp ?? true,
      icon: Users,
    },
    {
      id: "subscriptions",
      title: kpis?.subscriptions?.title || "Active Subscriptions",
      value: kpis?.subscriptions?.value ?? 0,
      prefix: "",
      description: kpis?.subscriptions?.description || "Currently Active",
      trend: kpis?.subscriptions?.trend || "0%",
      isUp: kpis?.subscriptions?.isUp ?? true,
      icon: ShieldCheck,
    },
    {
      id: "monthly",
      title: kpis?.monthlySubscribers?.title || "Monthly Plan Subscribers",
      value: kpis?.monthlySubscribers?.value ?? 0,
      prefix: "",
      description: kpis?.monthlySubscribers?.description || "Active Monthly",
      trend: kpis?.monthlySubscribers?.trend || "0%",
      isUp: kpis?.monthlySubscribers?.isUp ?? true,
      icon: BookOpen,
    },
    {
      id: "yearly",
      title: kpis?.yearlySubscribers?.title || "Yearly Plan Subscribers",
      value: kpis?.yearlySubscribers?.value ?? 0,
      prefix: "",
      description: kpis?.yearlySubscribers?.description || "Active Yearly",
      trend: kpis?.yearlySubscribers?.trend || "0%",
      isUp: kpis?.yearlySubscribers?.isUp ?? true,
      icon: ShoppingBag,
    },
  ];

  useEffect(() => {
    if (loading || !kpis) return;

    const ctx = gsap.context(() => {
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current.children,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
          },
        );
      }

      kpiItems.forEach((kpi, idx) => {
        const numEl = numberRefs.current[idx];
        if (!numEl) return;

        const targetVal = kpi.value;
        const obj = { val: 0 };

        gsap.to(obj, {
          val: targetVal,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            if (numEl) {
              if (kpi.prefix === "₹") {
                numEl.innerText = Math.round(obj.val).toLocaleString("en-IN");
              } else {
                numEl.innerText = Math.round(obj.val).toLocaleString("en-US");
              }
            }
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [kpis, loading]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-[#111113]/80 border border-white/10 p-4 h-36 animate-pulse flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-white/10" />
            <div className="space-y-2">
              <div className="h-3 bg-white/10 rounded w-1/2" />
              <div className="h-6 bg-white/10 rounded w-3/4" />
            </div>
            <div className="h-2 bg-white/5 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
    >
      {kpiItems.map((kpi, idx) => {
        const IconComponent = kpi.icon;
        return (
          <div
            key={kpi.id}
            className="group rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-4 flex flex-col justify-between hover:border-[#C9A227]/40 hover:bg-[#151518] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            {/* Top row: Icon & Trend badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] shadow-sm group-hover:scale-105 transition-transform duration-200">
                <IconComponent size={18} />
              </div>

              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium ${
                  kpi.isUp
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {kpi.isUp ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                <span>{kpi.trend}</span>
              </div>
            </div>

            {/* Middle: Title & Number */}
            <div>
              <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider block mb-1">
                {kpi.title}
              </span>
              <div className="text-2xl font-extrabold text-white font-sans tracking-tight flex items-baseline gap-0.5">
                {kpi.prefix && (
                  <span className="text-[#C9A227]">{kpi.prefix}</span>
                )}
                <span
                  ref={(el) => {
                    numberRefs.current[idx] = el;
                  }}
                >
                  {kpi.value.toLocaleString()}
                </span>
                {kpi.suffix && (
                  <span className="text-[#C9A227] text-lg">{kpi.suffix}</span>
                )}
              </div>
            </div>

            {/* Bottom: Small Description */}
            <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-zinc-500 font-mono flex items-center justify-between">
              <span>{kpi.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 3. ANALYTICS ROW: REVENUE CHART & SUBSCRIPTION DONUT

export function AnalyticsRow({
  revenueChart,
  subscriptionsDistribution,
  timeRange,
  onTimeRangeChange,
  loading,
  analyticsLoading,
}: {
  revenueChart?: DashboardData["revenueChart"];
  subscriptionsDistribution?: DashboardData["subscriptionsDistribution"];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  loading?: boolean;
  analyticsLoading?: boolean;
}) {
  const buckets = revenueChart?.buckets || [];
  const maxAmount = Math.max(...buckets.map((b) => b.amount), 1);

  // SVG Line Chart Coordinate Generator (width: 700, height: 200)
  const svgWidth = 700;
  const svgHeight = 200;
  const padding = 20;

  const points = buckets.map((b, idx) => {
    const x =
      buckets.length > 1
        ? (idx / (buckets.length - 1)) * (svgWidth - 2 * padding) + padding
        : svgWidth / 2;
    const y =
      svgHeight - padding - (b.amount / maxAmount) * (svgHeight - 2 * padding);
    return { x, y, amount: b.amount, label: b.label };
  });

  let lineD = "";
  let areaD = "";

  if (points.length > 0) {
    if (points.length === 1) {
      lineD = `M 0,${points[0].y} L 700,${points[0].y}`;
      areaD = `M 0,${points[0].y} L 700,${points[0].y} L 700,200 L 0,200 Z`;
    } else {
      lineD = `M ${points[0].x},${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cx = (p0.x + p1.x) / 2;
        lineD += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
      }

      const firstX = points[0].x;
      const lastX = points[points.length - 1].x;
      areaD = `${lineD} L ${lastX},200 L ${firstX},200 Z`;
    }
  }

  // Donut chart calculations
  const totalSub = subscriptionsDistribution?.total || 0;
  const mPct = subscriptionsDistribution?.monthly?.percent || 0;
  const yPct = subscriptionsDistribution?.yearly?.percent || 0;
  const iPct = subscriptionsDistribution?.inactive?.percent || 0;

  const circumference = 238.76;
  const monthlyDash = (mPct / 100) * circumference;
  const yearlyDash = (yPct / 100) * circumference;
  const inactiveDash = (iPct / 100) * circumference;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: Revenue Analytics Line Chart (8 Cols) */}
      <div className="lg:col-span-8 rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        {/* Header & Range Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
              <span>Revenue Analytics</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30">
                INR (₹)
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Gross revenue generated across all plans & masterclasses.
            </p>
          </div>

          {/* Timeframe Controls */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#09090b] border border-white/10">
            {["7D", "30D", "3M", "1Y"].map((range) => (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all duration-200 cursor-pointer ${
                  timeRange === range
                    ? "bg-[#C9A227] text-black shadow-[0_0_10px_rgba(201,162,39,0.5)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic SVG Line Chart */}
        <div className="relative w-full h-60 flex items-end">
          {loading && !analyticsLoading ? (
            <div className="w-full h-full animate-pulse bg-white/5 rounded-xl flex items-center justify-center text-xs font-mono text-zinc-500">
              Loading revenue chart...
            </div>
          ) : (
            <div className="relative w-full h-full">
              {analyticsLoading && (
                <div className="absolute top-2 left-2 z-10 bg-[#18181c]/90 border border-[#C9A227]/40 rounded-xl px-2.5 py-1 text-[11px] font-mono text-[#C9A227] shadow-lg animate-pulse flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-ping" />
                  <span>Updating analytics...</span>
                </div>
              )}
              <svg
                className={`w-full h-full overflow-visible transition-opacity duration-200 ${
                  analyticsLoading ? "opacity-50" : "opacity-100"
                }`}
                viewBox="0 0 700 220"
                fill="none"
              >
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#C9A227" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#C9A227" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line
                  x1="0"
                  y1="40"
                  x2="700"
                  y2="40"
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="4 4"
                />
                <line
                  x1="0"
                  y1="90"
                  x2="700"
                  y2="90"
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="4 4"
                />
                <line
                  x1="0"
                  y1="140"
                  x2="700"
                  y2="140"
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="4 4"
                />
                <line
                  x1="0"
                  y1="190"
                  x2="700"
                  y2="190"
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="4 4"
                />

                {/* Gradient Fill Area */}
                {areaD && <path d={areaD} fill="url(#revenueGradient)" />}

                {/* Main Smooth Curve Line */}
                {lineD && (
                  <path
                    d={lineD}
                    stroke="#C9A227"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}

                {/* Highlight Data Points */}
                {points.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#C9A227"
                    stroke="#050505"
                    strokeWidth="2"
                  />
                ))}
              </svg>
            </div>
          )}

          {/* Peak Tooltip Overlay */}
          <div className="absolute top-2 right-4 bg-[#18181c] border border-[#C9A227]/40 rounded-xl px-3 py-1.5 text-xs font-mono text-white shadow-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-ping" />
            <span>{revenueChart?.peakDayLabel || "Peak: ₹0"}</span>
          </div>
        </div>

        {/* X-Axis Month Labels */}
        <div className="flex justify-between items-center text-xs font-mono text-zinc-500 pt-3 border-t border-white/5">
          {buckets.length > 0 ? (
            buckets.slice(0, 8).map((b, i) => <span key={i}>{b.label}</span>)
          ) : (
            <>
              <span>Start</span>
              <span>End</span>
            </>
          )}
        </div>
      </div>

      {/* RIGHT: Subscription Distribution Donut Chart (4 Cols) */}
      <div className="lg:col-span-4 rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div>
          <h3 className="text-lg font-bold text-white font-sans">
            Subscription Distribution
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Active plan breakdown by billing type.
          </p>
        </div>

        {/* SVG Donut Chart */}
        <div className="relative w-full h-45 my-4 flex items-center justify-center">
          <svg
            className="w-42.5 h-42.5 transform -rotate-90"
            viewBox="0 0 100 100"
          >
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="12"
              fill="none"
            />
            {/* Monthly Pass - Gold */}
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#C9A227"
              strokeWidth="12"
              strokeDasharray={`${monthlyDash} ${circumference}`}
              fill="none"
            />
            {/* Yearly Annual - Amber */}
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#e6c55a"
              strokeWidth="12"
              strokeDasharray={`${yearlyDash} ${circumference}`}
              strokeDashoffset={-monthlyDash}
              fill="none"
            />
            {/* Expired / Inactive - Zinc */}
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#52525b"
              strokeWidth="12"
              strokeDasharray={`${inactiveDash} ${circumference}`}
              strokeDashoffset={-(monthlyDash + yearlyDash)}
              fill="none"
            />
          </svg>

          {/* Center Total Count */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold text-white font-sans">
              {totalSub}
            </span>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              Total Plans
            </span>
          </div>
        </div>

        {/* Donut Legend Items */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#C9A227]" />
              <span className="text-zinc-300 font-medium">Monthly Pass</span>
            </div>
            <span className="font-mono text-white font-bold">
              {subscriptionsDistribution?.monthly?.count ?? 0} ({mPct}%)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#e6c55a]" />
              <span className="text-zinc-300 font-medium">Yearly Annual</span>
            </div>
            <span className="font-mono text-white font-bold">
              {subscriptionsDistribution?.yearly?.count ?? 0} ({yPct}%)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zinc-600" />
              <span className="text-zinc-300 font-medium">
                Expired / Inactive
              </span>
            </div>
            <span className="font-mono text-zinc-400">
              {subscriptionsDistribution?.inactive?.count ?? 0} ({iPct}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. SECOND ROW: RECENT ORDERS & LATEST REGISTERED USERS

export function SecondRowCharts({
  recentOrders = [],
  latestUsers = [],
  loading,
}: {
  recentOrders?: RecentOrder[];
  latestUsers?: LatestUser[];
  loading?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: Recent Orders Table (6 Cols) */}
      <div className="lg:col-span-6 rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-sans">
              Recent Orders & Transactions
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Latest payment transactions processed.
            </p>
          </div>
          <a
            href="/admin/payments"
            className="text-xs font-mono text-[#C9A227] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </a>
        </div>

        {/* Orders Table Container */}
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="py-8 text-center text-xs font-mono text-zinc-500 animate-pulse">
              Loading recent orders...
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-zinc-500">
              No recent orders recorded yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-black/40 text-zinc-400 font-mono uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((order) => {
                  let statusStyle = "bg-zinc-800 text-zinc-300 border-zinc-700";
                  if (order.status === "Paid")
                    statusStyle =
                      "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                  else if (order.status === "Pending")
                    statusStyle =
                      "bg-amber-500/10 text-amber-400 border-amber-500/30";
                  else if (order.status === "Failed")
                    statusStyle =
                      "bg-rose-500/10 text-rose-400 border-rose-500/30";
                  else if (order.status === "Refunded")
                    statusStyle =
                      "bg-purple-500/10 text-purple-400 border-purple-500/30";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-white/4 transition-colors duration-150 cursor-pointer"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {order.id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">
                          {order.student}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {order.email}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-zinc-300">{order.plan}</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#C9A227]">
                        {order.amount}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono border ${statusStyle}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-zinc-400 text-[11px]">
                        {order.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* RIGHT: Latest Registered Users (6 Cols) */}
      <div className="lg:col-span-6 rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-sans">
              Latest Registered Users
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Newly onboarded trading accounts.
            </p>
          </div>
          <a
            href="/admin/users"
            className="text-xs font-mono text-[#C9A227] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </a>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="py-8 text-center text-xs font-mono text-zinc-500 animate-pulse">
              Loading registered users...
            </div>
          ) : latestUsers.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-zinc-500">
              No registered students found.
            </div>
          ) : (
            latestUsers.map((usr) => (
              <div
                key={usr.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/6 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {usr.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {usr.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {usr.email}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-[#C9A227] font-mono">
                    {usr.plan}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    {usr.joined}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 5. THIRD ROW: RECENT ENROLLMENTS & RECENT SYSTEM ACTIVITY TIMELINE

export function ThirdRow({
  recentEnrollments = [],
  topPlans = [],
  recentActivities = [],
  loading,
}: {
  recentEnrollments?: RecentEnrollment[];
  topPlans?: TopPlan[];
  recentActivities?: ActivityItem[];
  loading?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: Recent Enrollments (6 Cols) */}
      <div className="lg:col-span-6 rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-sans">
              Recent Course Enrollments
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Students currently joining masterclasses.
            </p>
          </div>
          <a
            href="/admin/enrollments"
            className="text-xs font-mono text-[#C9A227] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </a>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="py-8 text-center text-xs font-mono text-zinc-500 animate-pulse">
              Loading recent enrollments...
            </div>
          ) : recentEnrollments.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-zinc-500">
              No recent enrollments recorded.
            </div>
          ) : (
            recentEnrollments.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5 hover:border-[#C9A227]/30 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227] font-bold text-xs shrink-0">
                    {item.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {item.student}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate max-w-50">
                      {item.course}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-[#C9A227]/10 text-[#C9A227] text-[10px] font-mono border border-[#C9A227]/20 mb-1">
                    {item.plan}
                  </span>
                  <div className="text-[10px] font-mono text-zinc-500">
                    {item.time}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Recent Activity Timeline (6 Cols) */}
      <div className="lg:col-span-6 rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white font-sans">
            Top Selling Pricing Plans
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Best performing subscription tiers.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="py-8 text-center text-xs font-mono text-zinc-500 animate-pulse">
              Loading top plans...
            </div>
          ) : topPlans.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-zinc-500">
              No plan purchase data available.
            </div>
          ) : (
            topPlans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/3 border border-white/5"
              >
                <div>
                  <div className="text-xs font-bold text-white">
                    {plan.name}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400">
                    {plan.billing}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-[#C9A227] font-mono">
                    {plan.revenue}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400">
                    {plan.growth}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 6. FOURTH ROW (ALIAS FOR SYSTEM ACTIVITY IF NEEDED)
export function FourthRow({
  recentActivities = [],
  loading,
}: {
  recentActivities?: ActivityItem[];
  loading?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white font-sans">
            Recent System Activity Log
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time audit log of admin and user actions.
          </p>
        </div>

        <div className="relative pl-6 flex flex-col gap-4 border-l border-white/10 ml-2">
          {loading ? (
            <div className="py-4 text-center text-xs font-mono text-zinc-500 animate-pulse">
              Loading system activity...
            </div>
          ) : (
            recentActivities.map((act) => (
              <div key={act.id} className="relative flex flex-col gap-0.5">
                <div className="absolute -left-7.75 top-0.5 w-6 h-6 rounded-full bg-[#111113] border border-white/20 flex items-center justify-center text-xs">
                  <ShieldCheck size={12} className="text-[#C9A227]" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white font-sans">
                    {act.title}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {act.time}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                  {act.detail}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 7. BOTTOM SECTION: TOP SELLING PLANS & TOP COURSES

export function BottomSection({
  topPlans = [],
  topCourses = [],
  loading,
}: {
  topPlans?: TopPlan[];
  topCourses?: TopCourse[];
  loading?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Top Selling Plans (6 Cols) */}
      <div className="lg:col-span-6 rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white font-sans">
            Top Selling Pricing Plans
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Best performing subscription tiers.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="py-8 text-center text-xs font-mono text-zinc-500 animate-pulse">
              Loading top plans...
            </div>
          ) : topPlans.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-zinc-500">
              No plan purchase data available.
            </div>
          ) : (
            topPlans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/3 border border-white/5"
              >
                <div>
                  <div className="text-xs font-bold text-white">
                    {plan.name}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400">
                    {plan.billing}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-[#C9A227] font-mono">
                    {plan.revenue}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400">
                    {plan.growth}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Courses Summary (6 Cols) */}
      <div className="lg:col-span-6 rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white font-sans">
            Top Enrolled Courses
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Highest engagement trading modules.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="py-8 text-center text-xs font-mono text-zinc-500 animate-pulse">
              Loading top courses...
            </div>
          ) : topCourses.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-zinc-500">
              No course enrollment data available.
            </div>
          ) : (
            topCourses.map((crs) => (
              <div
                key={crs.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/3 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-black/60 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] shrink-0 font-mono text-xs font-bold">
                    CRS
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white truncate max-w-55">
                      {crs.title}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">
                      {crs.students}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-[#C9A227] font-mono">
                    {crs.revenue}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400">
                    Comp: {crs.completion}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 8. FOOTER STATS COMPONENT

export function FooterStats({
  footerStats,
  loading,
}: {
  footerStats?: DashboardData["footerStats"];
  loading?: boolean;
}) {
  const statsList = [
    {
      label: "Testimonials",
      value: footerStats?.testimonials || "0 Approved",
      icon: MessageSquareQuote,
    },
    {
      label: "Certificates",
      value: footerStats?.certificates || "0 Issued",
      icon: Award,
    },
    {
      label: "Mentors",
      value: footerStats?.mentors || "0 Active",
      icon: UserRound,
    },
    {
      label: "Categories",
      value: footerStats?.categories || "0 Active",
      icon: FolderTree,
    },
    {
      label: "Pending Reviews",
      value: footerStats?.pendingReviews || "0 Required",
      icon: AlertCircle,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t border-white/10">
      {statsList.map((stat, idx) => {
        const IconComp = stat.icon;
        return (
          <div
            key={idx}
            className="rounded-xl bg-[#111113]/60 border border-white/10 p-3.5 flex items-center justify-between hover:border-[#C9A227]/30 transition-all duration-200"
          >
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-0.5">
                {stat.label}
              </span>
              <span className="text-xs font-bold text-white font-sans">
                {loading ? "..." : stat.value}
              </span>
            </div>
            <IconComp
              size={16}
              className="text-[#C9A227] shrink-0 opacity-80"
            />
          </div>
        );
      })}
    </div>
  );
}
