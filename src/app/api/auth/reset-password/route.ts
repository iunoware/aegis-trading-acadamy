import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOTPHash } from "@/lib/otp";
import { hashPassword } from "@/lib/auth/password";
import { AccountStatus, UserRole } from "@/generated/prisma/client";

export const runtime = "nodejs";

const INVALID_CODE_ERROR = "Invalid or expired verification code.";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, verification code, and new password are required.",
        },
        { status: 400 },
      );
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid 6-digit numeric verification code.",
        },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "New password must be at least 6 characters long.",
        },
        { status: 400 },
      );
    }

    // 1. Lookup user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      user.deletedAt ||
      user.role !== UserRole.STUDENT ||
      user.status !== AccountStatus.ACTIVE
    ) {
      return NextResponse.json(
        {
          success: false,
          error: INVALID_CODE_ERROR,
        },
        { status: 400 },
      );
    }

    // 2. Find latest active unused PasswordResetToken
    const now = new Date();

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        {
          success: false,
          error: INVALID_CODE_ERROR,
        },
        { status: 400 },
      );
    }

    // 3. Verify submitted OTP hash against stored tokenHash
    const isValidMatch = verifyOTPHash(code, resetToken.tokenHash);

    if (!isValidMatch) {
      return NextResponse.json(
        {
          success: false,
          error: INVALID_CODE_ERROR,
        },
        { status: 400 },
      );
    }

    // 4. Hash new password
    const newPasswordHash = hashPassword(newPassword);

    // 5. Update user's password and passwordChangedAt
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newPasswordHash,
        passwordChangedAt: now,
      },
    });

    // 6. Mark the reset token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: {
        usedAt: now,
      },
    });

    // 7. Invalidate all existing active sessions for this student
    await prisma.authSession.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. Please log in with your new password.",
    });
  } catch (error: any) {
    console.error("RESET_PASSWORD_ERROR", error?.message || error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong while resetting your password.",
      },
      { status: 500 },
    );
  }
}
