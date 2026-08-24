import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCourseAccess } from "@/lib/course-access";
import { s3Client, S3_BUCKET } from "@/lib/s3";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const lessonId = id;

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, deletedAt: null },
  });

  if (!lesson) {
    return NextResponse.json(
      { success: false, message: "Video not found." },
      { status: 404 },
    );
  }

  // Only S3-backed uploads (videoUrl = "courseId/objectKey") go through this route.
  if (lesson.videoUrl.startsWith("http")) {
    return NextResponse.json(
      { success: false, message: "This video is hosted externally." },
      { status: 400 },
    );
  }

  if (!lesson.isPreview) {
    const access = await getCourseAccess();

    if (!access.authenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    if (!access.hasActiveSubscription) {
      return NextResponse.json(
        { success: false, message: "An active subscription is required." },
        { status: 403 },
      );
    }
  }

  const key = lesson.videoUrl; // S3 object key, e.g. "courseId/uuid.mp4"
  const range = request.headers.get("range");

  try {
    const head = await s3Client.send(
      new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key }),
    );

    const totalSize = head.ContentLength ?? 0;
    const contentType = head.ContentType || "video/mp4";

    if (!range) {
      const object = await s3Client.send(
        new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
      );

      const webStream = await object.Body!.transformToWebStream();

      return new Response(webStream, {
        headers: {
          "Content-Length": totalSize.toString(),
          "Content-Type": contentType,
          "Accept-Ranges": "bytes",
        },
      });
    }

    const match = range.match(/bytes=(\d*)-(\d*)/);
    const start = match?.[1] ? parseInt(match[1], 10) : 0;
    const end = match?.[2] ? parseInt(match[2], 10) : totalSize - 1;

    const object = await s3Client.send(
      new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Range: `bytes=${start}-${end}`,
      }),
    );

    const webStream = await object.Body!.transformToWebStream();
    const chunkSize = end - start + 1;

    return new Response(webStream, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${totalSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize.toString(),
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("Failed to stream video from S3:", error);
    return NextResponse.json(
      { success: false, message: "File not found." },
      { status: 404 },
    );
  }
}
