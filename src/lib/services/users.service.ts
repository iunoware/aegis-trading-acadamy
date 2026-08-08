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

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  discordName?: string;
  accountStatus?: string;
  status?: string;
}

/**
 * Fetch all users directory
 * GET /api/users
 */
export const getUsers = async (): Promise<UsersApiResponse> => {
  return apiClient.get<unknown, UsersApiResponse>("/users");
};

/**
 * Update an existing user profile or status
 * PATCH /api/users/:id
 */
export const updateUser = async (
  id: string,
  data: UpdateUserData
): Promise<UserApiResponse> => {
  return apiClient.patch<unknown, UserApiResponse>(`/users/${id}`, data);
};

/**
 * Soft delete a user by ID
 * DELETE /api/users/:id
 */
export const deleteUser = async (
  id: string
): Promise<DeleteUserApiResponse> => {
  return apiClient.delete<unknown, DeleteUserApiResponse>(`/users/${id}`);
};
