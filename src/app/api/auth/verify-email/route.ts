import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOTPHash } from "@/lib/otp";
import { createSession, STUDENT_SESSION_COOKIE } from "@/lib/auth/session";
import { AccountStatus, UserRole } from "@/generated/prisma/client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";

    if (!email || !code) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and verification code are required.",
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

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 2. Confirm account exists
    if (!user || user.deletedAt) {
      return NextResponse.json(
        {
          success: false,
          error: "Account not found.",
        },
        { status: 404 },
      );
    }

    if (user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification is only applicable to student accounts.",
        },
        { status: 403 },
      );
    }

    if (user.status !== AccountStatus.ACTIVE) {
      return NextResponse.json(
        {
          success: false,
          error: "This account is inactive.",
        },
        { status: 403 },
      );
    }

    // 3. Check whether email is already verified
    if (user.emailVerifiedAt) {
      const token = await createSession(user.id, user.role, "STUDENT");

      const response = NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "Email is already verified. You are now logged in.",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

      response.cookies.set({
        name: STUDENT_SESSION_COOKIE,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // 4. Check OTP expiry (10 mins)
    const now = new Date();

    if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < now) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification code has expired. Please request a new code.",
          expired: true,
        },
        { status: 400 },
      );
    }

    // 5. Check maximum attempts (5)
    if (user.emailVerificationAttempts >= 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Maximum verification attempts exceeded. Please request a new verification code.",
          maxAttemptsExceeded: true,
        },
        { status: 400 },
      );
    }

    // 6 & 7. Hash submitted OTP & compare with stored hash
    const isValidMatch = user.emailVerificationCode
      ? verifyOTPHash(code, user.emailVerificationCode)
      : false;

    // 8. Reject incorrect OTPs and increment attempts
    if (!isValidMatch) {
      const updatedAttempts = user.emailVerificationAttempts + 1;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationAttempts: updatedAttempts,
        },
      });

      const remainingAttempts = Math.max(0, 5 - updatedAttempts);

      if (remainingAttempts === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Maximum verification attempts reached. Please request a new code.",
            maxAttemptsExceeded: true,
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `Invalid verification code. You have ${remainingAttempts} attempt${
            remainingAttempts === 1 ? "" : "s"
          } remaining.`,
          remainingAttempts,
        },
        { status: 400 },
      );
    }

    // 9. On success: clear OTP fields and mark email verified
    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: now,
        emailVerificationCode: null,
        emailVerificationExpiresAt: null,
        emailVerificationAttempts: 0,
        emailVerificationLastSentAt: null,
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
      },
    });

    // 10 & 11. ONLY after successful verification create student session and set cookie
    const token = await createSession(verifiedUser.id, verifiedUser.role, "STUDENT");

    const response = NextResponse.json(
      {
        success: true,
        message: "Email verified successfully!",
        user: verifiedUser,
      },
      { status: 200 },
    );

    response.cookies.set({
      name: STUDENT_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("VERIFY_EMAIL_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong while verifying your email.",
      },
      { status: 500 },
    );
  }
}
