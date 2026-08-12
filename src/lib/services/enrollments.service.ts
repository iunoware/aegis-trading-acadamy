import apiClient from "@/lib/axios";
import { Enrollment } from "@/app/(client)/(web)/(dashboard)/admin/enrollments/(components)/EnrollmentsTable";

export interface EnrollmentsApiResponse {
  success: boolean;
  enrollments: Enrollment[];
  total?: number;
  message?: string;
}

export interface SingleEnrollmentApiResponse {
  success: boolean;
  enrollment: Enrollment;
  message?: string;
}

export interface ManualEnrollmentPayload {
  userName: string;
  userEmail: string;
  userPhone?: string;
  discordName?: string;
  plan?: string;
  currentPlan?: string;
  adminNotes?: string;
}

/**
 * Fetch all enrollments directory
 * GET /api/admin/enrollments
 */
export const getEnrollments = async (): Promise<EnrollmentsApiResponse> => {
  return apiClient.get<unknown, EnrollmentsApiResponse>("/admin/enrollments");
};

/**
 * Create a manual user enrollment
 * POST /api/admin/enrollments/manual
 */
export const createManualEnrollment = async (
  data: ManualEnrollmentPayload
): Promise<SingleEnrollmentApiResponse> => {
  return apiClient.post<unknown, SingleEnrollmentApiResponse>(
    "/admin/enrollments/manual",
    data
  );
};

/**
 * Extend a subscription by X days
 * PATCH /api/admin/enrollments/:id/extend
 */
export const extendSubscription = async (
  id: string,
  days: number
): Promise<SingleEnrollmentApiResponse> => {
  return apiClient.patch<unknown, SingleEnrollmentApiResponse>(
    `/admin/enrollments/${id}/extend`,
    { days }
  );
};

/**
 * Change subscription plan (Monthly vs Yearly)
 * PATCH /api/admin/enrollments/:id/plan
 */
export const changeSubscriptionPlan = async (
  id: string,
  newPlan: "Monthly Plan" | "Yearly Plan"
): Promise<SingleEnrollmentApiResponse> => {
  return apiClient.patch<unknown, SingleEnrollmentApiResponse>(
    `/admin/enrollments/${id}/plan`,
    { newPlan }
  );
};

/**
 * Toggle subscription status (Active <-> Cancelled)
 * PATCH /api/admin/enrollments/:id/status
 */
export const toggleSubscriptionStatus = async (
  id: string,
  status?: string
): Promise<SingleEnrollmentApiResponse> => {
  return apiClient.patch<unknown, SingleEnrollmentApiResponse>(
    `/admin/enrollments/${id}/status`,
    { status }
  );
};

/**
 * Save internal admin notes for subscription
 * PATCH /api/admin/enrollments/:id/notes
 */
export const saveSubscriptionNotes = async (
  id: string,
  notes: string
): Promise<SingleEnrollmentApiResponse> => {
  return apiClient.patch<unknown, SingleEnrollmentApiResponse>(
    `/admin/enrollments/${id}/notes`,
    { notes }
  );
};
