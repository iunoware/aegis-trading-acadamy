"use client";

import React from "react";
import { BaseSidebar } from "./BaseSidebar";
import { UserProfileCard } from "./UserProfileCard";
import { EnrollmentDetails } from "./sections/EnrollmentDetails";
import { PaymentHistory, PaymentRecord } from "./sections/PaymentHistory";
import { SubscriptionTimeline, TimelineRecord } from "./sections/SubscriptionTimeline";
import { NotesPanel } from "./sections/NotesPanel";
import { Settings } from "lucide-react";

export interface EnrollmentSidebarData {
  id: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  discordName?: string;
  avatar?: string;
  currentPlan: "Monthly Plan" | "Yearly Plan";
  purchaseDate: string;
  expiryDate: string;
  status: "Active" | "Expiring Soon" | "Expired" | "Cancelled";
  adminNotes?: string;
  paymentHistory: PaymentRecord[];
  subscriptionTimeline: TimelineRecord[];
}

interface EnrollmentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  data: EnrollmentSidebarData | null;
  onExtendSubscription: (enrollmentId: string, days: number) => void;
  onChangePlan: (
    enrollmentId: string,
    newPlan: "Monthly Plan" | "Yearly Plan"
  ) => void;
  onToggleStatus: (enrollmentId: string) => void;
  onSaveNotes: (enrollmentId: string, notes: string) => void;
}

export function EnrollmentSidebar({
  isOpen,
  onClose,
  data,
  onExtendSubscription,
  onChangePlan,
  onToggleStatus,
  onSaveNotes,
}: EnrollmentSidebarProps) {
  if (!data) return null;

  return (
    <BaseSidebar
      isOpen={isOpen}
      onClose={onClose}
      title="MANAGE SUBSCRIPTION LIFECYCLE"
      subtitle={data.userName}
      icon={<Settings size={16} />}
      maxWidthClass="max-w-2xl"
    >
      {/* 1. Reusable User Profile Card */}
      <UserProfileCard
        user={{
          name: data.userName,
          email: data.userEmail,
          phone: data.userPhone,
          discordName: data.discordName,
          avatar: data.avatar,
          status: data.status,
        }}
      />

      {/* 2. Enrollment & Lifecycle Details */}
      <EnrollmentDetails
        subscription={{
          id: data.id,
          currentPlan: data.currentPlan,
          purchaseDate: data.purchaseDate,
          expiryDate: data.expiryDate,
          status: data.status,
        }}
        onExtendSubscription={onExtendSubscription}
        onChangePlan={onChangePlan}
        onToggleStatus={onToggleStatus}
      />

      {/* 3. Payment History */}
      <PaymentHistory payments={data.paymentHistory} />

      {/* 4. Subscription Timeline */}
      <SubscriptionTimeline timeline={data.subscriptionTimeline} />

      {/* 5. Notes Panel */}
      <NotesPanel
        initialNotes={data.adminNotes}
        onSaveNotes={(notes) => onSaveNotes(data.id, notes)}
      />
    </BaseSidebar>
  );
}
