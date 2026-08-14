import apiClient from "@/lib/axios";
import { User } from "@/app/(client)/(web)/(dashboard)/admin/users/(components)/UsersTable";

export interface UsersApiResponse {
  success: boolean;
  users: User[];
  total?: number;
  message?: string;
}

export interface UserApiResponse {
  success: boolean;
  user: User;
  message?: string;
}

export interface DeleteUserApiResponse {
  success: boolean;
  message?: string;
  id?: string;
}

export interface CreateUserData {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  discordName?: string;
  isSubscribed?: boolean;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  discordName?: string;
  accountStatus?: string;
  status?: string;
}

export interface SubscriptionPlanItem {
  id: string;
  name: string;
  type: string;
  price: number;
  currency: string;
  durationMonths: number;
  badge?: string;
  description?: string;
}

export interface SubscriptionPlansApiResponse {
  success: boolean;
  plans: SubscriptionPlanItem[];
  message?: string;
}

/**
 * Fetch all users directory
 * GET /api/admin/users
 */
export const getUsers = async (): Promise<UsersApiResponse> => {
  return apiClient.get<unknown, UsersApiResponse>("/admin/users");
};

/**
 * Create a new student user
 * POST /api/admin/users
 */
export const createUser = async (
  data: CreateUserData
): Promise<UserApiResponse> => {
  return apiClient.post<unknown, UserApiResponse>("/admin/users", data);
};

/**
 * Update an existing user profile or status
 * PATCH /api/admin/users/:id
 */
export const updateUser = async (
  id: string,
  data: UpdateUserData
): Promise<UserApiResponse> => {
  return apiClient.patch<unknown, UserApiResponse>(`/admin/users/${id}`, data);
};

/**
 * Soft delete a user by ID
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (
  id: string
): Promise<DeleteUserApiResponse> => {
  return apiClient.delete<unknown, DeleteUserApiResponse>(`/admin/users/${id}`);
};

/**
 * Fetch active subscription plans for user assignment
 * GET /api/admin/subscription-plans
 */
export const getSubscriptionPlans = async (): Promise<SubscriptionPlansApiResponse> => {
  return apiClient.get<unknown, SubscriptionPlansApiResponse>("/admin/subscription-plans");
};

/**
 * Manually grant or update a subscription for a student
 * POST /api/admin/users/:id/subscription
 */
export const grantUserSubscription = async (
  userId: string,
  planId: string
): Promise<UserApiResponse> => {
  return apiClient.post<unknown, UserApiResponse>(`/admin/users/${userId}/subscription`, { planId });
};

/**
 * Revoke an active subscription for a student
 * DELETE /api/admin/users/:id/subscription
 */
export const revokeUserSubscription = async (
  userId: string
): Promise<UserApiResponse> => {
  return apiClient.delete<unknown, UserApiResponse>(`/admin/users/${userId}/subscription`);
};
