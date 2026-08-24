import { NextRequest } from "next/server";
import { getRequiredSuperAdmin } from "@/lib/current-user";
import { getProgress } from "@/lib/upload-progress-store";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> },
) {
  try {
    await getRequiredSuperAdmin();
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const { uploadId } = await params;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let closed = false;

      const send = (data: unknown) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const interval = setInterval(() => {
        const entry = getProgress(uploadId);

        if (!entry) {
          // SSE connected before the upload route has called initProgress yet
          send({ percent: 0, done: false });
          return;
        }

        send(entry);

        if (entry.done) {
          clearInterval(interval);
          closed = true;
          controller.close();
        }
      }, 250);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        closed = true;
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
