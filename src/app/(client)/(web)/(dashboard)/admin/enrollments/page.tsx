"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { toast } from "sonner";
import axios from "@/lib/axios";
import { EnrollmentsHeader } from "./(components)/EnrollmentsHeader";
import { EnrollmentOverviewCards } from "./(components)/EnrollmentOverviewCards";
import { EnrollmentsTable, Enrollment } from "./(components)/EnrollmentsTable";
import { EnrollmentSidebar } from "@/components/sidebar/EnrollmentSidebar";
import { ManualEnrollmentModal } from "./(components)/ManualEnrollmentModal";

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  // Fetch enrollments from API using axios
  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res: any = await axios.get("/enrollments");
      if (res.success && Array.isArray(res.enrollments)) {
        setEnrollments(res.enrollments);
      } else {
        toast.error(res.message || "Failed to load enrollments directory");
      }
    } catch (error: any) {
      console.error("Failed to fetch enrollments:", error);
      toast.error(error?.message || "Failed to connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (pageRef.current) {
        gsap.fromTo(
          pageRef.current.children,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out",
          },
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, [loading]);

  // Compute Overview KPI Metrics
  const activeCount = enrollments.filter((e) => e.status === "Active").length;
  const monthlyCount = enrollments.filter((e) => e.currentPlan === "Monthly Plan").length;
  const yearlyCount = enrollments.filter((e) => e.currentPlan === "Yearly Plan").length;
  const expiringSoonCount = enrollments.filter(
    (e) => e.status === "Expiring Soon",
  ).length;
  const expiredCount = enrollments.filter((e) => e.status === "Expired").length;

  // Handlers connected to backend via axios
  const handleManualEnroll = async (newEnrollmentData: any) => {
    try {
      const res: any = await axios.post("/enrollments/manual", newEnrollmentData);
      if (res.success && res.enrollment) {
        setEnrollments((prev) => [res.enrollment, ...prev]);
        toast.success(`User "${res.enrollment.userName}" enrolled!`, {
          description: `Granted ${res.enrollment.currentPlan}.`,
        });
        setIsManualModalOpen(false);
      } else {
        toast.error(res.message || "Failed to complete manual enrollment");
      }
    } catch (error: any) {
      console.error("Error creating manual enrollment:", error);
      toast.error(error?.message || "Failed to enroll user manually");
    }
  };

  const handleExtendSubscription = async (enrollmentId: string, days: number) => {
    try {
      const res: any = await axios.patch(`/enrollments/${enrollmentId}/extend`, { days });
      if (res.success && res.enrollment) {
        setEnrollments((prev) =>
          prev.map((e) => (e.id === enrollmentId ? res.enrollment : e))
        );
        if (selectedEnrollment?.id === enrollmentId) {
          setSelectedEnrollment(res.enrollment);
        }
        toast.success(res.message || `Extended subscription by ${days} days!`);
      } else {
        toast.error(res.message || "Failed to extend subscription");
      }
    } catch (error: any) {
      console.error("Error extending subscription:", error);
      toast.error(error?.message || "Failed to extend subscription");
    }
  };

  const handleChangePlan = async (
    enrollmentId: string,
    newPlan: "Monthly Plan" | "Yearly Plan",
  ) => {
    try {
      const res: any = await axios.patch(`/enrollments/${enrollmentId}/plan`, { newPlan });
      if (res.success && res.enrollment) {
        setEnrollments((prev) =>
          prev.map((e) => (e.id === enrollmentId ? res.enrollment : e))
        );
        if (selectedEnrollment?.id === enrollmentId) {
          setSelectedEnrollment(res.enrollment);
        }
        toast.success(res.message || `Plan updated to ${newPlan}!`);
      } else {
        toast.error(res.message || "Failed to update plan");
      }
    } catch (error: any) {
      console.error("Error changing plan:", error);
      toast.error(error?.message || "Failed to update plan");
    }
  };

  const handleToggleStatus = async (enrollmentId: string) => {
    try {
      const res: any = await axios.patch(`/enrollments/${enrollmentId}/status`);
      if (res.success && res.enrollment) {
        setEnrollments((prev) =>
          prev.map((e) => (e.id === enrollmentId ? res.enrollment : e))
        );
        if (selectedEnrollment?.id === enrollmentId) {
          setSelectedEnrollment(res.enrollment);
        }
        toast.info(res.message || "Subscription status updated.");
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (error: any) {
      console.error("Error toggling status:", error);
      toast.error(error?.message || "Failed to update status");
    }
  };

  const handleSaveNotes = async (enrollmentId: string, notes: string) => {
    try {
      const res: any = await axios.patch(`/enrollments/${enrollmentId}/notes`, { notes });
      if (res.success && res.enrollment) {
        setEnrollments((prev) =>
          prev.map((e) => (e.id === enrollmentId ? res.enrollment : e))
        );
        if (selectedEnrollment?.id === enrollmentId) {
          setSelectedEnrollment(res.enrollment);
        }
        toast.success(res.message || "Admin notes saved successfully!");
      } else {
        toast.error(res.message || "Failed to save notes");
      }
    } catch (error: any) {
      console.error("Error saving notes:", error);
      toast.error(error?.message || "Failed to save notes");
    }
  };

  const handleExportEnrollments = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,UserName,UserEmail,UserPhone,Plan,Status,PurchaseDate,ExpiryDate"]
        .concat(
          enrollments.map(
            (e) =>
              `"${e.id}","${e.userName}","${e.userEmail}","${e.userPhone}","${e.currentPlan}","${e.status}","${e.purchaseDate}","${e.expiryDate}"`,
          ),
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aegis_enrollments_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Enrollment directory exported to CSV!");
  };

  return (
    <div
      ref={pageRef}
      aria-label="Enrollments Management Page"
      className="w-full max-w-[1600px] mx-auto space-y-8 pb-12"
    >
      {/* 1. Header */}
      <EnrollmentsHeader
        totalCount={enrollments.length}
        onExport={handleExportEnrollments}
        onManualEnrollment={() => setIsManualModalOpen(true)}
      />

      {/* 2. Overview KPI Cards (5 Cards) */}
      <EnrollmentOverviewCards
        activeCount={activeCount}
        monthlyCount={monthlyCount}
        yearlyCount={yearlyCount}
        expiringSoonCount={expiringSoonCount}
        expiredCount={expiredCount}
      />

      {/* 3. Enrollments Table */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-[#111113]/80 border border-white/10 text-zinc-400 font-mono text-sm space-y-3">
          <div className="inline-block w-6 h-6 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
          <p>Loading Enrollments Directory...</p>
        </div>
      ) : (
        <EnrollmentsTable
          enrollments={enrollments}
          onSelectEnrollment={(item) => setSelectedEnrollment(item)}
          onManageSubscription={(item) => setSelectedEnrollment(item)}
        />
      )}

      {/* 4. Manage Subscription Right-Side Drawer */}
      <EnrollmentSidebar
        isOpen={!!selectedEnrollment}
        data={selectedEnrollment}
        onClose={() => setSelectedEnrollment(null)}
        onExtendSubscription={handleExtendSubscription}
        onChangePlan={handleChangePlan}
        onToggleStatus={handleToggleStatus}
        onSaveNotes={handleSaveNotes}
      />

      {/* 5. Manual Enrollment Modal */}
      <ManualEnrollmentModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onEnroll={handleManualEnroll}
      />
    </div>
  );
}
