// // // // src/lib/video-storage.ts
// // // import { unlink } from "fs/promises";
// // // import path from "path";
// // // import { mkdir, writeFile } from "fs/promises";
// // // import crypto from "crypto";

// // // const STORAGE_DIR =
// // //   process.env.VIDEO_STORAGE_DIR || path.join(process.cwd(), "storage", "videos");

// // // const THUMB_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
// // // const THUMB_MAX_BYTES = 50 * 1024 * 1024;
// // // const THUMB_DIR = path.join(process.cwd(), "public", "uploads", "course-thumbnails");

// // // /**
// // //  * Deletes a locally-stored video file given its internal ref ("courseId/fileName").
// // //  * Safe to call even if the file is already gone.
// // //  */
// // // export async function deleteVideoFile(internalRef: string) {
// // //   const filePath = path.join(STORAGE_DIR, internalRef);

// // //   // Guard against path traversal
// // //   if (!filePath.startsWith(STORAGE_DIR)) {
// // //     throw new Error("Invalid video file path");
// // //   }

// // //   try {
// // //     await unlink(filePath);
// // //   } catch (err: unknown) {
// // //     // ENOENT = already gone, not an error worth surfacing
// // //     if (
// // //       typeof err === "object" &&
// // //       err !== null &&
// // //       "code" in err &&
// // //       err.code === "ENOENT"
// // //     ) {
// // //       return;
// // //     }
// // //     throw err;
// // //   }
// // // }

// // // export async function saveThumbnail(file: File): Promise<string> {
// // //   if (!THUMB_MIME.includes(file.type)) throw new Error("Unsupported image type");
// // //   if (file.size > THUMB_MAX_BYTES) throw new Error("Image too large");

// // //   await mkdir(THUMB_DIR, { recursive: true });
// // //   const ext = path.extname(file.name) || ".jpg";
// // //   const fileName = `${crypto.randomUUID()}${ext}`;
// // //   await writeFile(path.join(THUMB_DIR, fileName), Buffer.from(await file.arrayBuffer()));

// // //   return `/uploads/course-thumbnails/${fileName}`;
// // // }

// // import path from "path";
// // import { mkdir, writeFile } from "fs/promises";
// // import crypto from "crypto";
// // import { s3Client, S3_BUCKET } from "@/lib/s3";
// // import { DeleteObjectCommand } from "@aws-sdk/client-s3";

// // const THUMB_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
// // const THUMB_MAX_BYTES = 50 * 1024 * 1024;
// // const THUMB_DIR = path.join(process.cwd(), "public", "uploads", "course-thumbnails");

// // /**
// //  * Deletes an S3-stored video object given its internal ref ("courseId/fileName").
// //  * Safe to call even if the object is already gone.
// //  */
// // export async function deleteVideoFile(internalRef: string) {
// //   try {
// //     await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: internalRef }));
// //   } catch (err) {
// //     // S3 DeleteObject is idempotent by design — it returns success even if
// //     // the key doesn't exist, so a thrown error here means something else
// //     // (auth, network, etc.) actually went wrong and is worth surfacing.
// //     console.error(`Failed to delete S3 object "${internalRef}":`, err);
// //     throw err;
// //   }
// // }

// // export async function saveThumbnail(file: File): Promise<string> {
// //   if (!THUMB_MIME.includes(file.type)) throw new Error("Unsupported image type");
// //   if (file.size > THUMB_MAX_BYTES) throw new Error("Image too large");

// //   await mkdir(THUMB_DIR, { recursive: true });
// //   const ext = path.extname(file.name) || ".jpg";
// //   const fileName = `${crypto.randomUUID()}${ext}`;
// //   await writeFile(path.join(THUMB_DIR, fileName), Buffer.from(await file.arrayBuffer()));

// //   return `/uploads/course-thumbnails/${fileName}`;
// // }

// import path from "path";
// import crypto from "crypto";
// import { s3Client, S3_BUCKET, S3_REGION } from "@/lib/s3";
// import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

// const THUMB_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
// const THUMB_MAX_BYTES = 50 * 1024 * 1024;
// const THUMB_PREFIX = "thumbnails/";

// /**
//  * Deletes an S3-stored video object given its internal ref ("courseId/fileName").
//  * Safe to call even if the object is already gone.
//  */
// export async function deleteVideoFile(internalRef: string) {
//   try {
//     await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: internalRef }));
//   } catch (err) {
//     console.error(`Failed to delete S3 object "${internalRef}":`, err);
//     throw err;
//   }
// }

// /**
//  * Uploads a course thumbnail to S3 under a public prefix and returns
//  * its public URL, e.g.
//  * "https://aegis-s3-demo-bucket.s3.ap-southeast-2.amazonaws.com/thumbnails/uuid.jpg"
//  */
// export async function saveThumbnail(file: File): Promise<string> {
//   if (!THUMB_MIME.includes(file.type)) throw new Error("Unsupported image type");
//   if (file.size > THUMB_MAX_BYTES) throw new Error("Image too large");

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

//   return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
// }

// /**
//  * Deletes a thumbnail given its stored URL. Safe no-op for anything that
//  * isn't one of our own S3 thumbnail URLs (e.g. leftover local paths from
//  * before this migration).
//  */
// export async function deleteThumbnail(thumbnailUrl: string) {
//   const prefix = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${THUMB_PREFIX}`;

//   if (!thumbnailUrl.startsWith(prefix)) {
//     return;
//   }

//   const key = thumbnailUrl.slice(
//     `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/`.length,
//   );

//   try {
//     await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
//   } catch (err) {
//     console.error(`Failed to delete S3 thumbnail "${key}":`, err);
//   }
// }

import { s3Client, S3_BUCKET } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

/**
 * Deletes an S3-stored video object given its internal ref ("courseId/fileName").
 * Safe to call even if the object is already gone.
 */
export async function deleteVideoFile(internalRef: string) {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: internalRef }));
  } catch (err) {
    console.error(`Failed to delete S3 object "${internalRef}":`, err);
    throw err;
  }
}
