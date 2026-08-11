import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { AccountStatus, UserRole } from "@/generated/prisma/client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : (typeof body.name === "string" ? body.name.trim() : "");
    const phone = typeof body.phone === "string" ? body.phone.trim() : null;
    const discordName = typeof body.discordName === "string" ? body.discordName.trim() : null;

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

    // Check if account already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email address already exists.",
        },
        { status: 400 },
      );
    }

    // Derive firstName and lastName
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || fullName;
    const lastName = nameParts.slice(1).join(" ") || null;

    const passwordHash = hashPassword(password);

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
      },
    });

    // Create session token and log in immediately
    const token = await createSession(newUser.id, newUser.role);

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: newUser,
      },
      { status: 201 },
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("REGISTER_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong while creating your account.",
      },
      { status: 500 },
    );
  }
}
