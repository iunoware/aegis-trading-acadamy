"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  DashboardHeader,
  KPISection,
  AnalyticsRow,
  SecondRowCharts,
  ThirdRow,
  FooterStats,
} from "./(components)/DashboardComponents";

export default function AdminDashboardPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance Animations for Admin Dashboard Sections
  useEffect(() => {
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
          },
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={pageRef}
      aria-label="Admin Dashboard Page"
      className="w-full max-w-[1600px] mx-auto space-y-8 pb-12 "
    >
      {/* 1. Header Section */}
      <DashboardHeader />

      {/* 2. KPI Cards Row (6 Cards) */}
      <KPISection />

      {/* 3. Analytics Row (Revenue Line Chart + Subscription Donut Chart) */}
      <AnalyticsRow />

      {/* 4. Second Row (User Growth Chart + Top Performing Courses Metrics) */}
      <SecondRowCharts />

      {/* 5. Third Row (Recent Orders Table + Recent Enrollments List) */}
      <ThirdRow />

      {/* 6. Footer Stats (5 Compact Cards) */}
      <FooterStats />
    </div>
  );
}
