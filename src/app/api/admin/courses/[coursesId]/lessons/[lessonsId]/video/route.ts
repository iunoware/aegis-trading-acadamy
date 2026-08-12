import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface RouteContext {
  params: Promise<{
    coursesId: string;
    lessonsId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { coursesId, lessonsId } = await params;

    const { prisma } = await import("@/lib/prisma");

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonsId,
        courseId: coursesId,
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

    const filePath = path.join(process.cwd(), "storage", "videos", lesson.videoUrl);
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
