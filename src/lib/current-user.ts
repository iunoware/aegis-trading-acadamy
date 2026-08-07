import "server-only";

import { prisma } from "@/db/prisma";
import { getSession } from "@/lib/auth/session";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STUDENT";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();

  if (!session?.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
}

export async function getRequiredCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function getRequiredSuperAdmin(): Promise<CurrentUser> {
  const user = await getRequiredCurrentUser();

  if (user.role !== "SUPER_ADMIN") {
    throw new Error("FORBIDDEN");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("FORBIDDEN");
  }

  return user;
}
