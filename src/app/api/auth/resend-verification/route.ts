import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP, hashOTP } from "@/lib/otp";
import { sendRegistrationVerificationCode } from "@/lib/mail";
import { UserRole } from "@/generated/prisma/client";

export const runtime = "nodejs";

const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

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

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Do not reveal unnecessary account information if non-existent or not a student
    if (!user || user.deletedAt || user.role !== UserRole.STUDENT) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a verification code has been sent.",
      });
    }

    // Check if already verified
    if (user.emailVerifiedAt) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "Your email address is already verified.",
      });
    }

    // Enforce 60-second resend cooldown
    const now = new Date();

    if (user.emailVerificationLastSentAt) {
      const timeElapsed = now.getTime() - new Date(user.emailVerificationLastSentAt).getTime();

      if (timeElapsed < RESEND_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - timeElapsed) / 1000);

        return NextResponse.json(
          {
            success: false,
            error: `Please wait ${remainingSeconds} second${
              remainingSeconds === 1 ? "" : "s"
            } before requesting a new code.`,
            remainingSeconds,
          },
          { status: 429 },
        );
      }
    }

    // Generate new 6-digit plain OTP & hash it
    const plainOTP = generateOTP();
    const hashedOTP = hashOTP(plainOTP);
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationCode: hashedOTP,
        emailVerificationExpiresAt: expiresAt,
        emailVerificationAttempts: 0,
        emailVerificationLastSentAt: now,
      },
    });

    // Send the new plain OTP via Nodemailer
    const mailResult = await sendRegistrationVerificationCode(user.email, plainOTP);

    if (!mailResult.success) {
      console.error("RESEND_VERIFICATION_SMTP_FAILED", mailResult.error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to send verification email via SMTP. Please try again.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "A new verification code has been sent to your email.",
    });
  } catch (error: any) {
    console.error("RESEND_VERIFICATION_ERROR", error?.message || error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong while resending the verification code.",
      },
      { status: 500 },
    );
  }
}
