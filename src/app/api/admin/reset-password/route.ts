import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getRequiredSuperAdmin } from "@/lib/current-user";

export const runtime = "nodejs";

// Password must be at least 8 characters and contain one number and one special character.
const STRONG_PASSWORD_PATTERN = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export async function PATCH(request: NextRequest) {
  try {
    const adminUser = await getRequiredSuperAdmin();

    const body = await request.json();

    const passwordPayload =
      typeof body.password === "object" && body.password !== null ? body.password : null;

    if (!passwordPayload) {
      return NextResponse.json(
        { success: false, message: "Password fields are required." },
        { status: 400 },
      );
    }

    const currentPassword =
      typeof passwordPayload.currentPassword === "string"
        ? passwordPayload.currentPassword
        : "";
    const newPassword =
      typeof passwordPayload.newPassword === "string" ? passwordPayload.newPassword : "";
    const confirmPassword =
      typeof passwordPayload.confirmPassword === "string"
        ? passwordPayload.confirmPassword
        : "";

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password, new password, and confirmation are all required.",
        },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "New password and confirmation do not match." },
        { status: 400 },
      );
    }

    if (!STRONG_PASSWORD_PATTERN.test(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "New password must be at least 8 characters and contain one number and one special character.",
        },
        { status: 400 },
      );
    }

    // Fetch the stored hash for this admin — getRequiredSuperAdmin() doesn't
    // select `password`, so we look it up explicitly by the session's user id.
    const userWithPassword = await prisma.user.findUnique({
      where: { id: adminUser.id },
      select: { id: true, password: true },
    });

    if (!userWithPassword) {
      return NextResponse.json(
        { success: false, message: "Admin account not found." },
        { status: 404 },
      );
    }

    const isCurrentPasswordValid = verifyPassword(
      currentPassword,
      userWithPassword.password,
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect." },
        { status: 401 },
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be different from your current password.",
        },
        { status: 400 },
      );
    }

    const hashedNewPassword = hashPassword(newPassword);

    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        password: hashedNewPassword,
        passwordChangedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password updated successfully.",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "You must be logged in to do this." },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, message: "You do not have permission to do this." },
        { status: 403 },
      );
    }

    console.error("ADMIN_RESET_PASSWORD_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong while updating your password." },
      { status: 500 },
    );
  }
}
