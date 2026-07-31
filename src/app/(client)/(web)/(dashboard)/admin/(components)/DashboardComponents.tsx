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
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  CreditCard,
  UserPlus,
  FileCheck,
  Filter,
  Download,
  ChevronRight,
  MoreVertical,
  Star,
  MessageSquareQuote,
  FolderTree,
  UserRound,
} from "lucide-react";

// ============================================================================
// DUMMY PLACEHOLDER DATA STRUCTURES (Ready for API integration)
// ============================================================================

export interface KpiItem {
  id: string;
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  description: string;
  trend: string;
  isUp: boolean;
  icon: React.ElementType;
}

export const KPI_DATA: KpiItem[] = [
  {
    id: "revenue",
    title: "Total Revenue",
    value: 485200,
    prefix: "₹",
    description: "vs last month",
    trend: "+14.2%",
    isUp: true,
    icon: IndianRupee,
  },
  {
    id: "students",
    title: "Total Students",
    value: 1280,
    prefix: "",
    description: "New this week",
    trend: "+42%",
    isUp: true,
    icon: Users,
  },
  {
    id: "subscriptions",
    title: "Active Subscriptions",
    value: 340,
    prefix: "",
    description: "Currently Active",
    trend: "+8.5%",
    isUp: true,
    icon: ShieldCheck,
  },
  {
    id: "courses",
    title: "Monthly Plan Subscribers",
    value: 18,
    prefix: "",
    description: "Active in catalog",
    trend: "+3%",
    isUp: true,
    icon: BookOpen,
  },
  {
    id: "courses",
    title: "Yearly Plan Subscribers",
    value: 154,
    prefix: "",
    description: "vs last month",
    trend: "+12.4%",
    isUp: true,
    icon: ShoppingBag,
  },
];

export const RECENT_ORDERS = [
  {
    id: "ORD-9842",
    student: "Aarav Sharma",
    email: "aarav@gmail.com",
    plan: "Pro Trader Annual",
    amount: "₹24,999",
    status: "Paid",
    date: "31 Jul 2026",
  },
  {
    id: "ORD-9841",
    student: "Rohan Verma",
    email: "rohan.v@yahoo.com",
    plan: "Price Action Masterclass",
    amount: "₹14,499",
    status: "Paid",
    date: "31 Jul 2026",
  },
  {
    id: "ORD-9840",
    student: "Priya Patel",
    email: "priya.p@gmail.com",
    plan: "Options Scalping Blueprint",
    amount: "₹9,999",
    status: "Pending",
    date: "30 Jul 2026",
  },
  {
    id: "ORD-9839",
    student: "Vikram Malhotra",
    email: "vikram@outlook.com",
    plan: "Elite Mentorship Lifetime",
    amount: "₹49,999",
    status: "Paid",
    date: "30 Jul 2026",
  },
  {
    id: "ORD-9838",
    student: "Sneha Reddy",
    email: "sneha.r@gmail.com",
    plan: "Pro Trader Monthly",
    amount: "₹2,999",
    status: "Failed",
    date: "29 Jul 2026",
  },
  {
    id: "ORD-9837",
    student: "Karan Mehta",
    email: "karan.m@gmail.com",
    plan: "Equity Derivatives Series",
    amount: "₹7,999",
    status: "Refunded",
    date: "28 Jul 2026",
  },
];

export const RECENT_ENROLLMENTS = [
  {
    id: "enr-1",
    student: "Ananya Iyer",
    avatar: "A",
    course: "Institutional Order Flow Masterclass",
    plan: "Annual Pass",
    time: "12 mins ago",
  },
  {
    id: "enr-2",
    student: "Devansh Nambiar",
    avatar: "D",
    course: "NISM Equity Derivatives Prep",
    plan: "One-Time",
    time: "45 mins ago",
  },
  {
    id: "enr-3",
    student: "Simran Kaur",
    avatar: "S",
    course: "Advanced Liquidity & Smart Money",
    plan: "Monthly Pass",
    time: "2 hours ago",
  },
  {
    id: "enr-4",
    student: "Aditya Nair",
    avatar: "A",
    course: "Options Delta & Gamma Strategies",
    plan: "Annual Pass",
    time: "4 hours ago",
  },
  {
    id: "enr-5",
    student: "Tanvi Deshmukh",
    avatar: "T",
    course: "Algorithmic Risk Management",
    plan: "Lifetime Pass",
    time: "6 hours ago",
  },
];

export const LATEST_USERS = [
  {
    id: "usr-1",
    name: "Rajesh Kulkarni",
    email: "rajesh.k@gmail.com",
    avatar: "R",
    plan: "Pro Annual",
    joined: "31 Jul 2026",
  },
  {
    id: "usr-2",
    name: "Meera Sen",
    email: "meera.sen@gmail.com",
    avatar: "M",
    plan: "Basic Monthly",
    joined: "30 Jul 2026",
  },
  {
    id: "usr-3",
    name: "Arjun Banerjee",
    email: "arjun.b@yahoo.com",
    avatar: "A",
    plan: "Pro Annual",
    joined: "30 Jul 2026",
  },
  {
    id: "usr-4",
    name: "Kavya Singhania",
    email: "kavya.s@hotmail.com",
    avatar: "K",
    plan: "Elite Lifetime",
    joined: "29 Jul 2026",
  },
];

export const RECENT_ACTIVITIES = [
  {
    id: "act-1",
    title: "New Course Published",
    detail: "'Advanced Liquidity & Smart Money Concepts' went live.",
    time: "25 mins ago",
    icon: BookOpen,
    color: "text-[#C9A227]",
  },
  {
    id: "act-2",
    title: "Pro Plan Purchased",
    detail: "Aarav Sharma subscribed to Annual Pro Pass (₹24,999).",
    time: "1 hour ago",
    icon: ShoppingBag,
    color: "text-emerald-400",
  },
  {
    id: "act-3",
    title: "Certificate Issued",
    detail: "CMT Level II certification verified for Rohan Verma.",
    time: "3 hours ago",
    icon: Award,
    color: "text-amber-400",
  },
  {
    id: "act-4",
    title: "Mentor Onboarded",
    detail: "Dr. Vikram Seth assigned as Lead Derivatives Mentor.",
    time: "5 hours ago",
    icon: UserRound,
    color: "text-sky-400",
  },
  {
    id: "act-5",
    title: "New User Registered",
    detail: "Ananya Iyer completed account onboarding.",
    time: "7 hours ago",
    icon: UserPlus,
    color: "text-[#C9A227]",
  },
];

export const TOP_PLANS = [
  {
    id: "plan-1",
    name: "Pro Trader Annual Pass",
    billing: "Yearly (₹24,999/yr)",
    revenue: "₹2,49,990",
    growth: "+18.4%",
  },
  {
    id: "plan-2",
    name: "Elite Mentorship Lifetime",
    billing: "One-Time (₹49,999)",
    revenue: "₹1,49,997",
    growth: "+12.1%",
  },
  {
    id: "plan-3",
    name: "Pro Trader Monthly Pass",
    billing: "Monthly (₹2,999/mo)",
    revenue: "₹85,221",
    growth: "+6.8%",
  },
];

export const TOP_COURSES = [
  {
    id: "crs-1",
    title: "Institutional Order Flow Masterclass",
    students: "420 Students",
    revenue: "₹1,85,000",
    completion: "92%",
  },
  {
    id: "crs-2",
    title: "NISM Series VIII Derivatives Blueprint",
    students: "380 Students",
    revenue: "₹1,42,000",
    completion: "88%",
  },
  {
    id: "crs-3",
    title: "Advanced Price Action & Scalping",
    students: "290 Students",
    revenue: "₹1,15,000",
    completion: "84%",
  },
];

export const FOOTER_STATS = [
  { label: "Testimonials", value: "48 Approved", icon: MessageSquareQuote },
  { label: "Certificates", value: "214 Issued", icon: Award },
  { label: "Mentors", value: "12 Active", icon: UserRound },
  { label: "Categories", value: "8 Active", icon: FolderTree },
  { label: "Pending Reviews", value: "3 Required", icon: AlertCircle },
];

// 1. DASHBOARD HEADER COMPONENT

export function DashboardHeader() {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
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
          Good Morning, Admin{" "}
          {/* <span className="inline-block animate-bounce">👋</span> */}
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] text-black  transition-all duration-200 cursor-pointer"
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

export function KPISection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in & stagger KPI Cards
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

      // Count-up animations for each KPI value
      KPI_DATA.forEach((kpi, idx) => {
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
              if (kpi.suffix === "%") {
                numEl.innerText = obj.val.toFixed(1);
              } else if (kpi.prefix === "₹") {
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
  }, []);

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
    >
      {KPI_DATA.map((kpi, idx) => {
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
                  0
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

export function AnalyticsRow() {
  const [timeRange, setTimeRange] = useState("30D");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: Revenue Analytics Line Chart Placeholder (8 Cols) */}
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
                onClick={() => setTimeRange(range)}
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

        {/* SVG Line Chart Placeholder */}
        <div className="relative w-full h-[240px] flex items-end">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 700 220"
            fill="none"
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9A227" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#C9A227" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Subtle Horizontal Grid lines */}
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
            <path
              d="M0,180 C80,160 140,120 220,130 C300,140 380,60 460,80 C540,100 620,30 700,40 L700,200 L0,200 Z"
              fill="url(#revenueGradient)"
            />

            {/* Main Smooth Curve Line */}
            <path
              d="M0,180 C80,160 140,120 220,130 C300,140 380,60 460,80 C540,100 620,30 700,40"
              stroke="#C9A227"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Highlight Data Points */}
            <circle
              cx="220"
              cy="130"
              r="4"
              fill="#C9A227"
              stroke="#050505"
              strokeWidth="2"
            />
            <circle
              cx="460"
              cy="80"
              r="4"
              fill="#C9A227"
              stroke="#050505"
              strokeWidth="2"
            />
            <circle
              cx="700"
              cy="40"
              r="5"
              fill="#e6c55a"
              stroke="#050505"
              strokeWidth="2"
            />
          </svg>

          {/* Peak Tooltip Overlay */}
          <div className="absolute top-2 right-4 bg-[#18181c] border border-[#C9A227]/40 rounded-xl px-3 py-1.5 text-xs font-mono text-white shadow-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-ping" />
            <span>Peak Day: ₹48,500</span>
          </div>
        </div>

        {/* X-Axis Month Labels */}
        <div className="flex justify-between items-center text-xs font-mono text-zinc-500 pt-3 border-t border-white/5">
          <span>Week 1</span>
          <span>Week 2</span>
          <span>Week 3</span>
          <span>Week 4</span>
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

        {/* SVG Donut Chart Placeholder */}
        <div className="relative w-full h-[180px] my-4 flex items-center justify-center">
          <svg
            className="w-[170px] h-[170px] transform -rotate-90"
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
            {/* Monthly (62%) - Gold */}
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#C9A227"
              strokeWidth="12"
              strokeDasharray="148 238"
              fill="none"
            />
            {/* Yearly (28%) - Amber */}
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#e6c55a"
              strokeWidth="12"
              strokeDasharray="67 238"
              strokeDashoffset="-148"
              fill="none"
            />
            {/* Expired (10%) - Zinc */}
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#52525b"
              strokeWidth="12"
              strokeDasharray="23 238"
              strokeDashoffset="-215"
              fill="none"
            />
          </svg>

          {/* Center Total Count */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold text-white font-sans">
              340
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
            <span className="font-mono text-white font-bold">210 (62%)</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#e6c55a]" />
              <span className="text-zinc-300 font-medium">Yearly Annual</span>
            </div>
            <span className="font-mono text-white font-bold">95 (28%)</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zinc-600" />
              <span className="text-zinc-300 font-medium">
                Expired / Inactive
              </span>
            </div>
            <span className="font-mono text-zinc-400">35 (10%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. SECOND ROW: USER GROWTH & TOP PERFORMING COURSES

export function SecondRowCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: User Growth Line Chart (6 Cols) */}
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
              {RECENT_ORDERS.map((order) => {
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
        </div>
      </div>
      {/* RIGHT: Top Performing Courses Bar Metrics (6 Cols) */}
      <div className="lg:col-span-6 rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white font-sans">
            Top Performing Courses
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ranked by revenue generation & completion rate.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {TOP_COURSES.map((course) => (
            <div
              key={course.id}
              className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/5"
            >
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-white truncate max-w-[260px]">
                  {course.title}
                </span>
                <span className="font-mono text-[#C9A227] font-bold">
                  {course.revenue}
                </span>
              </div>

              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#e6c55a] to-[#C9A227] h-full rounded-full"
                  style={{ width: course.completion }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>{course.students}</span>
                <span>Completion: {course.completion}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 5. THIRD ROW: RECENT ORDERS TABLE & RECENT ENROLLMENTS

export function ThirdRow() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: Recent Orders Table (7 Cols) */}
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
          {LATEST_USERS.map((usr) => (
            <div
              key={usr.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {usr.avatar}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{usr.name}</div>
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
          ))}
        </div>
      </div>
      {/* RIGHT: Recent Enrollments Vertical Cards (5 Cols) */}
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
          {RECENT_ENROLLMENTS.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#C9A227]/30 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227] font-bold text-xs shrink-0">
                  {item.avatar}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {item.student}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate max-w-[200px]">
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
          ))}
        </div>
      </div>
    </div>
  );
}

// 6. FOURTH ROW: LATEST USERS & RECENT ACTIVITY TIMELINE

export function FourthRow() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: Latest Users List (6 Cols) */}

      {/* RIGHT: Recent Activity Timeline (6 Cols) */}
      <div className="lg:col-span-6 rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white font-sans">
            Recent System Activity
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time audit log of admin and user actions.
          </p>
        </div>

        <div className="relative pl-6 flex flex-col gap-4 border-l border-white/10 ml-2">
          {RECENT_ACTIVITIES.map((act) => {
            const IconComp = act.icon;
            return (
              <div key={act.id} className="relative flex flex-col gap-0.5">
                {/* Timeline Connector Dot */}
                <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-[#111113] border border-white/20 flex items-center justify-center text-xs">
                  <IconComp size={12} className={act.color} />
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
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 7. BOTTOM SECTION: TOP SELLING PLANS & TOP COURSES

export function BottomSection() {
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
          {TOP_PLANS.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5"
            >
              <div>
                <div className="text-xs font-bold text-white">{plan.name}</div>
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
          ))}
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
          {TOP_COURSES.map((crs) => (
            <div
              key={crs.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-black/60 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] shrink-0 font-mono text-xs font-bold">
                  CRS
                </div>
                <div>
                  <div className="text-xs font-bold text-white truncate max-w-[220px]">
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
          ))}
        </div>
      </div>
    </div>
  );
}

// 8. FOOTER STATS COMPONENT

export function FooterStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t border-white/10">
      {FOOTER_STATS.map((stat, idx) => {
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
                {stat.value}
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
