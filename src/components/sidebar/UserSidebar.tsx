"use client";

import React, { useState } from "react";
import { BaseSidebar } from "./BaseSidebar";
import { UserProfileCard } from "./UserProfileCard";
import { User } from "@/app/(client)/(web)/(dashboard)/admin/users/(components)/UsersTable";
import { AccountInfoCard } from "@/app/(client)/(web)/(dashboard)/admin/users/(components)/AccountInfoCard";
import { SubscriptionCard } from "@/app/(client)/(web)/(dashboard)/admin/users/(components)/SubscriptionCard";
import { GiveSubscriptionModal } from "@/app/(client)/(web)/(dashboard)/admin/users/(components)/GiveSubscriptionModal";
import { RevokeSubscriptionModal } from "@/app/(client)/(web)/(dashboard)/admin/users/(components)/RevokeSubscriptionModal";
import { ActivityTimeline } from "@/app/(client)/(web)/(dashboard)/admin/users/(components)/ActivityTimeline";
import { UserActions } from "@/app/(client)/(web)/(dashboard)/admin/users/(components)/UserActions";
import { User as UserIcon } from "lucide-react";

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onEditUser: (user: User) => void;
  onToggleStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onUserUpdated?: (updatedUser: User) => void;
}

export function UserSidebar({
  isOpen,
  onClose,
  user,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
  onUserUpdated,
}: UserSidebarProps) {
  const [isGiveModalOpen, setIsGiveModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);

  if (!user) return null;

  const handleSubscriptionSuccess = (updatedUser: User) => {
    if (onUserUpdated) {
      onUserUpdated(updatedUser);
    }
  };

  return (
    <>
      <BaseSidebar
        isOpen={isOpen}
        onClose={onClose}
        title="REGISTERED USER ACCOUNT"
        subtitle={user.name}
        icon={<UserIcon size={16} />}
        maxWidthClass="max-w-xl"
      >
        {/* 1. Reusable User Profile Card */}
        <UserProfileCard
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            discordName: user.discordName,
            status: user.accountStatus,
            joinedDate: user.joinedDate,
          }}
        />

        {/* 2. Account Specific Details */}
        <AccountInfoCard user={user} />

        {/* 3. Subscription Management Section */}
        <SubscriptionCard
          user={user}
          onOpenGiveModal={() => setIsGiveModalOpen(true)}
          onOpenRevokeModal={() => setIsRevokeModalOpen(true)}
        />

        {/* 4. User Actions */}
        <UserActions
          user={user}
          onEditUser={onEditUser}
          onToggleStatus={onToggleStatus}
          onDeleteUser={(id) => {
            onDeleteUser(id);
            onClose();
          }}
        />

        {/* 5. User Activity Timeline */}
        <ActivityTimeline activities={user.activityTimeline} />
      </BaseSidebar>

      {/* Give / Change Subscription Modal */}
      <GiveSubscriptionModal
        isOpen={isGiveModalOpen}
        onClose={() => setIsGiveModalOpen(false)}
        user={user}
        onSuccess={handleSubscriptionSuccess}
      />

      {/* Revoke Subscription Confirmation Modal */}
      <RevokeSubscriptionModal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        user={user}
        onSuccess={handleSubscriptionSuccess}
      />
    </>
  );
}
