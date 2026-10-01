// src\lib\chunked-upload.ts
// for video chunking:
import axios from "axios";

const CHUNK_SIZE = 5 * 1024 * 1024;
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isRetryable(err: unknown) {
  if (!axios.isAxiosError(err)) return false;
  const status = err.response?.status;
  return !status || status >= 500 || status === 408 || status === 429;
}

export async function uploadVideoInChunks(opts: {
  file: File;
  uploadId: string;
  courseId: string;
  onProgress: (percent: number) => void;
}) {
  const { file, uploadId, courseId, onProgress } = opts;
  const url = `/api/admin/courses/${courseId}/lessons/upload/chunk`;
  let offset = 0;

  try {
    while (offset < file.size) {
      const end = Math.min(offset + CHUNK_SIZE, file.size);
      const blob = file.slice(offset, end);

      for (let attempt = 1; ; attempt++) {
        try {
          const fd = new FormData();
          fd.append("uploadId", uploadId);
          fd.append("offset", String(offset));
          fd.append("chunk", blob, "chunk");

          await axios.post(url, fd, {
            timeout: 120_000,
            onUploadProgress: (e) => {
              onProgress(
                Math.min(99, Math.round(((offset + e.loaded) / file.size) * 100)),
              );
            },
          });
          break;
        } catch (err) {
          if (attempt >= MAX_RETRIES || !isRetryable(err)) throw err;
          await sleep(1000 * attempt);
        }
      }
      offset = end;
    }
  } catch (err) {
    await axios.delete(url, { params: { uploadId } }).catch(() => {});
    throw err;
  }
}
