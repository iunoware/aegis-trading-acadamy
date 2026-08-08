import { AccountStatus } from "@/generated/prisma/client";
import type { User as PrismaUser, SubscriptionStatus, ActivityAction } from "@/generated/prisma/client";
import type { User, ActivityRecord } from "@/app/(client)/(web)/(dashboard)/admin/users/(components)/UsersTable";

export type PartialSubscription = {
  id?: string;
  status: SubscriptionStatus | string;
  currentExpiryDate?: Date | string | null;
};

export type PartialActivity = {
  id: string;
  action: ActivityAction | string;
  title?: string | null;
  details?: string | null;
  createdAt: Date | string;
};

export type PrismaUserWithRelations = PrismaUser & {
  subscriptions?: PartialSubscription[];
  accountActivities?: PartialActivity[];
};

/**
 * Formats a Date object into "DD MMM YYYY" (e.g. "15 Jan 2026")
 */
export function formatJoinedDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Converts lastLoginAt into a relative string like "10 mins ago", "2 hours ago", "Yesterday", etc.
 */
export function formatLastLogin(date: Date | string | null | undefined): string {
  if (!date) return "Never";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Never";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "min" : "mins"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "Yesterday";
  }
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
  }

  return formatJoinedDate(d);
}

/**
 * Maps Prisma AccountStatus Enum to UI string:
 * ACTIVE -> "Active"
 * SUSPENDED -> "Suspended"
 * INACTIVE -> "Inactive"
 */
export function mapAccountStatusToUI(status: AccountStatus): "Active" | "Suspended" | "Inactive" {
  switch (status) {
    case AccountStatus.ACTIVE:
      return "Active";
    case AccountStatus.SUSPENDED:
      return "Suspended";
    case AccountStatus.INACTIVE:
    default:
      return "Inactive";
  }
}

/**
 * Maps UI string status to Prisma AccountStatus Enum
 */
export function mapUIToAccountStatus(statusStr: string): AccountStatus {
  const normalized = statusStr.trim().toUpperCase();
  if (normalized === "ACTIVE") return AccountStatus.ACTIVE;
  if (normalized === "SUSPENDED") return AccountStatus.SUSPENDED;
  if (normalized === "INACTIVE") return AccountStatus.INACTIVE;
  return AccountStatus.ACTIVE;
}

/**
 * Transforms a Prisma User record into the expected UI User format
 */
export function transformUserToUI(user: PrismaUserWithRelations): User {
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const fullName = (user.name || `${firstName} ${lastName}`).trim() || "User";

  // Check if active subscription exists
  const isSubscribed = Boolean(
    user.subscriptions &&
      user.subscriptions.some((sub: PartialSubscription) => sub.status === "ACTIVE")
  );

  const joinedDate = formatJoinedDate(user.createdAt);
  const lastLogin = formatLastLogin(user.lastLoginAt);
  const accountStatus = mapAccountStatusToUI(user.status);

  // Activity timeline transformation
  const activityTimeline: ActivityRecord[] =
    user.accountActivities && user.accountActivities.length > 0
      ? user.accountActivities.map((act: PartialActivity) => ({
          id: act.id,
          action: act.title || String(act.action).replace(/_/g, " "),
          date: formatJoinedDate(act.createdAt),
          details: act.details || "",
        }))
      : [
          {
            id: `act-init-${user.id}`,
            action: "Account Created",
            date: joinedDate,
            details: "Registered account on Aegis Trading Academy.",
          },
        ];

  return {
    id: user.id,
    firstName,
    lastName,
    name: fullName,
    email: user.email,
    phone: user.phone || "",
    discordName: user.discordName || "",
    isSubscribed,
    accountStatus,
    joinedDate,
    lastLogin,
    activityTimeline,
  };
}
