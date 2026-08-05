"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { toast } from "sonner";
import { EnrollmentsHeader } from "./(components)/EnrollmentsHeader";
import { EnrollmentOverviewCards } from "./(components)/EnrollmentOverviewCards";
import { EnrollmentsTable, Enrollment } from "./(components)/EnrollmentsTable";
import { ManageSubscriptionDrawer } from "./(components)/ManageSubscriptionDrawer";
import { ManualEnrollmentModal } from "./(components)/ManualEnrollmentModal";

const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    id: "enr-2001",
    userName: "Aarav Sharma",
    userEmail: "aarav.sharma@gmail.com",
    userPhone: "+91 98765 43210",
    discordName: "aarav_trades",
    currentPlan: "Yearly Plan",
    purchaseDate: "15 Jan 2026",
    expiryDate: "15 Jan 2027",
    status: "Active",
    adminNotes: "VIP Trader Pass member. Manual upgrade granted.",
    paymentHistory: [
      {
        id: "pay-301",
        plan: "Yearly Plan",
        amount: "₹7,999",
        purchaseDate: "15 Jan 2026",
        status: "Paid",
        transactionId: "TXN-9842100",
      },
      {
        id: "pay-300",
        plan: "Monthly Plan",
        amount: "₹999",
        purchaseDate: "15 Dec 2025",
        status: "Paid",
        transactionId: "TXN-9821045",
      },
    ],
    subscriptionTimeline: [
      {
        id: "tl-101",
        action: "Changed to Yearly Plan",
        date: "15 Jan 2026",
        details: "Upgraded from Monthly Plan to Yearly Plan (₹7,999).",
        type: "plan_change",
      },
      {
        id: "tl-100",
        action: "Purchased Monthly Plan",
        date: "15 Dec 2025",
        details: "Initial monthly subscription pass activated.",
        type: "purchase",
      },
    ],
  },
  {
    id: "enr-2002",
    userName: "Priya Patel",
    userEmail: "priya.patel@yahoo.com",
    userPhone: "+91 98123 45678",
    discordName: "priya_patel",
    currentPlan: "Monthly Plan",
    purchaseDate: "10 Jul 2026",
    expiryDate: "10 Aug 2026",
    status: "Expiring Soon",
    adminNotes: "Auto-renew attempt scheduled for Aug 10.",
    paymentHistory: [
      {
        id: "pay-302",
        plan: "Monthly Plan",
        amount: "₹999",
        purchaseDate: "10 Jul 2026",
        status: "Paid",
        transactionId: "TXN-9856112",
      },
      {
        id: "pay-301-b",
        plan: "Monthly Plan",
        amount: "₹999",
        purchaseDate: "10 Jun 2026",
        status: "Paid",
        transactionId: "TXN-9831990",
      },
    ],
    subscriptionTimeline: [
      {
        id: "tl-102",
        action: "Renewed Subscription",
        date: "10 Jul 2026",
        details: "Monthly Plan renewed for 30 days (₹999).",
        type: "renew",
      },
      {
        id: "tl-101-b",
        action: "Purchased Monthly Plan",
        date: "10 Jun 2026",
        details: "First monthly pass activated.",
        type: "purchase",
      },
    ],
  },
  {
    id: "enr-2003",
    userName: "Rohan Verma",
    userEmail: "rohan.v@outlook.com",
    userPhone: "+91 97654 32109",
    discordName: "rohan_fx",
    currentPlan: "Yearly Plan",
    purchaseDate: "28 Feb 2026",
    expiryDate: "28 Feb 2027",
    status: "Active",
    adminNotes: "Institutional cohort group student.",
    paymentHistory: [
      {
        id: "pay-303",
        plan: "Yearly Plan",
        amount: "₹7,999",
        purchaseDate: "28 Feb 2026",
        status: "Paid",
        transactionId: "TXN-9800142",
      },
    ],
    subscriptionTimeline: [
      {
        id: "tl-103",
        action: "Purchased Yearly Plan",
        date: "28 Feb 2026",
        details: "Subscribed to Aegis Annual Pass.",
        type: "purchase",
      },
    ],
  },
  {
    id: "enr-2004",
    userName: "Sneha Reddy",
    userEmail: "sneha.reddy@gmail.com",
    userPhone: "+91 96543 21098",
    discordName: "sneha_reddy",
    currentPlan: "Monthly Plan",
    purchaseDate: "01 Jun 2026",
    expiryDate: "01 Jul 2026",
    status: "Expired",
    adminNotes: "Payment retry failed on July 1.",
    paymentHistory: [
      {
        id: "pay-304",
        plan: "Monthly Plan",
        amount: "₹999",
        purchaseDate: "01 Jun 2026",
        status: "Paid",
        transactionId: "TXN-9799812",
      },
    ],
    subscriptionTimeline: [
      {
        id: "tl-104",
        action: "Subscription Expired",
        date: "01 Jul 2026",
        details: "Monthly Plan expired due to non-renewal.",
        type: "cancel",
      },
      {
        id: "tl-103-b",
        action: "Purchased Monthly Plan",
        date: "01 Jun 2026",
        details: "Monthly pass activated.",
        type: "purchase",
      },
    ],
  },
  {
    id: "enr-2005",
    userName: "Vikram Malhotra",
    userEmail: "vikram.m@gmail.com",
    userPhone: "+91 95432 10987",
    discordName: "vikram_alpha",
    currentPlan: "Yearly Plan",
    purchaseDate: "12 Jul 2026",
    expiryDate: "12 Jul 2027",
    status: "Active",
    adminNotes: "Regular options scalper member.",
    paymentHistory: [
      {
        id: "pay-305",
        plan: "Yearly Plan",
        amount: "₹7,999",
        purchaseDate: "12 Jul 2026",
        status: "Paid",
        transactionId: "TXN-9860012",
      },
    ],
    subscriptionTimeline: [
      {
        id: "tl-105",
        action: "Purchased Yearly Plan",
        date: "12 Jul 2026",
        details: "Annual subscription activated.",
        type: "purchase",
      },
    ],
  },
  {
    id: "enr-2006",
    userName: "Ananya Iyer",
    userEmail: "ananya.iyer@gmail.com",
    userPhone: "+91 94321 09876",
    discordName: "ananya_fx",
    currentPlan: "Monthly Plan",
    purchaseDate: "25 Jul 2026",
    expiryDate: "25 Aug 2026",
    status: "Active",
    adminNotes: "",
    paymentHistory: [
      {
        id: "pay-306",
        plan: "Monthly Plan",
        amount: "₹999",
        purchaseDate: "25 Jul 2026",
        status: "Paid",
        transactionId: "TXN-9871109",
      },
    ],
    subscriptionTimeline: [
      {
        id: "tl-106",
        action: "Purchased Monthly Plan",
        date: "25 Jul 2026",
        details: "Initial monthly pass activated.",
        type: "purchase",
      },
    ],
  },
  {
    id: "enr-2007",
    userName: "Devansh Nambiar",
    userEmail: "devansh.n@yahoo.com",
    userPhone: "+91 93210 98765",
    discordName: "devansh_trade",
    currentPlan: "Monthly Plan",
    purchaseDate: "05 Apr 2026",
    expiryDate: "05 May 2026",
    status: "Cancelled",
    adminNotes: "Cancelled per customer request.",
    paymentHistory: [
      {
        id: "pay-307",
        plan: "Monthly Plan",
        amount: "₹999",
        purchaseDate: "05 Apr 2026",
        status: "Paid",
        transactionId: "TXN-9740019",
      },
    ],
    subscriptionTimeline: [
      {
        id: "tl-107",
        action: "Cancelled Subscription",
        date: "05 May 2026",
        details: "Subscription cancelled by user request.",
        type: "cancel",
      },
    ],
  },
  {
    id: "enr-2008",
    userName: "Karan Mehta",
    userEmail: "karan.mehta@hotmail.com",
    userPhone: "+91 92109 87654",
    discordName: "karan_mehta",
    currentPlan: "Yearly Plan",
    purchaseDate: "18 Jul 2026",
    expiryDate: "18 Jul 2027",
    status: "Active",
    adminNotes: "",
    paymentHistory: [
      {
        id: "pay-308",
        plan: "Yearly Plan",
        amount: "₹7,999",
        purchaseDate: "18 Jul 2026",
        status: "Paid",
        transactionId: "TXN-9865510",
      },
    ],
    subscriptionTimeline: [
      {
        id: "tl-108",
        action: "Purchased Yearly Plan",
        date: "18 Jul 2026",
        details: "Subscribed to Aegis Yearly Plan.",
        type: "purchase",
      },
    ],
  },
];
export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>(INITIAL_ENROLLMENTS);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

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
  }, []);

  // Compute Overview KPI Metrics
  const activeCount = enrollments.filter((e) => e.status === "Active").length;
  const monthlyCount = enrollments.filter((e) => e.currentPlan === "Monthly Plan").length;
  const yearlyCount = enrollments.filter((e) => e.currentPlan === "Yearly Plan").length;
  const expiringSoonCount = enrollments.filter(
    (e) => e.status === "Expiring Soon",
  ).length;
  const expiredCount = enrollments.filter((e) => e.status === "Expired").length;

  // Handlers
  const handleManualEnroll = (newEnrollment: Enrollment) => {
    setEnrollments((prev) => [newEnrollment, ...prev]);
    toast.success(`User "${newEnrollment.userName}" enrolled!`, {
      description: `Granted ${newEnrollment.currentPlan}.`,
    });
  };

  const handleExtendSubscription = (enrollmentId: string, days: number) => {
    setEnrollments((prev) =>
      prev.map((e) => {
        if (e.id === enrollmentId) {
          const currentExp = new Date(e.expiryDate);
          const baseDate = isNaN(currentExp.getTime()) ? new Date() : currentExp;
          baseDate.setDate(baseDate.getDate() + days);
          const newExpiryStr = baseDate.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          });

          const updated: Enrollment = {
            ...e,
            status: "Active",
            expiryDate: newExpiryStr,
            subscriptionTimeline: [
              {
                id: `tl-ext-${Date.now()}`,
                action: `Extended ${days} Days`,
                date: "01 Aug 2026",
                details: `Admin extended subscription period until ${newExpiryStr}.`,
                type: "extend",
              },
              ...e.subscriptionTimeline,
            ],
          };

          if (selectedEnrollment?.id === enrollmentId) {
            setSelectedEnrollment(updated);
          }

          return updated;
        }
        return e;
      }),
    );

    toast.success(`Extended subscription by ${days} days!`);
  };

  const handleChangePlan = (
    enrollmentId: string,
    newPlan: "Monthly Plan" | "Yearly Plan",
  ) => {
    setEnrollments((prev) =>
      prev.map((e) => {
        if (e.id === enrollmentId) {
          const updated: Enrollment = {
            ...e,
            currentPlan: newPlan,
            status: "Active",
            subscriptionTimeline: [
              {
                id: `tl-plan-${Date.now()}`,
                action: `Changed to ${newPlan}`,
                date: "01 Aug 2026",
                details: `Admin updated subscription plan to ${newPlan}.`,
                type: "plan_change",
              },
              ...e.subscriptionTimeline,
            ],
          };

          if (selectedEnrollment?.id === enrollmentId) {
            setSelectedEnrollment(updated);
          }

          return updated;
        }
        return e;
      }),
    );

    toast.success(`Plan updated to ${newPlan}!`);
  };

  const handleToggleStatus = (enrollmentId: string) => {
    setEnrollments((prev) =>
      prev.map((e) => {
        if (e.id === enrollmentId) {
          const isCancelled = e.status === "Cancelled";
          const newStatus = isCancelled ? "Active" : "Cancelled";
          const actionTitle = isCancelled
            ? "Reactivated Subscription"
            : "Cancelled Subscription";

          const updated: Enrollment = {
            ...e,
            status: newStatus,
            subscriptionTimeline: [
              {
                id: `tl-status-${Date.now()}`,
                action: actionTitle,
                date: "01 Aug 2026",
                details: `Subscription status set to ${newStatus} by admin.`,
                type: isCancelled ? "reactivate" : "cancel",
              },
              ...e.subscriptionTimeline,
            ],
          };

          if (selectedEnrollment?.id === enrollmentId) {
            setSelectedEnrollment(updated);
          }

          return updated;
        }
        return e;
      }),
    );

    toast.info(`Subscription status updated.`);
  };

  const handleSaveNotes = (enrollmentId: string, notes: string) => {
    setEnrollments((prev) =>
      prev.map((e) => {
        if (e.id === enrollmentId) {
          const updated: Enrollment = {
            ...e,
            adminNotes: notes,
            subscriptionTimeline: [
              {
                id: `tl-note-${Date.now()}`,
                action: "Admin Note Saved",
                date: "01 Aug 2026",
                details: `Internal note updated: "${notes.substring(0, 40)}..."`,
                type: "note",
              },
              ...e.subscriptionTimeline,
            ],
          };

          if (selectedEnrollment?.id === enrollmentId) {
            setSelectedEnrollment(updated);
          }

          return updated;
        }
        return e;
      }),
    );

    toast.success("Admin notes saved successfully!");
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
      <EnrollmentsTable
        enrollments={enrollments}
        onSelectEnrollment={(item) => setSelectedEnrollment(item)}
        onManageSubscription={(item) => setSelectedEnrollment(item)}
      />

      {/* 4. Manage Subscription Right-Side Drawer */}
      <ManageSubscriptionDrawer
        enrollment={selectedEnrollment}
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
