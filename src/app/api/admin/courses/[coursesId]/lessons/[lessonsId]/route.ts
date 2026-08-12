// to edit or delete a video

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActivityAction, ActivityActorType } from "@/generated/prisma/client";
import { getRequiredSuperAdmin } from "@/lib/current-user";
import { deleteVideoFile } from "@/lib/video-storage";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

const STORAGE_DIR =
  process.env.VIDEO_STORAGE_DIR || path.join(process.cwd(), "storage", "videos");
const ALLOWED_MIME = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];
const MAX_BYTES = 2 * 1024 * 1024 * 1024;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ coursesId: string; lessonsId: string }> },
) {
  try {
    const adminUser = await getRequiredSuperAdmin();
    const { coursesId, lessonsId } = await params;
    const courseId = coursesId;
    const lessonId = lessonsId;
    const formData = await request.formData();

    const existing = await prisma.lesson.findFirst({ where: { id: lessonId, courseId } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Video not found." },
        { status: 404 },
      );
    }

    const title = formData.get("title")?.toString().trim();
    const videoUrlInput = formData.get("videoUrl")?.toString().trim();
    const durationRaw = formData.get("durationSeconds");
    const durationSeconds =
      durationRaw !== null && durationRaw !== "" && !Number.isNaN(Number(durationRaw))
        ? Math.round(Number(durationRaw))
        : undefined;
    const isPreviewRaw = formData.get("isPreview");
    const isPreview =
      isPreviewRaw !== null ? isPreviewRaw.toString() === "true" : undefined;
    const newFile = formData.get("file");

    if (title !== undefined && title === "") {
      return NextResponse.json(
        { success: false, message: "Video title cannot be empty." },
        { status: 400 },
      );
    }

    let videoUrl: string | undefined;

    if (newFile instanceof File) {
      if (!ALLOWED_MIME.includes(newFile.type)) {
        return NextResponse.json(
          { success: false, message: `Unsupported file type: ${newFile.type}` },
          { status: 400 },
        );
      }
      if (newFile.size > MAX_BYTES) {
        return NextResponse.json(
          { success: false, message: "File exceeds the maximum upload size." },
          { status: 413 },
        );
      }

      const ext = path.extname(newFile.name) || ".mp4";
      const fileName = `${crypto.randomUUID()}${ext}`;
      const courseDir = path.join(STORAGE_DIR, courseId);
      await mkdir(courseDir, { recursive: true });
      await writeFile(
        path.join(courseDir, fileName),
        Buffer.from(await newFile.arrayBuffer()),
      );

      if (!existing.videoUrl.startsWith("http")) {
        await deleteVideoFile(existing.videoUrl).catch((err) =>
          console.error(
            `Failed to delete replaced video file for lesson ${lessonId}:`,
            err,
          ),
        );
      }

      videoUrl = `${courseId}/${fileName}`;
    } else if (videoUrlInput) {
      videoUrl = videoUrlInput;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.update({
        where: { id: lessonId },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(videoUrl !== undefined ? { videoUrl } : {}),
          ...(durationSeconds !== undefined ? { durationSeconds } : {}),
          ...(isPreview !== undefined ? { isPreview } : {}),
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
  { params }: { params: Promise<{ coursesId: string; lessonsId: string }> },
) {
  try {
    const adminUser = await getRequiredSuperAdmin();
    const { coursesId, lessonsId } = await params;
    const courseId = coursesId;
    const lessonId = lessonsId;

    const existing = await prisma.lesson.findFirst({ where: { id: lessonId, courseId } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Video not found." },
        { status: 404 },
      );
    }

    if (!existing.videoUrl.startsWith("http")) {
      await deleteVideoFile(existing.videoUrl).catch((err) =>
        console.error(`Failed to delete video file for lesson ${lessonId}:`, err),
      );
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

      await tx.lesson.delete({ where: { id: lessonId } });
    });

    return NextResponse.json({ success: true, message: "Video deleted permanently." });
  } catch (error) {
    console.error("DELETE lesson error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete video." },
      { status: 500 },
    );
  }
}
