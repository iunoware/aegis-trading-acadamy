import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { createReadStream, statSync, existsSync } from "fs";
import { Readable } from "stream";
import path from "path";

export const runtime = "nodejs";

const STORAGE_DIR =
  process.env.VIDEO_STORAGE_DIR || path.join(process.cwd(), "storage", "videos");

const MIME_BY_EXT: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".mkv": "video/x-matroska",
};

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

  // Only locally-uploaded files (videoUrl = "courseId/fileName") go through this route.
  if (lesson.videoUrl.startsWith("http")) {
    return NextResponse.json(
      { success: false, message: "This video is hosted externally." },
      { status: 400 },
    );
  }

  if (!lesson.isPreview) {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }
    // TODO once enrollment gating is wired up: check an ACTIVE Subscription for `user.id`
    // covering this course before allowing the stream through.
  }

  const filePath = path.join(STORAGE_DIR, lesson.videoUrl);

  if (!filePath.startsWith(STORAGE_DIR) || !existsSync(filePath)) {
    return NextResponse.json(
      { success: false, message: "File not found." },
      { status: 404 },
    );
  }

  const stat = statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_BY_EXT[ext] || "application/octet-stream";
  const range = request.headers.get("range");

  if (!range) {
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    return new Response(stream, {
      headers: {
        "Content-Length": stat.size.toString(),
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
      },
    });
  }

  const match = range.match(/bytes=(\d*)-(\d*)/);
  const start = match?.[1] ? parseInt(match[1], 10) : 0;
  const end = match?.[2] ? parseInt(match[2], 10) : stat.size - 1;
  const chunkSize = end - start + 1;

  const stream = Readable.toWeb(
    createReadStream(filePath, { start, end }),
  ) as ReadableStream;

  return new Response(stream, {
    status: 206,
    headers: {
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize.toString(),
      "Content-Type": contentType,
    },
  });
}
