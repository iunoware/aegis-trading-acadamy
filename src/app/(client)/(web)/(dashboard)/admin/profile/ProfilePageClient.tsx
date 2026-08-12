"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ProfileForm } from "./(components)/ProfileForm";
import { ProfileHeader } from "./(components)/ProfileHeader";
import { ProfileSummary } from "./(components)/ProfileSummary";
import type { AdminRole, ProfileRecord, ProfileUpdateRequest } from "./(components)/types";
import type { AdminUser } from "@/lib/current-user";

interface ProfilePageClientProps {
  admin: AdminUser | null;
}

function mapAdminToProfileRecord(admin: AdminUser): ProfileRecord {
  const name =
    admin.name ||
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    "Admin";

  return {
    id: admin.id,
    name,
    email: admin.email,
    phone: admin.phone ?? "",
    role: admin.role as AdminRole,
    isActive: admin.status === "ACTIVE",
    createdAt:
      admin.createdAt instanceof Date
        ? admin.createdAt.toISOString()
        : String(admin.createdAt || new Date().toISOString()),
    updatedAt:
      admin.updatedAt instanceof Date
        ? admin.updatedAt.toISOString()
        : String(admin.updatedAt || new Date().toISOString()),
  };
}

export default function ProfilePageClient({ admin: initialAdmin }: ProfilePageClientProps) {
  const [profile, setProfile] = useState<ProfileRecord | null>(() =>
    initialAdmin ? mapAdminToProfileRecord(initialAdmin) : null
  );
  const [loading, setLoading] = useState<boolean>(!initialAdmin);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchFreshAdmin = async () => {
      try {
        const res = await axios.get("/api/admin/auth/me", {
          withCredentials: true,
        });

        if (res.data.success && res.data.authenticated && res.data.user) {
          setProfile(mapAdminToProfileRecord(res.data.user));
        }
      } catch (err) {
        console.error("Failed to fetch fresh admin profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFreshAdmin();
  }, []);

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
        toast.error(
          "Password must contain one number and one special character"
        );
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("New password and confirmation do not match");
        return;
      }
    }

    try {
      setIsSaving(true);

      setProfile((current) =>
        current
          ? {
              ...current,
              name: profileValues.name,
              email: profileValues.email,
              phone: profileValues.phone,
              updatedAt: new Date().toISOString(),
            }
          : null
      );

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

  if (loading || !profile) {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-8 pb-12">
        <div className="h-16 w-full animate-pulse rounded-2xl bg-white/5 border border-white/10 flex items-center px-6">
          <span className="text-xs font-mono text-zinc-500">Loading profile...</span>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="h-80 animate-pulse rounded-2xl bg-white/5 border border-white/10" />
          <div className="h-80 animate-pulse rounded-2xl bg-white/5 border border-white/10" />
        </div>
      </div>
    );
  }

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
