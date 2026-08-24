// // new file for video upload percentage works

// import { NextResponse } from "next/server";
// import { PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import crypto from "crypto";
// import path from "path";

// import { prisma } from "@/lib/prisma";
// import { getRequiredSuperAdmin } from "@/lib/current-user";
// import { s3Client, S3_BUCKET, S3_REGION } from "@/lib/s3";

// export const runtime = "nodejs";

// const ALLOWED_MIME = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];

// const MAX_BYTES = 10 * 1024 * 1024 * 1024;

// export async function POST(
//   request: Request,
//   { params }: { params: Promise<{ coursesId: string }> },
// ) {
//   try {
//     await getRequiredSuperAdmin();

//     const { coursesId: courseId } = await params;

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

//     const body = await request.json();

//     const fileName = String(body.fileName || "");
//     const contentType = String(body.contentType || "");
//     const fileSize = Number(body.fileSize || 0);

//     if (!fileName || !contentType || !fileSize) {
//       return NextResponse.json(
//         { success: false, message: "Invalid upload information." },
//         { status: 400 },
//       );
//     }

//     if (!ALLOWED_MIME.includes(contentType)) {
//       return NextResponse.json(
//         { success: false, message: `Unsupported file type: ${contentType}` },
//         { status: 400 },
//       );
//     }

//     if (fileSize > MAX_BYTES) {
//       return NextResponse.json(
//         { success: false, message: "File exceeds the maximum upload size." },
//         { status: 413 },
//       );
//     }

//     const ext = path.extname(fileName) || ".mp4";
//     const objectKey = `${courseId}/${crypto.randomUUID()}${ext}`;

//     const command = new PutObjectCommand({
//       Bucket: S3_BUCKET,
//       Key: objectKey,
//       ContentType: contentType,
//       ContentLength: fileSize,
//     });

//     const uploadUrl = await getSignedUrl(s3Client, command, {
//       expiresIn: 15 * 60,
//     });

//     return NextResponse.json({
//       success: true,
//       uploadUrl,
//       objectKey,
//       region: S3_REGION,
//     });
//   } catch (error) {
//     console.error("Presigned upload URL error:", error);

//     return NextResponse.json(
//       { success: false, message: "Failed to prepare video upload." },
//       { status: 500 },
//     );
//   }
// }
