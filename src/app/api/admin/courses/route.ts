/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ActivityAction,
  ActivityActorType,
  ContentStatus,
} from "@/generated/prisma/client";
import { getRequiredSuperAdmin } from "@/lib/current-user";
// import { saveThumbnail } from "@/lib/video-storage";
import { deleteVideoFile } from "@/lib/video-storage";
import { saveThumbnail, deleteThumbnailFile } from "@/lib/thumbnail-storage";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  try {
    await getRequiredSuperAdmin();

    const courses = await prisma.course.findMany({
      where: { deletedAt: null },
      orderBy: { displayOrder: "asc" },
      include: {
        lessons: {
          where: { deletedAt: null },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        courses,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET courses error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch courses.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await getRequiredSuperAdmin();
    const formData = await request.formData();

    const title = formData.get("title")?.toString().trim() || "";
    const description = formData.get("description")?.toString().trim() || "";
    const status =
      formData.get("status") === "PUBLISHED"
        ? ContentStatus.PUBLISHED
        : ContentStatus.DRAFT;
    const thumbnailFile = formData.get("thumbnail");

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Course title is required." },
        { status: 400 },
      );
    }

    let thumbnailUrl: string | null = null;
    if (thumbnailFile instanceof File) {
      thumbnailUrl = await saveThumbnail(thumbnailFile);
    }

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.course.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const maxOrder = await prisma.course.aggregate({
      _max: { displayOrder: true },
      where: {},
    });

    const now = new Date();

    const course = await prisma.$transaction(async (tx) => {
      const created = await tx.course.create({
        data: {
          title,
          slug,
          description: description || null,
          thumbnailUrl,
          status,
          displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
          createdById: adminUser.id,
          publishedAt: status === ContentStatus.PUBLISHED ? now : null,
        },
      });

      await tx.activityLog.create({
        data: {
          actorId: adminUser.id,
          actorType: ActivityActorType.SUPER_ADMIN,
          action: ActivityAction.COURSE_CREATED,
          module: "COURSES",
          title: "Course created",
          description: `Course "${created.title}" was created.`,
          targetId: created.id,
          targetType: "COURSE",
          afterData: {
            courseId: created.id,
            title: created.title,
            status: created.status,
          },
        },
      });

      return created;
    });

    return NextResponse.json(
      { success: true, message: "Course created successfully.", course },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST course error:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, message: "A course with this title already exists." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to create course." },
      { status: 500 },
    );
  }
}
