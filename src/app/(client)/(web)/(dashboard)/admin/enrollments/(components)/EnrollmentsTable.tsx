"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Settings,
  Mail,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Ban,
  Calendar,
} from "lucide-react";

export interface PaymentRecord {
  id: string;
  plan: string;
  amount: string;
  purchaseDate: string;
  status: "Paid" | "Pending" | "Failed" | "Refunded";
  transactionId: string;
}

export interface TimelineRecord {
  id: string;
  action: string;
  date: string;
  details: string;
  type: "purchase" | "renew" | "plan_change" | "extend" | "cancel" | "reactivate" | "note";
}

export interface Enrollment {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  avatar?: string;
  currentPlan: "Monthly Plan" | "Yearly Plan";
  purchaseDate: string;
  expiryDate: string;
  status: "Active" | "Expiring Soon" | "Expired" | "Cancelled";
  adminNotes?: string;
  paymentHistory: PaymentRecord[];
  subscriptionTimeline: TimelineRecord[];
}

interface EnrollmentsTableProps {
  enrollments: Enrollment[];
  onSelectEnrollment: (enrollment: Enrollment) => void;
  onManageSubscription: (enrollment: Enrollment) => void;
}

export function EnrollmentsTable({
  enrollments,
  onSelectEnrollment,
  onManageSubscription,
}: EnrollmentsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"purchaseDate" | "expiryDate" | "name">("purchaseDate");
  const tableRef = useRef<HTMLDivElement>(null);

  // GSAP animation on search/filter/sort updates
  useEffect(() => {
    if (tableRef.current) {
      gsap.fromTo(
        tableRef.current,
        { opacity: 0.85, y: 5 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [searchQuery, planFilter, statusFilter, sortBy]);

  // Helper to compute remaining days
  const getRemainingDays = (expiryDateStr: string, status: Enrollment["status"]) => {
    if (status === "Expired" || status === "Cancelled") return 0;
    const expTime = new Date(expiryDateStr).getTime();
    const nowTime = new Date("2026-08-01").getTime(); // Reference current date
    const diff = expTime - nowTime;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Filter & Sort Logic
  const filteredEnrollments = enrollments
    .filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.userName.toLowerCase().includes(q) ||
        item.userEmail.toLowerCase().includes(q) ||
        item.userPhone.toLowerCase().includes(q);

      const matchesPlan =
        planFilter === "ALL" ||
        (planFilter === "MONTHLY" && item.currentPlan === "Monthly Plan") ||
        (planFilter === "YEARLY" && item.currentPlan === "Yearly Plan");

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && item.status === "Active") ||
        (statusFilter === "EXPIRING_SOON" && item.status === "Expiring Soon") ||
        (statusFilter === "EXPIRED" && item.status === "Expired") ||
        (statusFilter === "CANCELLED" && item.status === "Cancelled");

      return matchesSearch && matchesPlan && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "purchaseDate") {
        return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
      }
      if (sortBy === "expiryDate") {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      }
      if (sortBy === "name") {
        return a.userName.localeCompare(b.userName);
      }
      return 0;
    });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#111113]/90 backdrop-blur-xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-md">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Search by Enrolled User Name, Email, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#09090b] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Plan Filter */}
          <div className="flex items-center gap-1.5 bg-[#09090b] border border-white/15 rounded-xl px-3 py-1.5">
            <Filter size={13} className="text-[#C9A227]" />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#111113]">All Subscription Plans</option>
              <option value="MONTHLY" className="bg-[#111113]">Monthly Plan</option>
              <option value="YEARLY" className="bg-[#111113]">Yearly Plan</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#09090b] border border-white/15 rounded-xl px-3 py-1.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#111113]">All Statuses</option>
              <option value="ACTIVE" className="bg-[#111113]">Active</option>
              <option value="EXPIRING_SOON" className="bg-[#111113]">Expiring Soon</option>
              <option value="EXPIRED" className="bg-[#111113]">Expired</option>
              <option value="CANCELLED" className="bg-[#111113]">Cancelled</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-[#09090b] border border-white/15 rounded-xl px-3 py-1.5">
            <ArrowUpDown size={13} className="text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "purchaseDate" | "expiryDate" | "name")}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="purchaseDate" className="bg-[#111113]">Sort: Purchase Date</option>
              <option value="expiryDate" className="bg-[#111113]">Sort: Expiry Date</option>
              <option value="name" className="bg-[#111113]">Sort: Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Component */}
      <div
        ref={tableRef}
        className="rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#09090b]/80 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                <th className="py-3.5 px-4 font-semibold">Enrolled User</th>
                <th className="py-3.5 px-4 font-semibold">Current Plan</th>
                <th className="py-3.5 px-4 font-semibold">Purchase Date</th>
                <th className="py-3.5 px-4 font-semibold">Expiry Date</th>
                <th className="py-3.5 px-4 font-semibold">Remaining</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
              {filteredEnrollments.length > 0 ? (
                filteredEnrollments.map((item) => {
                  const initials = item.userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                  const remainingDays = getRemainingDays(item.expiryDate, item.status);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onManageSubscription(item)}
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      {/* Avatar & User Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] font-bold text-xs shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-white block leading-tight group-hover:text-[#C9A227] transition-colors">
                              {item.userName}
                            </span>
                            <span className="text-[11px] font-mono text-zinc-400 block">
                              {item.userEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Current Plan */}
                      <td className="py-3.5 px-4 font-mono font-medium">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                            item.currentPlan === "Yearly Plan"
                              ? "bg-[#C9A227]/10 text-[#C9A227] border-[#C9A227]/30"
                              : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                          }`}
                        >
                          {item.currentPlan}
                        </span>
                      </td>

                      {/* Purchase Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400">
                        {item.purchaseDate}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-300">
                        {item.expiryDate}
                      </td>

                      {/* Remaining Days */}
                      <td className="py-3.5 px-4 font-mono text-[11px] font-bold">
                        <span
                          className={
                            item.status === "Active"
                              ? "text-emerald-400"
                              : item.status === "Expiring Soon"
                              ? "text-amber-400"
                              : "text-zinc-500"
                          }
                        >
                          {remainingDays > 0 ? `${remainingDays} Days` : "0 Days"}
                        </span>
                      </td>

                      {/* Subscription Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold ${
                            item.status === "Active"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : item.status === "Expiring Soon"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse"
                              : item.status === "Expired"
                              ? "bg-zinc-500/15 text-zinc-400 border border-zinc-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === "Active"
                                ? "bg-emerald-400 animate-pulse"
                                : item.status === "Expiring Soon"
                                ? "bg-amber-400"
                                : item.status === "Expired"
                                ? "bg-zinc-400"
                                : "bg-rose-400"
                            }`}
                          />
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectEnrollment(item)}
                            title="View Subscription"
                            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:border-[#C9A227]/40 hover:bg-[#C9A227]/10 text-zinc-400 hover:text-[#C9A227] flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => onManageSubscription(item)}
                            title="Manage Subscription Lifecycle"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C9A227]/15 border border-[#C9A227]/30 hover:bg-[#C9A227]/25 text-[#C9A227] font-mono text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            <Settings size={12} />
                            <span>Manage</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 font-mono">
                    No enrollments found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards */}
        <div className="block md:hidden divide-y divide-white/5">
          {filteredEnrollments.length > 0 ? (
            filteredEnrollments.map((item) => (
              <div
                key={item.id}
                onClick={() => onManageSubscription(item)}
                className="p-4 space-y-3 hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] font-bold text-xs">
                      {item.userName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.userName}</h4>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {item.userEmail}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      item.status === "Active"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : item.status === "Expiring Soon"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">CURRENT PLAN:</span>
                    <span className="text-white font-semibold">{item.currentPlan}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">EXPIRY DATE:</span>
                    <span className="text-zinc-300">{item.expiryDate}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-zinc-500 font-mono text-xs">
              No enrollment records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
