// // add video via file upload

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { ActivityAction, ActivityActorType } from "@/generated/prisma/client";
// import { getRequiredSuperAdmin } from "@/lib/current-user";
// import { mkdir, writeFile } from "fs/promises";
// import path from "path";
// import crypto from "crypto";

// export const runtime = "nodejs";

// const STORAGE_DIR =
//   process.env.VIDEO_STORAGE_DIR || path.join(process.cwd(), "storage", "videos");
// const ALLOWED_MIME = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];
// const MAX_BYTES = 10 * 1024 * 1024 * 1024;

// function slugify(title: string) {
//   return title
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/(^-|-$)/g, "");
// }

// export async function POST(
//   request: NextRequest,
//   { params }: { params: Promise<{ coursesId: string }> },
// ) {
//   try {
//     const adminUser = await getRequiredSuperAdmin();
//     const { coursesId } = await params;
//     const courseId = coursesId;

//     const course = await prisma.course.findUnique({
//       where: { id: courseId },
//       select: { id: true },
//     });
//     if (!course) {
//       return NextResponse.json(
//         { success: false, message: "Course not found." },
//         { status: 404 },
//       );
//     }

//     const formData = await request.formData();
//     const file = formData.get("file");
//     const title = formData.get("title")?.toString().trim() || "";
//     const isPreview = formData.get("isPreview")?.toString() === "true";
//     const durationSeconds = Number(formData.get("durationSeconds") || 0);

//     if (!title) {
//       return NextResponse.json(
//         { success: false, message: "Video title is required." },
//         { status: 400 },
//       );
//     }
//     if (!(file instanceof File)) {
//       return NextResponse.json(
//         { success: false, message: "No video file was provided." },
//         { status: 400 },
//       );
//     }
//     if (!ALLOWED_MIME.includes(file.type)) {
//       return NextResponse.json(
//         { success: false, message: `Unsupported file type: ${file.type}` },
//         { status: 400 },
//       );
//     }
//     if (file.size > MAX_BYTES) {
//       return NextResponse.json(
//         { success: false, message: "File exceeds the maximum upload size." },
//         { status: 413 },
//       );
//     }

//     const baseSlug = slugify(title);
//     let slug = baseSlug;
//     let suffix = 1;
//     while (
//       await prisma.lesson.findUnique({ where: { courseId_slug: { courseId, slug } } })
//     ) {
//       slug = `${baseSlug}-${suffix++}`;
//     }

//     const ext = path.extname(file.name) || ".mp4";
//     const fileName = `${crypto.randomUUID()}${ext}`;
//     const courseDir = path.join(STORAGE_DIR, courseId);
//     const destPath = path.join(courseDir, fileName);

//     await mkdir(courseDir, { recursive: true });
//     const buffer = Buffer.from(await file.arrayBuffer());
//     await writeFile(destPath, buffer);

//     const internalRef = `${courseId}/${fileName}`;
//     const maxOrder = await prisma.lesson.aggregate({
//       _max: { displayOrder: true },
//       where: { courseId },
//     });

//     const result = await prisma.$transaction(async (tx) => {
//       const lesson = await tx.lesson.create({
//         data: {
//           courseId,
//           title,
//           slug,
//           videoUrl: internalRef,
//           durationSeconds: Number.isFinite(durationSeconds)
//             ? Math.round(durationSeconds)
//             : 0,
//           isPreview,
//           displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
//         },
//       });

//       await tx.activityLog.create({
//         data: {
//           actorId: adminUser.id,
//           actorType: ActivityActorType.SUPER_ADMIN,
//           action: ActivityAction.LESSON_CREATED,
//           module: "COURSES",
//           title: "Video uploaded",
//           description: `Video "${lesson.title}" was uploaded to a course.`,
//           targetId: lesson.id,
//           targetType: "LESSON",
//           afterData: { lessonId: lesson.id, courseId, title: lesson.title },
//           metadata: { fileSize: file.size, mimeType: file.type },
//         },
//       });

//       return lesson;
//     });

//     return NextResponse.json(
//       { success: true, message: "Video uploaded successfully.", lesson: result },
//       { status: 201 },
//     );
//   } catch (error: unknown) {
//     console.error("Lesson upload error:", error);
//     if (
//       typeof error === "object" &&
//       error !== null &&
//       "code" in error &&
//       error.code === "P2002"
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "A video with this order already exists in the course.",
//         },
//         { status: 409 },
//       );
//     }
//     return NextResponse.json(
//       { success: false, message: "Failed to upload video." },
//       { status: 500 },
//     );
//   }
// }

// add video via file upload

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActivityAction, ActivityActorType } from "@/generated/prisma/client";
import { getRequiredSuperAdmin } from "@/lib/current-user";
import { s3Client, S3_BUCKET } from "@/lib/s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

const ALLOWED_MIME = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];
const MAX_BYTES = 10 * 1024 * 1024 * 1024;

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

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found." },
        { status: 404 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const title = formData.get("title")?.toString().trim() || "";
    const isPreview = formData.get("isPreview")?.toString() === "true";
    const durationSeconds = Number(formData.get("durationSeconds") || 0);

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Video title is required." },
        { status: 400 },
      );
    }
    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No video file was provided." },
        { status: 400 },
      );
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: `Unsupported file type: ${file.type}` },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, message: "File exceeds the maximum upload size." },
        { status: 413 },
      );
    }

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let suffix = 1;
    while (
      await prisma.lesson.findUnique({ where: { courseId_slug: { courseId, slug } } })
    ) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const ext = path.extname(file.name) || ".mp4";
    const fileName = `${crypto.randomUUID()}${ext}`;
    const internalRef = `${courseId}/${fileName}`;

    // Stream the upload straight to S3 rather than buffering the whole file
    // in memory first — matters once videos get into the hundreds of MB.
    const nodeStream = Readable.fromWeb(
      file.stream() as import("stream/web").ReadableStream<Uint8Array>,
    );

    try {
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: S3_BUCKET,
          Key: internalRef,
          Body: nodeStream,
          ContentType: file.type,
        },
        queueSize: 4,
        partSize: 10 * 1024 * 1024,
      });

      await upload.done();
    } catch (uploadError) {
      console.error("S3 upload failed:", uploadError);
      return NextResponse.json(
        { success: false, message: "Failed to upload video to storage." },
        { status: 500 },
      );
    }

    const maxOrder = await prisma.lesson.aggregate({
      _max: { displayOrder: true },
      where: { courseId },
    });

    const result = await prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.create({
        data: {
          courseId,
          title,
          slug,
          videoUrl: internalRef,
          durationSeconds: Number.isFinite(durationSeconds)
            ? Math.round(durationSeconds)
            : 0,
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
          title: "Video uploaded",
          description: `Video "${lesson.title}" was uploaded to a course.`,
          targetId: lesson.id,
          targetType: "LESSON",
          afterData: { lessonId: lesson.id, courseId, title: lesson.title },
          metadata: { fileSize: file.size, mimeType: file.type },
        },
      });

      return lesson;
    });

    return NextResponse.json(
      { success: true, message: "Video uploaded successfully.", lesson: result },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Lesson upload error:", error);
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
      { success: false, message: "Failed to upload video." },
      { status: 500 },
    );
  }
}
