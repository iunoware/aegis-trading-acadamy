import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AccountStatus, UserRole } from "@/generated/prisma/client";
import {
  STUDENT_SESSION_COOKIE,
  ADMIN_SESSION_COOKIE,
  verifySession,
} from "@/lib/auth/session";

export async function getCurrentStudentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;

  const session = await verifySession(token);

  if (!session || session.type !== "STUDENT" || session.role !== UserRole.STUDENT) {
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
      discordName: true,
      password: true,
      role: true,
      status: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user || user.deletedAt || user.status !== AccountStatus.ACTIVE || user.role !== UserRole.STUDENT) {
    return null;
  }

  return user;
}

export async function getCurrentAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  const session = await verifySession(token);

  if (
    !session ||
    session.type !== "ADMIN" ||
    (session.role !== UserRole.ADMIN && session.role !== UserRole.SUPER_ADMIN)
  ) {
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
      role: true,
      status: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (
    !user ||
    user.deletedAt ||
    user.status !== AccountStatus.ACTIVE ||
    (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)
  ) {
    return null;
  }

  return user;
}

export type AdminUser = NonNullable<Awaited<ReturnType<typeof getCurrentAdminUser>>>;

export async function getCurrentUser() {
  return getCurrentStudentUser();
}

export async function getRequiredUser() {
  const user = await getCurrentStudentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function getRequiredSuperAdmin() {
  const user = await getCurrentAdminUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ADMIN) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
