import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP, hashOTP } from "@/lib/otp";
import { sendPasswordResetCode } from "@/lib/mail";
import { AccountStatus, UserRole } from "@/generated/prisma/client";

export const runtime = "nodejs";

const GENERIC_SUCCESS_MESSAGE =
  "If an account exists with this email address, a password reset code has been sent.";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email address is required.",
        },
        { status: 400 },
      );
    }

    // Lookup user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    const isEligibleStudent = Boolean(
      user &&
        !user.deletedAt &&
        user.role === UserRole.STUDENT &&
        user.status === AccountStatus.ACTIVE,
    );

    console.log("[FORGOT_PASSWORD_DIAGNOSTICS]", {
      emailProvided: Boolean(email),
      userFound: Boolean(user),
      isEligibleStudent,
    });

    // Security: Protect against email enumeration
    // Return identical success response for non-existent users, deleted accounts, or non-students
    if (!user || !isEligibleStudent) {
      console.log("[FORGOT_PASSWORD_INFO] Account not eligible or not found for reset.");
      return NextResponse.json({
        success: true,
        message: GENERIC_SUCCESS_MESSAGE,
      });
    }

    // Generate secure 6-digit OTP & its SHA-256 hash
    const plainOTP = generateOTP();
    const hashedOTP = hashOTP(plainOTP);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete previous unused reset tokens for this student to keep only 1 active code
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Create new PasswordResetToken record
    const createdToken = await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashedOTP,
        expiresAt,
      },
    });

    console.log("[FORGOT_PASSWORD_INFO] PasswordResetToken created in DB. Attempting SMTP delivery...");

    // Send plain 6-digit OTP via Nodemailer
    const mailResult = await sendPasswordResetCode(email, plainOTP);

    if (!mailResult.success) {
      console.error("FORGOT_PASSWORD_SMTP_FAILED", mailResult.error);

      // Clean up the created token record if email sending fails
      await prisma.passwordResetToken.delete({
        where: { id: createdToken.id },
      }).catch(() => null);

      return NextResponse.json(
        {
          success: false,
          error:
            "We couldn't send the password reset email. Please check your SMTP configuration and try again.",
        },
        { status: 500 },
      );
    }

    console.log("[FORGOT_PASSWORD_SUCCESS] Password reset email successfully delivered.");

    return NextResponse.json({
      success: true,
      message: GENERIC_SUCCESS_MESSAGE,
    });
  } catch (error: any) {
    console.error("FORGOT_PASSWORD_ERROR", error?.message || error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong. Please try again later.",
      },
      { status: 500 },
    );
  }
}
