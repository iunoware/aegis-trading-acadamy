// import { unlink, mkdir, writeFile, rmdir, readdir } from "fs/promises";
// import path from "path";
// import crypto from "crypto";

// export const STORAGE_DIR =
//   process.env.VIDEO_STORAGE_DIR || path.join(process.cwd(), "storage", "videos");

// export async function saveVideo(file: File, courseId: string): Promise<string> {
//   const ext = path.extname(file.name) || ".mp4";
//   const fileName = `${crypto.randomUUID()}${ext}`;
//   const courseDir = path.join(STORAGE_DIR, courseId);

//   await mkdir(courseDir, { recursive: true });
//   await writeFile(path.join(courseDir, fileName), Buffer.from(await file.arrayBuffer()));

//   return `${courseId}/${fileName}`;
// }

// /**
//  * Deletes a locally-stored video file given its internal ref ("courseId/fileName").
//  * Safe to call even if the file is already gone. After deleting, also removes
//  * the course's folder if it's now empty (i.e. that was the last video).
//  */
// export async function deleteVideoFile(internalRef: string) {
//   const filePath = path.join(STORAGE_DIR, internalRef);

//   // Guard against path traversal
//   if (!filePath.startsWith(STORAGE_DIR)) {
//     throw new Error("Invalid video file path");
//   }

//   try {
//     await unlink(filePath);
//   } catch (err: unknown) {
//     // ENOENT = already gone, not an error worth surfacing
//     if (
//       typeof err === "object" &&
//       err !== null &&
//       "code" in err &&
//       err.code === "ENOENT"
//     ) {
//       return;
//     }
//     throw err;
//   }

//   // Clean up the parent course folder if it's now empty. Failure here
//   // (folder not empty, already gone, permissions, etc.) is never worth
//   // surfacing — the video itself was already deleted successfully.
//   const courseDir = path.dirname(filePath);
//   try {
//     const remaining = await readdir(courseDir);
//     if (remaining.length === 0) {
//       await rmdir(courseDir);
//     }
//   } catch {
//     // ignore
//   }
// }

// src\lib\video-storage.ts
// for video chunking:
import {
  unlink,
  mkdir,
  writeFile,
  rmdir,
  readdir,
  stat,
  appendFile,
  rename,
} from "fs/promises";
import path from "path";
import crypto from "crypto";

export const STORAGE_DIR =
  process.env.VIDEO_STORAGE_DIR || path.join(process.cwd(), "storage", "videos");

const TMP_DIR = path.join(STORAGE_DIR, ".tmp");
const UPLOAD_ID_RE = /^[0-9a-fA-F-]{36}$/;
const VIDEO_EXTS = [".mp4", ".webm", ".mov", ".mkv"];

export async function saveVideo(file: File, courseId: string): Promise<string> {
  const ext = path.extname(file.name) || ".mp4";
  const fileName = `${crypto.randomUUID()}${ext}`;
  const courseDir = path.join(STORAGE_DIR, courseId);

  await mkdir(courseDir, { recursive: true });
  await writeFile(path.join(courseDir, fileName), Buffer.from(await file.arrayBuffer()));

  return `${courseId}/${fileName}`;
}

// ---------- Chunked upload helpers ----------

export function isValidUploadId(id: string) {
  return UPLOAD_ID_RE.test(id);
}

function partPath(uploadId: string) {
  return path.join(TMP_DIR, `${uploadId}.part`);
}

/**
 * Appends a chunk at `offset`. Idempotent: if the chunk was already written
 * (retry after a lost response) it reports success without writing twice.
 */
export async function appendChunk(
  uploadId: string,
  offset: number,
  data: Buffer,
): Promise<{ ok: boolean; receivedBytes: number }> {
  await mkdir(TMP_DIR, { recursive: true });
  const p = partPath(uploadId);

  let size = 0;
  try {
    size = (await stat(p)).size;
  } catch (err: unknown) {
    if (
      !(typeof err === "object" && err !== null && "code" in err && err.code === "ENOENT")
    ) {
      throw err;
    }
  }

  if (size === offset + data.length) return { ok: true, receivedBytes: size };
  if (size !== offset) return { ok: false, receivedBytes: size };

  await appendFile(p, data);
  return { ok: true, receivedBytes: size + data.length };
}

/** Moves the finished temp file into the course folder. Returns "courseId/fileName". */
export async function finalizeChunkedVideo(
  uploadId: string,
  courseId: string,
  originalName: string,
  expectedSize: number,
): Promise<string> {
  const p = partPath(uploadId);
  const { size } = await stat(p);
  if (size !== expectedSize) throw new Error("SIZE_MISMATCH");

  const rawExt = path.extname(originalName).toLowerCase();
  const ext = VIDEO_EXTS.includes(rawExt) ? rawExt : ".mp4";
  const fileName = `${crypto.randomUUID()}${ext}`;
  const courseDir = path.join(STORAGE_DIR, courseId);

  await mkdir(courseDir, { recursive: true });
  await rename(p, path.join(courseDir, fileName));

  return `${courseId}/${fileName}`;
}

export async function abortChunkedUpload(uploadId: string) {
  try {
    await unlink(partPath(uploadId));
  } catch {
    // already gone
  }
}

/**
 * Deletes a locally-stored video file given its internal ref ("courseId/fileName").
 * Safe to call even if the file is already gone. After deleting, also removes
 * the course's folder if it's now empty (i.e. that was the last video).
 */
export async function deleteVideoFile(internalRef: string) {
  const filePath = path.join(STORAGE_DIR, internalRef);

  // Guard against path traversal
  if (!filePath.startsWith(STORAGE_DIR)) {
    throw new Error("Invalid video file path");
  }

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
    throw err;
  }

  const courseDir = path.dirname(filePath);
  try {
    const remaining = await readdir(courseDir);
    if (remaining.length === 0) {
      await rmdir(courseDir);
    }
  } catch {
    // ignore
  }
}
