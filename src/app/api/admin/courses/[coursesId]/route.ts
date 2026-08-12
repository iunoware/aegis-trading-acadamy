import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ActivityAction,
  ActivityActorType,
  ContentStatus,
} from "@/generated/prisma/client";
import { getRequiredSuperAdmin } from "@/lib/current-user";
import { deleteVideoFile, saveThumbnail } from "@/lib/video-storage";
import { deleteThumbnailFile } from "@/lib/thumbnail-storage";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ coursesId: string }> },
) {
  try {
    const adminUser = await getRequiredSuperAdmin();
    const { coursesId } = await params;
    const courseId = coursesId;
    const formData = await request.formData();

    const existing = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, status: true, thumbnailUrl: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Course not found." },
        { status: 404 },
      );
    }

    const title = formData.get("title")?.toString().trim();
    const description = formData.get("description")?.toString().trim();
    const statusRaw = formData.get("status")?.toString();
    const status =
      statusRaw === "PUBLISHED" ||
      statusRaw === "DRAFT" ||
      statusRaw === "HIDDEN"
        ? (statusRaw as ContentStatus)
        : undefined;
    const thumbnailFile = formData.get("thumbnail");

    if (title !== undefined && !title) {
      return NextResponse.json(
        { success: false, message: "Course title cannot be empty." },
        { status: 400 },
      );
    }

    let thumbnailUrl: string | undefined;
    if (thumbnailFile instanceof File) {
      thumbnailUrl = await saveThumbnail(thumbnailFile);
      await deleteThumbnailFile(existing.thumbnailUrl);
    }

    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const course = await tx.course.update({
        where: { id: courseId },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined
            ? { description: description || null }
            : {}),
          ...(thumbnailUrl !== undefined ? { thumbnailUrl } : {}),
          ...(status !== undefined ? { status } : {}),
          updatedById: adminUser.id,
          ...(status === ContentStatus.PUBLISHED &&
          existing.status !== ContentStatus.PUBLISHED
            ? { publishedAt: now }
            : {}),
        },
      });

      await tx.activityLog.create({
        data: {
          actorId: adminUser.id,
          actorType: ActivityActorType.SUPER_ADMIN,
          action: ActivityAction.COURSE_UPDATED,
          module: "COURSES",
          title: "Course updated",
          description: `Course "${course.title}" was updated.`,
          targetId: course.id,
          targetType: "COURSE",
          beforeData: existing,
          afterData: { title: course.title, status: course.status },
        },
      });

      return course;
    });

    return NextResponse.json({
      success: true,
      message: "Course updated successfully.",
      course: updated,
    });
  } catch (error: unknown) {
    console.error("PATCH course error:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, message: "A course with this title already exists." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to update course." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ coursesId: string }> },
) {
  try {
    const adminUser = await getRequiredSuperAdmin();
    const { coursesId } = await params;
    const courseId = coursesId;

    const existing = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        lessons: { select: { id: true, title: true, videoUrl: true } },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Course not found." },
        { status: 404 },
      );
    }

    await deleteThumbnailFile(existing.thumbnailUrl);

    const localFiles = existing.lessons.filter(
      (l) => !l.videoUrl.startsWith("http"),
    );
    await Promise.all(
      localFiles.map((l) =>
        deleteVideoFile(l.videoUrl).catch((err) => {
          console.error(`Failed to delete video file for lesson ${l.id}:`, err);
        }),
      ),
    );

    await prisma.$transaction(async (tx) => {
      await tx.activityLog.create({
        data: {
          actorId: adminUser.id,
          actorType: ActivityActorType.SUPER_ADMIN,
          action: ActivityAction.COURSE_DELETED,
          module: "COURSES",
          title: "Course deleted",
          description: `Course "${existing.title}" and its ${existing.lessons.length} video(s) were permanently deleted.`,
          targetId: existing.id,
          targetType: "COURSE",
          beforeData: {
            title: existing.title,
            lessonCount: existing.lessons.length,
          },
        },
      });

      await tx.course.delete({ where: { id: courseId } });
    });

    return NextResponse.json({
      success: true,
      message: "Course deleted permanently.",
    });
  } catch (error) {
    console.error("DELETE course error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete course." },
      { status: 500 },
    );
  }
}
