import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { success: false, message: "Admin reset password endpoint not implemented." },
    { status: 501 }
  );
}
