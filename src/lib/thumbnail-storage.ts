import { unlink } from "fs/promises";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

export async function deleteThumbnailFile(thumbnailUrl: string | null | undefined) {
  if (!thumbnailUrl || thumbnailUrl.startsWith("http")) return;

  const filePath = path.join(PUBLIC_DIR, thumbnailUrl);
  if (!filePath.startsWith(PUBLIC_DIR)) return;

  try {
    await unlink(filePath);
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "ENOENT")
      return;
    console.error("Failed to delete thumbnail file:", err);
  }
}
