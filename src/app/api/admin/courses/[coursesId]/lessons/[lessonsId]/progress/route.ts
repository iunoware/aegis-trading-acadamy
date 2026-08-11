// save/position or mark complete

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LessonProgressStatus } from "@/generated/prisma/client";
import { getRequiredUser } from "@/lib/current-user";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    const student = await getRequiredUser();
    const { lessonId } = await params;
    const body = await request.json();

    const positionSeconds =
      typeof body.positionSeconds === "number" && body.positionSeconds >= 0
        ? Math.round(body.positionSeconds)
        : null;
    const completed = body.completed === true;

    if (positionSeconds === null) {
      return NextResponse.json(
        { success: false, message: "A valid position is required." },
        { status: 400 },
      );
    }

    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, deletedAt: null },
      select: { id: true, courseId: true, durationSeconds: true },
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, message: "Video not found." },
        { status: 404 },
      );
    }

    const watchPercentage =
      lesson.durationSeconds > 0
        ? Math.min(100, (positionSeconds / lesson.durationSeconds) * 100)
        : 0;
    const isComplete = completed || watchPercentage >= 95;
    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const existingProgress = await tx.lessonProgress.findUnique({
        where: { userId_lessonId: { userId: student.id, lessonId } },
      });

      const wasAlreadyComplete =
        existingProgress?.status === LessonProgressStatus.COMPLETED;
      const furthest = Math.max(
        existingProgress?.furthestPositionSeconds ?? 0,
        positionSeconds,
      );
      const bestWatchPercentage = Math.max(
        existingProgress ? Number(existingProgress.watchPercentage) : 0,
        watchPercentage,
      );

      const lessonProgress = await tx.lessonProgress.upsert({
        where: { userId_lessonId: { userId: student.id, lessonId } },
        create: {
          userId: student.id,
          lessonId,
          status: isComplete
            ? LessonProgressStatus.COMPLETED
            : LessonProgressStatus.IN_PROGRESS,
          lastPositionSeconds: positionSeconds,
          furthestPositionSeconds: positionSeconds,
          totalWatchedSeconds: positionSeconds,
          watchPercentage,
          firstWatchedAt: now,
          lastWatchedAt: now,
          completedAt: isComplete ? now : null,
        },
        update: {
          status: isComplete
            ? LessonProgressStatus.COMPLETED
            : LessonProgressStatus.IN_PROGRESS,
          lastPositionSeconds: positionSeconds,
          furthestPositionSeconds: furthest,
          watchPercentage: bestWatchPercentage,
          lastWatchedAt: now,
          completedAt:
            isComplete && !wasAlreadyComplete
              ? now
              : (existingProgress?.completedAt ?? null),
        },
      });

      const [totalLessons, completedLessons] = await Promise.all([
        tx.lesson.count({ where: { courseId: lesson.courseId, deletedAt: null } }),
        tx.lessonProgress.count({
          where: {
            userId: student.id,
            status: LessonProgressStatus.COMPLETED,
            lesson: { courseId: lesson.courseId, deletedAt: null },
          },
        }),
      ]);

      const courseProgressPercentage =
        totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      const courseProgress = await tx.courseProgress.upsert({
        where: { userId_courseId: { userId: student.id, courseId: lesson.courseId } },
        create: {
          userId: student.id,
          courseId: lesson.courseId,
          startedAt: now,
          lastAccessedAt: now,
          lastLessonId: lessonId,
          totalLessonsSnapshot: totalLessons,
          completedLessonsSnapshot: completedLessons,
          progressPercentage: courseProgressPercentage,
          completedAt: courseProgressPercentage >= 100 ? now : null,
        },
        update: {
          lastAccessedAt: now,
          lastLessonId: lessonId,
          totalLessonsSnapshot: totalLessons,
          completedLessonsSnapshot: completedLessons,
          progressPercentage: courseProgressPercentage,
          completedAt: courseProgressPercentage >= 100 ? now : null,
        },
      });

      return { lessonProgress, courseProgress };
    });

    return NextResponse.json({
      success: true,
      message: "Progress saved.",
      lessonProgress: result.lessonProgress,
      courseProgress: result.courseProgress,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    console.error("POST lesson progress error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to save progress." },
      { status: 500 },
    );
  }
}
