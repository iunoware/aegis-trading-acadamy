// /* eslint-disable @typescript-eslint/no-unused-vars */
// // // add video via file upload

// // import { NextRequest, NextResponse } from "next/server";
// // import { prisma } from "@/lib/prisma";
// // import { ActivityAction, ActivityActorType } from "@/generated/prisma/client";
// // import { getRequiredSuperAdmin } from "@/lib/current-user";
// // import { s3Client, S3_BUCKET } from "@/lib/s3";
// // import { Upload } from "@aws-sdk/lib-storage";
// // import { Readable } from "stream";
// // import path from "path";
// // import crypto from "crypto";

// // export const runtime = "nodejs";

// // const ALLOWED_MIME = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];
// // const MAX_BYTES = 10 * 1024 * 1024 * 1024;

// // function slugify(title: string) {
// //   return title
// //     .toLowerCase()
// //     .trim()
// //     .replace(/[^a-z0-9]+/g, "-")
// //     .replace(/(^-|-$)/g, "");
// // }

// // export async function POST(
// //   request: NextRequest,
// //   { params }: { params: Promise<{ coursesId: string }> },
// // ) {
// //   try {
// //     const adminUser = await getRequiredSuperAdmin();
// //     const { coursesId } = await params;
// //     const courseId = coursesId;

// //     const course = await prisma.course.findUnique({
// //       where: { id: courseId },
// //       select: { id: true },
// //     });
// //     if (!course) {
// //       return NextResponse.json(
// //         { success: false, message: "Course not found." },
// //         { status: 404 },
// //       );
// //     }

// //     const formData = await request.formData();
// //     const file = formData.get("file");
// //     const title = formData.get("title")?.toString().trim() || "";
// //     const isPreview = formData.get("isPreview")?.toString() === "true";
// //     const durationSeconds = Number(formData.get("durationSeconds") || 0);

// //     if (!title) {
// //       return NextResponse.json(
// //         { success: false, message: "Video title is required." },
// //         { status: 400 },
// //       );
// //     }
// //     if (!(file instanceof File)) {
// //       return NextResponse.json(
// //         { success: false, message: "No video file was provided." },
// //         { status: 400 },
// //       );
// //     }
// //     if (!ALLOWED_MIME.includes(file.type)) {
// //       return NextResponse.json(
// //         { success: false, message: `Unsupported file type: ${file.type}` },
// //         { status: 400 },
// //       );
// //     }
// //     if (file.size > MAX_BYTES) {
// //       return NextResponse.json(
// //         { success: false, message: "File exceeds the maximum upload size." },
// //         { status: 413 },
// //       );
// //     }

// //     const baseSlug = slugify(title);
// //     let slug = baseSlug;
// //     let suffix = 1;
// //     while (
// //       await prisma.lesson.findUnique({ where: { courseId_slug: { courseId, slug } } })
// //     ) {
// //       slug = `${baseSlug}-${suffix++}`;
// //     }

// //     const ext = path.extname(file.name) || ".mp4";
// //     const fileName = `${crypto.randomUUID()}${ext}`;
// //     const internalRef = `${courseId}/${fileName}`;

// //     // Stream the upload straight to S3 rather than buffering the whole file
// //     // in memory first — matters once videos get into the hundreds of MB.
// //     const nodeStream = Readable.fromWeb(
// //       file.stream() as import("stream/web").ReadableStream<Uint8Array>,
// //     );

// //     try {
// //       const upload = new Upload({
// //         client: s3Client,
// //         params: {
// //           Bucket: S3_BUCKET,
// //           Key: internalRef,
// //           Body: nodeStream,
// //           ContentType: file.type,
// //         },
// //         queueSize: 4,
// //         partSize: 10 * 1024 * 1024,
// //       });

// //       await upload.done();
// //     } catch (uploadError) {
// //       console.error("S3 upload failed:", uploadError);
// //       return NextResponse.json(
// //         { success: false, message: "Failed to upload video to storage." },
// //         { status: 500 },
// //       );
// //     }

// //     const maxOrder = await prisma.lesson.aggregate({
// //       _max: { displayOrder: true },
// //       where: { courseId },
// //     });

// //     const result = await prisma.$transaction(async (tx) => {
// //       const lesson = await tx.lesson.create({
// //         data: {
// //           courseId,
// //           title,
// //           slug,
// //           videoUrl: internalRef,
// //           durationSeconds: Number.isFinite(durationSeconds)
// //             ? Math.round(durationSeconds)
// //             : 0,
// //           isPreview,
// //           displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
// //         },
// //       });

// //       await tx.activityLog.create({
// //         data: {
// //           actorId: adminUser.id,
// //           actorType: ActivityActorType.SUPER_ADMIN,
// //           action: ActivityAction.LESSON_CREATED,
// //           module: "COURSES",
// //           title: "Video uploaded",
// //           description: `Video "${lesson.title}" was uploaded to a course.`,
// //           targetId: lesson.id,
// //           targetType: "LESSON",
// //           afterData: { lessonId: lesson.id, courseId, title: lesson.title },
// //           metadata: { fileSize: file.size, mimeType: file.type },
// //         },
// //       });

// //       return lesson;
// //     });

// //     return NextResponse.json(
// //       { success: true, message: "Video uploaded successfully.", lesson: result },
// //       { status: 201 },
// //     );
// //   } catch (error: unknown) {
// //     console.error("Lesson upload error:", error);
// //     if (
// //       typeof error === "object" &&
// //       error !== null &&
// //       "code" in error &&
// //       error.code === "P2002"
// //     ) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "A video with this order already exists in the course.",
// //         },
// //         { status: 409 },
// //       );
// //     }
// //     return NextResponse.json(
// //       { success: false, message: "Failed to upload video." },
// //       { status: 500 },
// //     );
// //   }
// // }

// // add video via file upload

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { ActivityAction, ActivityActorType } from "@/generated/prisma/client";
// import { getRequiredSuperAdmin } from "@/lib/current-user";
// import { s3Client, S3_BUCKET } from "@/lib/s3";
// import { Upload } from "@aws-sdk/lib-storage";
// import { Readable } from "stream";
// import path from "path";
// import crypto from "crypto";
// import {
//   initProgress,
//   updateProgress,
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
//     console.log("[upload] formData parsed at", Date.now());
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

//     const ext = path.extname(file.name) || ".mp4";
//     const fileName = `${crypto.randomUUID()}${ext}`;
//     const internalRef = `${courseId}/${fileName}`;

//     // const nodeStream = Readable.fromWeb(
//     //   file.stream() as import("stream/web").ReadableStream<Uint8Array>,
//     // );

//     // try {
//     //   const upload = new Upload({
//     //     client: s3Client,
//     //     params: {
//     //       Bucket: S3_BUCKET,
//     //       Key: internalRef,
//     //       Body: nodeStream,
//     //       ContentType: file.type,
//     //     },
//     //     queueSize: 4,
//     //     partSize: 10 * 1024 * 1024,
//     //   });

//     // request.formData() already buffered the whole file into memory,
//     // so hand the AWS SDK a plain Buffer instead of re-wrapping it as a
//     // stream — the Web->Node stream conversion was throttling multipart
//     // uploads to a crawl.
//     const fileBuffer = Buffer.from(await file.arrayBuffer());

//     try {
//       const upload = new Upload({
//         client: s3Client,
//         params: {
//           Bucket: S3_BUCKET,
//           Key: internalRef,
//           Body: fileBuffer,
//           ContentType: file.type,
//         },
//         queueSize: 4,
//         partSize: 10 * 1024 * 1024,
//       });

//       if (uploadId) {
//         const id = uploadId;
//         upload.on("httpUploadProgress", (progress) => {
//           if (progress.total) {
//             const percent = Math.round((progress.loaded! / progress.total) * 100);
//             updateProgress(id, percent);
//           }
//         });
//       }

//       await upload.done();
//       console.log("[upload] S3 upload.done() resolved at", Date.now());

//       if (uploadId) completeProgress(uploadId);
//     } catch (uploadError) {
//       console.error("S3 upload failed:", uploadError);
//       if (uploadId) failProgress(uploadId, "Failed to upload video to storage.");
//       return NextResponse.json(
//         { success: false, message: "Failed to upload video to storage." },
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

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActivityAction, ActivityActorType } from "@/generated/prisma/client";
import { getRequiredSuperAdmin } from "@/lib/current-user";
import { saveVideo } from "@/lib/video-storage";
import {
  initProgress,
  completeProgress,
  failProgress,
} from "@/lib/upload-progress-store";

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
  let uploadId: string | null = null;

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
    uploadId = formData.get("uploadId")?.toString() || null;

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

    if (uploadId) initProgress(uploadId);

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let suffix = 1;
    while (
      await prisma.lesson.findUnique({ where: { courseId_slug: { courseId, slug } } })
    ) {
      slug = `${baseSlug}-${suffix++}`;
    }

    let internalRef: string;
    try {
      internalRef = await saveVideo(file, courseId);
      if (uploadId) completeProgress(uploadId);
    } catch (saveError) {
      console.error("Local video save failed:", saveError);
      if (uploadId) failProgress(uploadId, "Failed to save video to storage.");
      return NextResponse.json(
        { success: false, message: "Failed to save video to storage." },
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
    if (uploadId) failProgress(uploadId, "Failed to upload video.");
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
