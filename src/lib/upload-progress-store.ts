type ProgressEntry = {
  percent: number;
  done: boolean;
  error: string | null;
};

const store = new Map<string, ProgressEntry>();

export function initProgress(uploadId: string) {
  store.set(uploadId, { percent: 0, done: false, error: null });
}

export function updateProgress(uploadId: string, percent: number) {
  const entry = store.get(uploadId);
  if (entry) {
    entry.percent = percent;
  } else {
    store.set(uploadId, { percent, done: false, error: null });
  }
}

export function completeProgress(uploadId: string) {
  const entry = store.get(uploadId) ?? { percent: 100, done: false, error: null };
  entry.percent = 100;
  entry.done = true;
  store.set(uploadId, entry);

  // Let a slow-to-connect SSE client still read the final state, then clean up
  setTimeout(() => store.delete(uploadId), 30_000);
}

export function failProgress(uploadId: string, message: string) {
  const entry = store.get(uploadId) ?? { percent: 0, done: false, error: null };
  entry.done = true;
  entry.error = message;
  store.set(uploadId, entry);

  setTimeout(() => store.delete(uploadId), 30_000);
}

export function getProgress(uploadId: string): ProgressEntry | null {
  return store.get(uploadId) ?? null;
}
