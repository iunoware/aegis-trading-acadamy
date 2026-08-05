import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    const formattedTestimonials = testimonials.map((testimonial) => ({
      ...testimonial,
      status: testimonial.status === "PUBLISHED" ? "Published" : "Hidden",
      createdAt: testimonial.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedTestimonials);
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch testimonials",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const testimonial = await prisma.testimonial.create({
      data: {
        customerName: body.customerName,
        designation: body.designation || null,
        company: body.company || null,
        avatarUrl: body.avatarUrl || null,
        rating: body.rating,
        reviewText: body.reviewText,
        displayOrder: body.displayOrder,
        status: body.status === "Published" ? "PUBLISHED" : "HIDDEN",
        publishedAt: body.status === "Published" ? new Date() : null,
      },
    });

    const formattedTestimonial = {
      ...testimonial,
      status: testimonial.status === "PUBLISHED" ? "Published" : "Hidden",
      createdAt: testimonial.createdAt.toISOString(),
    };

    return NextResponse.json(formattedTestimonial, {
      status: 201,
    });
  } catch (error) {
    console.error("Failed to create testimonial:", error);

    return NextResponse.json(
      {
        message: "Failed to create testimonial",
      },
      {
        status: 500,
      },
    );
  }
}
