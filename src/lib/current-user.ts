import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AccountStatus, UserRole } from "@/generated/prisma/client";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth/session";

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const session = await verifySession(token);

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      phone: true,
      password: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return null;
  }

  if (user.status !== AccountStatus.ACTIVE) {
    return null;
  }

  return user;
}

export async function getRequiredUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function getRequiredSuperAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  if (user.role !== UserRole.SUPER_ADMIN) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
