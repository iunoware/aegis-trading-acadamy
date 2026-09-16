// // import { unlink } from "fs/promises";
// // import path from "path";

// // const PUBLIC_DIR = path.join(process.cwd(), "public");

// // export async function deleteThumbnailFile(thumbnailUrl: string | null | undefined) {
// //   if (!thumbnailUrl || thumbnailUrl.startsWith("http")) return;

// //   const filePath = path.join(PUBLIC_DIR, thumbnailUrl);
// //   if (!filePath.startsWith(PUBLIC_DIR)) return;

// //   try {
// //     await unlink(filePath);
// //   } catch (err: unknown) {
// //     if (typeof err === "object" && err !== null && "code" in err && err.code === "ENOENT")
// //       return;
// //     console.error("Failed to delete thumbnail file:", err);
// //   }
// // }

// import path from "path";
// import crypto from "crypto";
// import { s3Client, S3_BUCKET, S3_REGION } from "@/lib/s3";
// import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

// const THUMB_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
// const THUMB_MAX_BYTES = 50 * 1024 * 1024;
// const THUMB_PREFIX = "thumbnails/";

// const S3_PUBLIC_BASE = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/`;

// /**
//  * Uploads a course thumbnail to S3 under a public prefix and returns
//  * its public URL, e.g.
//  * "https://aegis-s3-demo-bucket.s3.ap-southeast-2.amazonaws.com/thumbnails/uuid.jpg"
//  */
// export async function saveThumbnail(file: File): Promise<string> {
//   if (!THUMB_MIME.includes(file.type)) {
//     throw new Error("Unsupported image type");
//   }
//   if (file.size > THUMB_MAX_BYTES) {
//     throw new Error("Image too large");
//   }

//   const ext = path.extname(file.name) || ".jpg";
//   const key = `${THUMB_PREFIX}${crypto.randomUUID()}${ext}`;
//   const buffer = Buffer.from(await file.arrayBuffer());

//   await s3Client.send(
//     new PutObjectCommand({
//       Bucket: S3_BUCKET,
//       Key: key,
//       Body: buffer,
//       ContentType: file.type,
//     }),
//   );

//   return `${S3_PUBLIC_BASE}${key}`;
// }

// /**
//  * Deletes a thumbnail given its stored URL. Safe no-op for null/undefined,
//  * and for anything that isn't one of our own S3 thumbnail URLs (e.g.
//  * leftover local "/uploads/course-thumbnails/..." paths from before this
//  * migration, or a genuinely external URL).
//  */
// export async function deleteThumbnailFile(thumbnailUrl: string | null | undefined) {
//   if (!thumbnailUrl) return;

//   const prefix = `${S3_PUBLIC_BASE}${THUMB_PREFIX}`;

//   if (!thumbnailUrl.startsWith(prefix)) {
//     // Not one of our S3 thumbnails — either a pre-migration local path
//     // (already unreachable in production, nothing to clean up) or some
//     // other external URL. Either way, safe to skip.
//     return;
//   }

//   const key = thumbnailUrl.slice(S3_PUBLIC_BASE.length);

//   try {
//     await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
//   } catch (err) {
//     console.error("Failed to delete thumbnail file:", err);
//   }
// }

import { unlink, mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const THUMB_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const THUMB_MAX_BYTES = 50 * 1024 * 1024;
const THUMB_DIR = path.join(process.cwd(), "public", "uploads", "course-thumbnails");
const PUBLIC_DIR = path.join(process.cwd(), "public");

/**
 * Saves a course thumbnail to local disk under public/uploads/course-thumbnails/
 * and returns its public-relative URL, e.g. "/uploads/course-thumbnails/uuid.jpg".
 */
export async function saveThumbnail(file: File): Promise<string> {
  if (!THUMB_MIME.includes(file.type)) {
    throw new Error("Unsupported image type");
  }
  if (file.size > THUMB_MAX_BYTES) {
    throw new Error("Image too large");
  }

  await mkdir(THUMB_DIR, { recursive: true });
  const ext = path.extname(file.name) || ".jpg";
  const fileName = `${crypto.randomUUID()}${ext}`;
  await writeFile(path.join(THUMB_DIR, fileName), Buffer.from(await file.arrayBuffer()));

  return `/uploads/course-thumbnails/${fileName}`;
}

/**
 * Deletes a thumbnail given its stored relative URL. Safe no-op for
 * null/undefined, and for anything that isn't one of our own local
 * thumbnail paths (e.g. a leftover S3 URL from before this migration,
 * or a genuinely external URL).
 */
export async function deleteThumbnailFile(thumbnailUrl: string | null | undefined) {
  if (!thumbnailUrl || thumbnailUrl.startsWith("http")) return;

  const filePath = path.join(PUBLIC_DIR, thumbnailUrl);

  // Guard against path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) return;

  try {
    await unlink(filePath);
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "ENOENT"
    ) {
      return;
    }
    console.error("Failed to delete thumbnail file:", err);
  }
}
