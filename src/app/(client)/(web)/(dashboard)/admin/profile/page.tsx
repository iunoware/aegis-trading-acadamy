"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ProfileForm } from "./(components)/ProfileForm";
import { ProfileHeader } from "./(components)/ProfileHeader";
import { ProfileSummary } from "./(components)/ProfileSummary";
import { MOCK_PROFILE } from "./(components)/mock-data";
import type { ProfileRecord, ProfileUpdateRequest } from "./(components)/types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileRecord>(MOCK_PROFILE);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (request: ProfileUpdateRequest) => {
    const { profile: profileValues, password } = request;

    if (!profileValues.name) {
      toast.error("Name is required");
      return;
    }

    if (!profileValues.email) {
      toast.error("Email is required");
      return;
    }

    if (password) {
      const { currentPassword, newPassword, confirmPassword } = password;

      if (!currentPassword) {
        toast.error("Enter your current password");
        return;
      }

      if (newPassword.length < 8) {
        toast.error("New password must contain at least 8 characters");
        return;
      }

      const containsNumber = /\d/.test(newPassword);
      const containsSpecialCharacter = /[^a-zA-Z0-9]/.test(newPassword);

      if (!containsNumber || !containsSpecialCharacter) {
        toast.error("Password must contain one number and one special character");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("New password and confirmation do not match");
        return;
      }
    }

    try {
      setIsSaving(true);

      /*
       * Replace this section later with your API request.
       *
       * Example:
       *
       * await axios.patch("/api/profile", request);
       */

      setProfile((current) => ({
        ...current,
        name: profileValues.name,
        email: profileValues.email,
        phone: profileValues.phone,
        updatedAt: new Date().toISOString(),
      }));

      toast.success("Profile updated successfully", {
        description: password
          ? "Your account details and password have been updated."
          : "Your account details have been updated.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);

      toast.error("Unable to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8 pb-12">
      <ProfileHeader role={profile.role} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <ProfileSummary profile={profile} />

        <ProfileForm
          key={profile.updatedAt}
          profile={profile}
          isSaving={isSaving}
          onSubmit={handleSaveProfile}
        />
      </div>
    </div>
  );
}
