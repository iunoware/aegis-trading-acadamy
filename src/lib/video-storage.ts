// src/lib/video-storage.ts
import { unlink } from "fs/promises";
import path from "path";

const STORAGE_DIR =
  process.env.VIDEO_STORAGE_DIR || path.join(process.cwd(), "storage", "videos");

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
