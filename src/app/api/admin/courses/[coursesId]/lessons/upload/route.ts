// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { ActivityAction, ActivityActorType } from "@/generated/prisma/client";
// import { getRequiredSuperAdmin } from "@/lib/current-user";
// import { saveVideo } from "@/lib/video-storage";
// import {
//   initProgress,
//   completeProgress,
//   failProgress,
// } from "@/lib/upload-progress-store";

// export const runtime = "nodejs";

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
//   let uploadId: string | null = null;

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
//     uploadId = formData.get("uploadId")?.toString() || null;

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

//     if (uploadId) initProgress(uploadId);

//     const baseSlug = slugify(title);
//     let slug = baseSlug;
//     let suffix = 1;
//     while (
//       await prisma.lesson.findUnique({ where: { courseId_slug: { courseId, slug } } })
//     ) {
//       slug = `${baseSlug}-${suffix++}`;
//     }

//     let internalRef: string;
//     try {
//       internalRef = await saveVideo(file, courseId);
//       if (uploadId) completeProgress(uploadId);
//     } catch (saveError) {
//       console.error("Local video save failed:", saveError);
//       if (uploadId) failProgress(uploadId, "Failed to save video to storage.");
//       return NextResponse.json(
//         { success: false, message: "Failed to save video to storage." },
//         { status: 500 },
//       );
//     }

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
//     if (uploadId) failProgress(uploadId, "Failed to upload video.");
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


// src\app\api\admin\courses\[coursesId]\lessons\upload\route.ts
// for video chunking:
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActivityAction, ActivityActorType } from "@/generated/prisma/client";
import { getRequiredSuperAdmin } from "@/lib/current-user";
import {
  finalizeChunkedVideo,
  deleteVideoFile,
  abortChunkedUpload,
  isValidUploadId,
} from "@/lib/video-storage";

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
  let internalRef: string | null = null;

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

    const body = await request.json();
    const uploadId = String(body.uploadId || "");
    const fileName = String(body.fileName || "");
    const fileSize = Number(body.fileSize);
    const mimeType = String(body.mimeType || "");
    const title = String(body.title || "").trim();
    const isPreview = body.isPreview === true || body.isPreview === "true";
    const durationSeconds = Number(body.durationSeconds || 0);

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Video title is required." },
        { status: 400 },
      );
    }
    if (!isValidUploadId(uploadId) || !Number.isFinite(fileSize) || fileSize <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid upload." },
        { status: 400 },
      );
    }
    if (!ALLOWED_MIME.includes(mimeType)) {
      await abortChunkedUpload(uploadId);
      return NextResponse.json(
        { success: false, message: `Unsupported file type: ${mimeType}` },
        { status: 400 },
      );
    }
    if (fileSize > MAX_BYTES) {
      await abortChunkedUpload(uploadId);
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

    try {
      internalRef = await finalizeChunkedVideo(uploadId, courseId, fileName, fileSize);
    } catch (err) {
      console.error("Finalize video failed:", err);
      await abortChunkedUpload(uploadId);
      const msg =
        err instanceof Error && err.message === "SIZE_MISMATCH"
          ? "Uploaded file is incomplete. Please try again."
          : "Failed to save video to storage.";
      return NextResponse.json({ success: false, message: msg }, { status: 500 });
    }

    const maxOrder = await prisma.lesson.aggregate({
      _max: { displayOrder: true },
      where: { courseId },
    });

    const savedRef = internalRef;
    const result = await prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.create({
        data: {
          courseId,
          title,
          slug,
          videoUrl: savedRef,
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
          metadata: { fileSize, mimeType },
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

    // Don't leave an orphaned file if the DB write failed after the move
    if (internalRef) {
      await deleteVideoFile(internalRef).catch(() => {});
    }

    const msg = error instanceof Error ? error.message : error;
    if (msg === "UNAUTHORIZED")
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    if (msg === "FORBIDDEN")
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

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
