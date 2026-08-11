// This will fetch where to resume

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/current-user";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const student = await getRequiredUser();
    const { courseId } = await params;

    const courseProgress = await prisma.courseProgress.findUnique({
      where: { userId_courseId: { userId: student.id, courseId } },
    });

    if (!courseProgress?.lastLessonId) {
      const firstLesson = await prisma.lesson.findFirst({
        where: { courseId, deletedAt: null },
        orderBy: { displayOrder: "asc" },
        select: { id: true },
      });

      return NextResponse.json({
        success: true,
        lessonId: firstLesson?.id ?? null,
        positionSeconds: 0,
      });
    }

    const lessonProgress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: { userId: student.id, lessonId: courseProgress.lastLessonId },
      },
      select: { lastPositionSeconds: true },
    });

    return NextResponse.json({
      success: true,
      lessonId: courseProgress.lastLessonId,
      positionSeconds: lessonProgress?.lastPositionSeconds ?? 0,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    console.error("GET resume error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch resume position." },
      { status: 500 },
    );
  }
}
