export type AdminRole = "SUPER_ADMIN" | "ADMIN";

export interface ProfileRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileFormValues {
  name: string;
  email: string;
  phone: string;
}

export interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileUpdateRequest {
  profile: ProfileFormValues;
  password?: PasswordFormValues;
}
