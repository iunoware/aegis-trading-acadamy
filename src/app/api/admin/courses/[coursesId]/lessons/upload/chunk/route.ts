// src\app\api\admin\courses\[coursesId]\lessons\upload\chunk\route.ts
import { NextRequest, NextResponse } from "next/server";
import { getRequiredSuperAdmin } from "@/lib/current-user";
import { appendChunk, abortChunkedUpload, isValidUploadId } from "@/lib/video-storage";

export const runtime = "nodejs";

const MAX_CHUNK_BYTES = 16 * 1024 * 1024;

function authError(error: unknown) {
  const msg = error instanceof Error ? error.message : error;
  if (msg === "UNAUTHORIZED")
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  if (msg === "FORBIDDEN")
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  return null;
}

export async function POST(request: NextRequest) {
  try {
    await getRequiredSuperAdmin();

    const formData = await request.formData();
    const chunk = formData.get("chunk");
    const uploadId = formData.get("uploadId")?.toString() || "";
    const offset = Number(formData.get("offset"));

    if (
      !isValidUploadId(uploadId) ||
      !(chunk instanceof Blob) ||
      !Number.isInteger(offset) ||
      offset < 0
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid chunk request." },
        { status: 400 },
      );
    }
    if (chunk.size > MAX_CHUNK_BYTES) {
      return NextResponse.json(
        { success: false, message: "Chunk too large." },
        { status: 413 },
      );
    }

    const result = await appendChunk(
      uploadId,
      offset,
      Buffer.from(await chunk.arrayBuffer()),
    );

    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Chunk offset mismatch.",
          receivedBytes: result.receivedBytes,
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: true, receivedBytes: result.receivedBytes });
  } catch (error) {
    const auth = authError(error);
    if (auth) return auth;
    console.error("Chunk upload error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save chunk." },
      { status: 500 },
    );
  }
}

// Best-effort cleanup when the client gives up
export async function DELETE(request: NextRequest) {
  try {
    await getRequiredSuperAdmin();
    const uploadId = request.nextUrl.searchParams.get("uploadId") || "";
    if (isValidUploadId(uploadId)) await abortChunkedUpload(uploadId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const auth = authError(error);
    if (auth) return auth;
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
