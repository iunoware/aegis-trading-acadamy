import { prisma } from "@/lib/prisma";
import { AccountStatus, SubscriptionStatus, UserRole } from "@/generated/prisma/client";
import { getCurrentStudentUser } from "@/lib/current-user";

export async function getActiveStudentSubscription() {
  const user = await getCurrentStudentUser();

  if (!user) {
    return {
      authenticated: false,
      hasSubscription: false,
      user: null,
      subscription: null,
    };
  }

  if (user.role !== UserRole.STUDENT || user.status !== AccountStatus.ACTIVE) {
    return {
      authenticated: false,
      hasSubscription: false,
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
    select: {
      id: true,
      status: true,
      startDate: true,
      currentExpiryDate: true,
      plan: {
        select: {
          id: true,
          type: true,
          name: true,
        },
      },
    },
  });

  return {
    authenticated: true,
    hasSubscription: !!subscription,
    user,
    subscription,
  };
}
