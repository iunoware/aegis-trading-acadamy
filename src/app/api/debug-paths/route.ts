// src/app/api/debug-paths/route.ts

// temporary route file

import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

export async function GET() {
  const cwd = process.cwd();
  let files: string[] = [];
  try {
    files = await readdir(path.join(cwd, "public", "uploads", "course-thumbnails"));
  } catch (e) {
    files = [`ERROR: ${(e as Error).message}`];
  }
  return NextResponse.json({ cwd, files });
}
