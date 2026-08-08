"use client";

import React from "react";
import { BaseSidebar } from "./BaseSidebar";
import { UserProfileCard } from "./UserProfileCard";
import { User } from "@/app/(client)/(web)/(dashboard)/admin/users/(components)/UsersTable";
import { AccountInfoCard } from "@/app/(client)/(web)/(dashboard)/admin/users/(components)/AccountInfoCard";
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
}

export function UserSidebar({
  isOpen,
  onClose,
  user,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
}: UserSidebarProps) {
  if (!user) return null;

  return (
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

      {/* 3. User Actions */}
      <UserActions
        user={user}
        onEditUser={onEditUser}
        onToggleStatus={onToggleStatus}
        onDeleteUser={(id) => {
          onDeleteUser(id);
          onClose();
        }}
      />

      {/* 4. User Activity Timeline */}
      <ActivityTimeline activities={user.activityTimeline} />
    </BaseSidebar>
  );
}
