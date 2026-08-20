// src/lib/video-storage.ts
import { unlink } from "fs/promises";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import crypto from "crypto";

const STORAGE_DIR =
  process.env.VIDEO_STORAGE_DIR || path.join(process.cwd(), "storage", "videos");

const THUMB_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const THUMB_MAX_BYTES = 50 * 1024 * 1024;
const THUMB_DIR = path.join(process.cwd(), "public", "uploads", "course-thumbnails");

/**
 * Deletes a locally-stored video file given its internal ref ("courseId/fileName").
 * Safe to call even if the file is already gone.
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
    // ENOENT = already gone, not an error worth surfacing
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
}

export async function saveThumbnail(file: File): Promise<string> {
  if (!THUMB_MIME.includes(file.type)) throw new Error("Unsupported image type");
  if (file.size > THUMB_MAX_BYTES) throw new Error("Image too large");

  await mkdir(THUMB_DIR, { recursive: true });
  const ext = path.extname(file.name) || ".jpg";
  const fileName = `${crypto.randomUUID()}${ext}`;
  await writeFile(path.join(THUMB_DIR, fileName), Buffer.from(await file.arrayBuffer()));

  return `/uploads/course-thumbnails/${fileName}`;
}
