import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          user: null,
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        phone: user.phone,
        discordName: user.discordName,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("SESSION_CHECK_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        user: null,
      },
      { status: 500 },
    );
  }
}
