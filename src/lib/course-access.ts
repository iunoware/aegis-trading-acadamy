// src/lib/course-access.ts

import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/current-user";

export async function getCourseAccess() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      authenticated: false,
      hasActiveSubscription: false,
      user: null,
      subscription: null,
    };
  }

  const now = new Date();

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      status: SubscriptionStatus.ACTIVE,
      deletedAt: null,
      startDate: {
        lte: now,
      },
      currentExpiryDate: {
        gt: now,
      },
    },
    orderBy: {
      currentExpiryDate: "desc",
    },
  });

  return {
    authenticated: true,
    hasActiveSubscription: !!subscription,
    user,
    subscription,
  };
}
