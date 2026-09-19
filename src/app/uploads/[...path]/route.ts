import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const filePath = path.join(UPLOADS_DIR, ...segments);

  // Guard against path traversal
  if (!filePath.startsWith(UPLOADS_DIR + path.sep)) {
    return NextResponse.json({ message: "Invalid path" }, { status: 400 });
  }

  const contentType = MIME_BY_EXT[path.extname(filePath).toLowerCase()];
  if (!contentType) {
    return NextResponse.json({ message: "Unsupported file type" }, { status: 400 });
  }

  try {
    const file = await readFile(filePath);
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ message: "File not found" }, { status: 404 });
  }
}
