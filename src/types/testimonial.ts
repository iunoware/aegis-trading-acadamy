export type TestimonialStatus = "Published" | "Hidden";

export interface Testimonial {
  id: string;
  customerName: string;
  designation?: string;
  company?: string;
  avatarUrl?: string;
  rating: number;
  reviewText: string;
  status: TestimonialStatus;
  displayOrder: number;
  createdAt: string;
}

export interface TestimonialPayload {
  customerName: string;
  designation?: string;
  company?: string;
  avatarUrl?: string;
  rating: number;
  reviewText: string;
  status: TestimonialStatus;
  displayOrder: number;
}

export interface TestimonialApiResponse {
  success: boolean;
  message: string;
  testimonial: Testimonial;
}

export interface TestimonialsApiResponse {
  success: boolean;
  testimonials: Testimonial[];
}
