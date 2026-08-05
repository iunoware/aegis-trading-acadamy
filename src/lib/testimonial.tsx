// // import type { ContentStatus, Testimonial as PrismaTestimonial } from "@/generated/prisma";
// import type {
//   Testimonial,
//   TestimonialPayload,
//   TestimonialStatus,
// } from "@/types/testimonial";

// export function mapStatusToDatabase(status: TestimonialStatus): ContentStatus {
//   return status === "Published" ? "PUBLISHED" : "HIDDEN";
// }

// export function mapStatusToClient(status: ContentStatus): TestimonialStatus {
//   return status === "PUBLISHED" ? "Published" : "Hidden";
// }

// export function mapTestimonialToClient(testimonial: PrismaTestimonial): Testimonial {
//   return {
//     id: testimonial.id,
//     customerName: testimonial.customerName,
//     designation: testimonial.designation ?? undefined,
//     company: testimonial.company ?? undefined,
//     avatarUrl: testimonial.avatarUrl ?? undefined,
//     rating: testimonial.rating,
//     reviewText: testimonial.reviewText,
//     status: mapStatusToClient(testimonial.status),
//     displayOrder: testimonial.displayOrder,
//     createdAt: testimonial.createdAt.toISOString(),
//   };
// }

// export function validateTestimonialPayload(value: unknown): TestimonialPayload {
//   if (!value || typeof value !== "object") {
//     throw new Error("Invalid testimonial data.");
//   }

//   const data = value as Partial<TestimonialPayload>;

//   const customerName = data.customerName?.trim();
//   const reviewText = data.reviewText?.trim();
//   const rating = Number(data.rating);
//   const displayOrder = Number(data.displayOrder);

//   if (!customerName) {
//     throw new Error("Customer name is required.");
//   }

//   if (!reviewText) {
//     throw new Error("Testimonial text is required.");
//   }

//   if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
//     throw new Error("Rating must be between 1 and 5.");
//   }

//   if (!Number.isInteger(displayOrder) || displayOrder < 1) {
//     throw new Error("Display order must be at least 1.");
//   }

//   if (data.status !== "Published" && data.status !== "Hidden") {
//     throw new Error("Invalid publication status.");
//   }

//   return {
//     customerName,
//     designation: data.designation?.trim() || undefined,
//     company: data.company?.trim() || undefined,
//     avatarUrl: data.avatarUrl?.trim() || undefined,
//     rating,
//     reviewText,
//     status: data.status,
//     displayOrder,
//   };
// }
