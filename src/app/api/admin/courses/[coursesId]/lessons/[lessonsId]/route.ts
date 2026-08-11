// to edit or delete a video

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActivityAction, ActivityActorType } from "@/generated/prisma/client";
import { getRequiredSuperAdmin } from "@/lib/current-user";
import { deleteVideoFile } from "@/lib/video-storage";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> },
) {
  try {
    const adminUser = await getRequiredSuperAdmin();
    const { courseId, lessonId } = await params;
    const body = await request.json();

    const existing = await prisma.lesson.findFirst({
      where: { id: lessonId, courseId, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Video not found." },
        { status: 404 },
      );
    }

    const title = typeof body.title === "string" ? body.title.trim() : undefined;
    const videoUrl = typeof body.videoUrl === "string" ? body.videoUrl.trim() : undefined;
    const durationSeconds =
      typeof body.durationSeconds === "number" && body.durationSeconds >= 0
        ? body.durationSeconds
        : undefined;
    const isPreview = typeof body.isPreview === "boolean" ? body.isPreview : undefined;
    const displayOrder =
      typeof body.displayOrder === "number" ? body.displayOrder : undefined;

    if (title !== undefined && !title) {
      return NextResponse.json(
        { success: false, message: "Video title cannot be empty." },
        { status: 400 },
      );
    }

    if (videoUrl !== undefined && !videoUrl) {
      return NextResponse.json(
        { success: false, message: "Video URL cannot be empty." },
        { status: 400 },
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.update({
        where: { id: lessonId },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(videoUrl !== undefined ? { videoUrl } : {}),
          ...(durationSeconds !== undefined ? { durationSeconds } : {}),
          ...(isPreview !== undefined ? { isPreview } : {}),
          ...(displayOrder !== undefined ? { displayOrder } : {}),
        },
      });

      await tx.activityLog.create({
        data: {
          actorId: adminUser.id,
          actorType: ActivityActorType.SUPER_ADMIN,
          action: ActivityAction.LESSON_UPDATED,
          module: "COURSES",
          title: "Video updated",
          description: `Video "${lesson.title}" was updated.`,
          targetId: lesson.id,
          targetType: "LESSON",
          beforeData: existing,
          afterData: { title: lesson.title, isPreview: lesson.isPreview },
        },
      });

      return lesson;
    });

    return NextResponse.json({
      success: true,
      message: "Video updated successfully.",
      lesson: updated,
    });
  } catch (error: unknown) {
    console.error("PATCH lesson error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, message: "A video with this order/slug already exists." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update video." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> },
) {
  try {
    const adminUser = await getRequiredSuperAdmin();
    const { courseId, lessonId } = await params;

    const existing = await prisma.lesson.findFirst({
      where: { id: lessonId, courseId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Video not found." },
        { status: 404 },
      );
    }

    // Unlink the actual file from disk first (only for locally-uploaded videos)
    if (!existing.videoUrl.startsWith("http")) {
      try {
        await deleteVideoFile(existing.videoUrl);
      } catch (err) {
        console.error(`Failed to delete video file for lesson ${lessonId}:`, err);
        // Continue anyway — don't block the DB delete on a disk cleanup failure
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.activityLog.create({
        data: {
          actorId: adminUser.id,
          actorType: ActivityActorType.SUPER_ADMIN,
          action: ActivityAction.LESSON_DELETED,
          module: "COURSES",
          title: "Video deleted",
          description: `Video "${existing.title}" was permanently deleted.`,
          targetId: existing.id,
          targetType: "LESSON",
          beforeData: { title: existing.title, videoUrl: existing.videoUrl },
        },
      });

      // Cascades: LessonProgress rows for this lesson delete automatically
      await tx.lesson.delete({ where: { id: lessonId } });
    });

    return NextResponse.json({
      success: true,
      message: "Video deleted permanently.",
    });
  } catch (error) {
    console.error("DELETE lesson error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete video." },
      { status: 500 },
    );
  }
}
