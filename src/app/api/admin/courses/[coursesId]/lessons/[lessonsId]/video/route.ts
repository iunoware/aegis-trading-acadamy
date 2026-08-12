import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface RouteContext {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { courseId, lessonId } = await params;

    /*
     * We don't actually need the lesson's videoUrl from the database
     * here because the video file structure is:
     *
     * storage/videos/{courseId}/{filename}.mp4
     *
     * However, we need to know the filename.
     *
     * So this route will query the database.
     */

    const { prisma } = await import("@/lib/prisma");

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        courseId,
        deletedAt: null,
      },
      select: {
        videoUrl: true,
      },
    });

    if (!lesson?.videoUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Video not found",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * videoUrl from database:
     *
     * cmsppun82000g3k3avp71pjq0/7148e5f7-7e30-4686-8bb1-ee94ea4b1869.mp4
     *
     * Actual file:
     *
     * storage/videos/
     *   cmsppun82000g3k3avp71pjq0/
     *     7148e5f7-7e30-4686-8bb1-ee94ea4b1869.mp4
     */

    const filePath = path.join(process.cwd(), "storage", "videos", lesson.videoUrl);

    /*
     * Security check:
     *
     * Make sure the resolved path is still inside
     * storage/videos.
     */
    const storageRoot = path.resolve(process.cwd(), "storage", "videos");

    const resolvedFilePath = path.resolve(filePath);

    if (
      resolvedFilePath !== storageRoot &&
      !resolvedFilePath.startsWith(`${storageRoot}${path.sep}`)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid video path",
        },
        {
          status: 400,
        },
      );
    }

    try {
      await fs.access(resolvedFilePath);
    } catch {
      console.error("Video file does not exist:", resolvedFilePath);

      return NextResponse.json(
        {
          success: false,
          message: "Video file not found",
        },
        {
          status: 404,
        },
      );
    }

    const fileBuffer = await fs.readFile(resolvedFilePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": fileBuffer.length.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Video streaming error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load video",
      },
      {
        status: 500,
      },
    );
  }
}
