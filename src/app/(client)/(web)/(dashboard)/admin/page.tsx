"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { gsap } from "gsap";
import {
  DashboardHeader,
  KPISection,
  AnalyticsRow,
  SecondRowCharts,
  ThirdRow,
  FooterStats,
  AdminUser,
  DashboardData,
} from "./(components)/DashboardComponents";

export default function AdminDashboardPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const analyticsAbortRef = useRef<AbortController | null>(null);

  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<{
    buckets: { label: string; amount: number }[];
    peakDayLabel: string;
  } | null>(null);

  const [timeRange, setTimeRange] = useState("30D");
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch authenticated admin user
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get("/api/admin/auth/me", {
          withCredentials: true,
        });
        if (res.data.success && res.data.authenticated) {
          setAdmin(res.data.user);
        }
      } catch (err) {
        console.error("Failed to fetch authenticated admin:", err);
      } finally {
        setLoadingAdmin(false);
      }
    };
    fetchAdmin();
  }, []);

  // 2. Fetch general static dashboard data ONCE on mount
  useEffect(() => {
    const fetchGeneralDashboard = async () => {
      setLoadingDashboard(true);
      try {
        const res = await axios.get("/api/admin/dashboard", {
          withCredentials: true,
        });

        if (res.data.success && res.data.data) {
          setDashboardData(res.data.data);
          // Set initial fallback analytics data if available
          if (res.data.data.revenueChart) {
            setAnalyticsData(res.data.data.revenueChart);
          }
        } else {
          setError(res.data.message || "Failed to load dashboard data");
        }
      } catch (err: any) {
        console.error("Failed to fetch general dashboard data:", err);
        setError(
          err?.response?.data?.message || "Failed to connect to dashboard API"
        );
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchGeneralDashboard();
  }, []);

  // 3. Fetch ONLY analytics data whenever timeRange changes (with AbortController)
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (analyticsAbortRef.current) {
        analyticsAbortRef.current.abort();
      }

      const controller = new AbortController();
      analyticsAbortRef.current = controller;

      setLoadingAnalytics(true);
      try {
        const res = await axios.get("/api/admin/dashboard/analytics", {
          params: { range: timeRange },
          withCredentials: true,
          signal: controller.signal,
        });

        if (res.data.success && res.data.data) {
          setAnalyticsData({
            buckets: res.data.data.buckets,
            peakDayLabel: res.data.data.peakDayLabel,
          });
        }
      } catch (err: any) {
        if (axios.isCancel(err) || err.name === "CanceledError" || err.name === "AbortError") {
          return; // Ignore aborted requests
        }
        console.error("Failed to fetch analytics data:", err);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchAnalytics();

    return () => {
      if (analyticsAbortRef.current) {
        analyticsAbortRef.current.abort();
      }
    };
  }, [timeRange]);

  const handleRangeChange = (newRange: string) => {
    if (newRange === timeRange) return;
    setTimeRange(newRange);
  };

  // 4. GSAP Entrance Animation (Runs once when initial page loading completes)
  useEffect(() => {
    if (loadingAdmin || loadingDashboard) return;

    const ctx = gsap.context(() => {
      if (pageRef.current) {
        gsap.fromTo(
          pageRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.12,
            ease: "power2.out",
          }
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, [loadingAdmin, loadingDashboard]);

  // Combined revenue chart prop for AnalyticsRow
  const activeRevenueChart = analyticsData || dashboardData?.revenueChart;

  return (
    <div
      ref={pageRef}
      aria-label="Admin Dashboard Page"
      className="w-full max-w-[1600px] mx-auto space-y-8 pb-12"
    >
      {/* API Error Notification */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => window.location.reload()}
            className="underline cursor-pointer hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* 1. Header Section */}
      <DashboardHeader admin={admin} />

      {/* 2. KPI Cards Row (5 Cards - loads once) */}
      <KPISection kpis={dashboardData?.kpis} loading={loadingDashboard} />

      {/* 3. Analytics Row (Only Revenue Line Chart updates on range filter change) */}
      <AnalyticsRow
        revenueChart={activeRevenueChart}
        subscriptionsDistribution={dashboardData?.subscriptionsDistribution}
        timeRange={timeRange}
        onTimeRangeChange={handleRangeChange}
        loading={loadingDashboard}
        analyticsLoading={loadingAnalytics}
      />

      {/* 4. Second Row (Recent Orders Table + Latest Users - loads once) */}
      <SecondRowCharts
        recentOrders={dashboardData?.recentOrders}
        latestUsers={dashboardData?.latestUsers}
        loading={loadingDashboard}
      />

      {/* 5. Third Row (Recent Course Enrollments + Top Plans - loads once) */}
      <ThirdRow
        recentEnrollments={dashboardData?.recentEnrollments}
        topPlans={dashboardData?.topPlans}
        recentActivities={dashboardData?.recentActivities}
        loading={loadingDashboard}
      />

      {/* 6. Footer Stats (5 Compact Cards - loads once) */}
      <FooterStats
        footerStats={dashboardData?.footerStats}
        loading={loadingDashboard}
      />
    </div>
  );
}
