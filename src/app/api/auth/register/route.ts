/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { generateOTP, hashOTP } from "@/lib/otp";
import { sendRegistrationVerificationCode } from "@/lib/mail";
import { AccountStatus, UserRole } from "@/generated/prisma/client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const fullName =
      typeof body.fullName === "string"
        ? body.fullName.trim()
        : typeof body.name === "string"
          ? body.name.trim()
          : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : null;
    const discordName =
      typeof body.discordName === "string" ? body.discordName.trim() : null;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        {
          success: false,
          error: "Full name, email, and password are required.",
        },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters long.",
        },
        { status: 400 },
      );
    }

    // Derive firstName and lastName
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || fullName;
    const lastName = nameParts.slice(1).join(" ") || null;

    const passwordHash = hashPassword(password);

    // Generate 6-digit plain OTP and its SHA-256 hash
    const plainOTP = generateOTP();
    const hashedOTP = hashOTP(plainOTP);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes expiry

    // Check if user already exists by email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Check if phone number is already used by another user
    if (phone) {
      const existingPhoneUser = await prisma.user.findFirst({
        where: {
          phone,
          ...(existingUser ? { id: { not: existingUser.id } } : {}),
        },
      });

      if (existingPhoneUser) {
        return NextResponse.json(
          {
            success: false,
            error: "An account with this phone number already exists.",
          },
          { status: 400 },
        );
      }
    }

    if (existingUser) {
      if (existingUser.deletedAt) {
        return NextResponse.json(
          {
            success: false,
            error: "This account has been deleted.",
          },
          { status: 403 },
        );
      }

      // If user exists and is already verified, reject duplicate registration
      if (existingUser.emailVerifiedAt) {
        return NextResponse.json(
          {
            success: false,
            error: "An account with this email address already exists. Please sign in.",
          },
          { status: 400 },
        );
      }

      // If unverified student is re-registering, update their credentials and refresh OTP
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: fullName,
          firstName,
          lastName,
          phone: phone || existingUser.phone,
          discordName: discordName || existingUser.discordName,
          password: passwordHash,
          emailVerificationCode: hashedOTP,
          emailVerificationExpiresAt: expiresAt,
          emailVerificationAttempts: 0,
          emailVerificationLastSentAt: now,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          name: true,
          email: true,
          phone: true,
          discordName: true,
          role: true,
          status: true,
          emailVerifiedAt: true,
        },
      });

      // Send plain OTP via Nodemailer
      const mailResult = await sendRegistrationVerificationCode(email, plainOTP);

      if (!mailResult.success) {
        console.error("REGISTER_SMTP_FAILED", mailResult.error);

        return NextResponse.json(
          {
            success: false,
            error:
              "We couldn't send the verification email. Please check your SMTP settings and try again.",
          },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          requiresVerification: true,
          email: updatedUser.email,
          message:
            "Account updated! Please check your email for the new verification code.",
          user: updatedUser,
        },
        { status: 201 },
      );
    }

    // Create new student account with emailVerified=false
    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        firstName,
        lastName,
        email,
        phone: phone || null,
        discordName: discordName || null,
        password: passwordHash,
        role: UserRole.STUDENT,
        status: AccountStatus.ACTIVE,
        // emailVerified: false,
        emailVerificationCode: hashedOTP,
        emailVerificationExpiresAt: expiresAt,
        emailVerificationAttempts: 0,
        emailVerificationLastSentAt: now,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        phone: true,
        discordName: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
      },
    });

    // Send plain OTP via Nodemailer
    const mailResult = await sendRegistrationVerificationCode(email, plainOTP);

    if (!mailResult.success) {
      console.error("REGISTER_SMTP_FAILED", mailResult.error);

      // Clean up the created unverified user record if initial email send failed
      await prisma.user.delete({ where: { id: newUser.id } }).catch(() => null);

      return NextResponse.json(
        {
          success: false,
          error:
            "We couldn't send the verification email. Please check your SMTP configuration and try again.",
        },
        { status: 500 },
      );
    }

    // DO NOT create a login session after registration
    return NextResponse.json(
      {
        success: true,
        requiresVerification: true,
        email: newUser.email,
        message:
          "Account created successfully! Please check your email for the verification code.",
        user: newUser,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("REGISTER_ERROR", error?.message || error);

    if (error?.code === "P2002") {
      const target = error.meta?.target;
      const field = Array.isArray(target) ? target.join(", ") : "field";
      return NextResponse.json(
        {
          success: false,
          error: `An account with this ${field} already exists.`,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong while creating your account.",
      },
      { status: 500 },
    );
  }
}
