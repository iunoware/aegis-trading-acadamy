import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequiredSuperAdmin } from "@/lib/current-user";

interface RouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    await getRequiredSuperAdmin();

    const { id } = await params;
    const body = await request.json();

    const testimonial = await prisma.testimonial.update({
      where: {
        id,
      },
      data: {
        ...(body.customerName !== undefined && {
          customerName: body.customerName,
        }),
        ...(body.designation !== undefined && {
          designation: body.designation || null,
        }),
        ...(body.company !== undefined && {
          company: body.company || null,
        }),
        ...(body.avatarUrl !== undefined && {
          avatarUrl: body.avatarUrl || null,
        }),
        ...(body.rating !== undefined && {
          rating: body.rating,
        }),
        ...(body.reviewText !== undefined && {
          reviewText: body.reviewText,
        }),
        ...(body.displayOrder !== undefined && {
          displayOrder: body.displayOrder,
        }),
        ...(body.status !== undefined && {
          status: body.status === "Published" ? "PUBLISHED" : "HIDDEN",
          publishedAt: body.status === "Published" ? new Date() : null,
        }),
      },
    });

    return NextResponse.json({
      ...testimonial,
      status: testimonial.status === "PUBLISHED" ? "Published" : "Hidden",
      createdAt: testimonial.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Failed to update testimonial:", error);

    return NextResponse.json(
      { message: "Failed to update testimonial" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  try {
    await getRequiredSuperAdmin();

    const { id } = await params;

    await prisma.testimonial.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete testimonial:", error);

    return NextResponse.json(
      {
        message: "Failed to delete testimonial",
      },
      {
        status: 500,
      },
    );
  }
}
