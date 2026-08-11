// add video via URL route

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActivityAction, ActivityActorType } from "@/generated/prisma/client";
import { getRequiredSuperAdmin } from "@/lib/current-user";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ coursesId: string }> },
) {
  try {
    const adminUser = await getRequiredSuperAdmin();
    const { coursesId } = await params;
    const courseId = coursesId;
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const videoUrl = typeof body.videoUrl === "string" ? body.videoUrl.trim() : "";
    const durationSeconds =
      typeof body.durationSeconds === "number" && body.durationSeconds >= 0
        ? body.durationSeconds
        : 0;
    const isPreview = body.isPreview === true;

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Video title is required." },
        { status: 400 },
      );
    }

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, message: "Video URL is required." },
        { status: 400 },
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, deletedAt: true },
    });

    if (!course || course.deletedAt) {
      return NextResponse.json(
        { success: false, message: "Course not found." },
        { status: 404 },
      );
    }

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let suffix = 1;

    while (
      await prisma.lesson.findUnique({
        where: { courseId_slug: { courseId, slug } },
      })
    ) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const maxOrder = await prisma.lesson.aggregate({
      _max: { displayOrder: true },
      where: { courseId, deletedAt: null },
    });

    const result = await prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.create({
        data: {
          courseId,
          title,
          slug,
          videoUrl,
          durationSeconds,
          isPreview,
          displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
        },
      });

      await tx.activityLog.create({
        data: {
          actorId: adminUser.id,
          actorType: ActivityActorType.SUPER_ADMIN,
          action: ActivityAction.LESSON_CREATED,
          module: "COURSES",
          title: "Video added",
          description: `Video "${lesson.title}" was added to a course.`,
          targetId: lesson.id,
          targetType: "LESSON",
          afterData: { lessonId: lesson.id, courseId, title: lesson.title },
        },
      });

      return lesson;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Video added successfully.",
        lesson: result,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST lesson error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A video with this order already exists in the course.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to add video." },
      { status: 500 },
    );
  }
}
