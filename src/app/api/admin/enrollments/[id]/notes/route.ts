import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionEventType } from "@/generated/prisma/client";
import {
  transformSubscriptionToUI,
  subscriptionIncludeSelector,
} from "@/lib/enrollment-transform";

import { getCurrentAdminUser } from "@/lib/current-user";

export const runtime = "nodejs";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const adminUser = await getCurrentAdminUser();

    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized admin access" },
        { status: 401 }
      );
    }
    const { id } = await params;
    const body = await request.json();
    const notes = String(body.notes || "").trim();

    const existingSub = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!existingSub || existingSub.deletedAt) {
      return NextResponse.json(
        { success: false, message: "Subscription not found" },
        { status: 404 }
      );
    }

    const author =
      (await prisma.user.findFirst({
        where: {
          role: { in: ["SUPER_ADMIN", "ADMIN"] },
        },
      })) ||
      (await prisma.user.findFirst({ where: { id: existingSub.userId } }));

    if (!author) {
      return NextResponse.json(
        { success: false, message: "Author user not found" },
        { status: 400 }
      );
    }

    await prisma.subscriptionNote.create({
      data: {
        subscriptionId: id,
        authorId: author.id,
        note: notes,
      },
    });

    const updatedSub = await prisma.subscription.update({
      where: { id },
      data: {
        events: {
          create: {
            type: SubscriptionEventType.NOTE_ADDED,
            title: "Admin Note Saved",
            description: notes
              ? `Internal note updated: "${notes.substring(0, 40)}..."`
              : "Internal note cleared.",
          },
        },
      },
      include: subscriptionIncludeSelector,
    });

    const transformed = transformSubscriptionToUI(updatedSub);

    return NextResponse.json({
      success: true,
      enrollment: transformed,
      message: "Admin notes saved successfully",
    });
  } catch (error) {
    console.error("PATCH /api/enrollments/[id]/notes error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save admin notes" },
      { status: 500 }
    );
  }
}
