/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type {
  PasswordFormValues,
  ProfileFormValues,
  ProfileRecord,
  ProfileUpdateRequest,
} from "./types";

interface ProfileFormProps {
  profile: ProfileRecord;
  isSaving?: boolean;
  onSubmit: (request: ProfileUpdateRequest) => void | Promise<void>;
}

const EMPTY_PASSWORD_FORM: PasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function ProfileForm({ profile, isSaving = false, onSubmit }: ProfileFormProps) {
  const [profileForm, setProfileForm] = useState<ProfileFormValues>({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
  });

  const [passwordForm, setPasswordForm] =
    useState<PasswordFormValues>(EMPTY_PASSWORD_FORM);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const updateProfileField = (field: keyof ProfileFormValues, value: string) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updatePasswordField = (field: keyof PasswordFormValues, value: string) => {
    setPasswordForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isChangingPassword = Object.values(passwordForm).some(Boolean);

    await onSubmit({
      profile: {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
      },

      ...(isChangingPassword
        ? {
            password: passwordForm,
          }
        : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-[#111113]/90 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.45)] sm:p-6">
        <SectionHeading
          icon={UserRound}
          title="Basic Details"
          description="Update your personal and contact information."
        />

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ReadOnlyField
            label="Name"
            icon={UserRound}
            value={profileForm.name}
            // placeholder="Enter your name"
            // onChange={(value) => updateProfileField("name", value)}
            // required
          />

          <ReadOnlyField
            label="Email"
            icon={Mail}
            // type="email"
            value={profileForm.email}
            // placeholder="Enter your email"
            // onChange={(value) => updateProfileField("email", value)}
            // required
          />

          {/* <ReadOnlyField
            label="Phone"
            icon={Phone}
            type="tel"
            value={profileForm.phone}
            placeholder="Enter phone number"
            onChange={(value) => updateProfileField("phone", value)}
          /> */}

          <ReadOnlyField
            label="Role"
            icon={ShieldCheck}
            value={profile.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111113]/90 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.45)] sm:p-6">
        <SectionHeading
          icon={KeyRound}
          title="Change Password"
          description="Leave these fields empty when you do not want to change your password."
        />

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <PasswordField
            label="Current Password"
            value={passwordForm.currentPassword}
            placeholder="Current password"
            visible={showPassword.current}
            onChange={(value) => updatePasswordField("currentPassword", value)}
            onToggle={() =>
              setShowPassword((current) => ({
                ...current,
                current: !current.current,
              }))
            }
          />

          <PasswordField
            label="New Password"
            value={passwordForm.newPassword}
            placeholder="New password"
            visible={showPassword.new}
            onChange={(value) => updatePasswordField("newPassword", value)}
            onToggle={() =>
              setShowPassword((current) => ({
                ...current,
                new: !current.new,
              }))
            }
          />

          <PasswordField
            label="Confirm Password"
            value={passwordForm.confirmPassword}
            placeholder="Confirm password"
            visible={showPassword.confirm}
            onChange={(value) => updatePasswordField("confirmPassword", value)}
            onToggle={() =>
              setShowPassword((current) => ({
                ...current,
                confirm: !current.confirm,
              }))
            }
          />
        </div>

        <p className="mt-4 font-mono text-[10px] leading-5 text-zinc-500">
          Password must be at least 8 characters and contain one number and one special
          character.
        </p>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] px-5 py-3 text-xs font-bold text-black hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={16} />

          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-white/10 pb-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#C9A227]/30 bg-[#C9A227]/10 text-[#C9A227]">
        <Icon size={17} />
      </div>

      <div>
        <h2 className="text-base font-extrabold text-white">{title}</h2>

        <p className="mt-1 text-xs leading-5 text-zinc-400">{description}</p>
      </div>
    </div>
  );
}

function FormField({
  label,
  icon: Icon,
  value,
  placeholder,
  type = "text",
  required = false,
  onChange,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <div className="relative">
        <Icon
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
        />

        <input
          type={type}
          value={value}
          required={required}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-white/15 bg-[#09090b] py-3 pl-10 pr-4 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
        />
      </div>
    </label>
  );
}

function ReadOnlyField({
  label,
  icon: Icon,
  value,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
}) {
  return (
    <label className="space-y-2">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <div className="relative">
        <Icon
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9A227]"
        />

        <input
          value={value}
          disabled
          className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-xs text-zinc-400 outline-none"
        />
      </div>
    </label>
  );
}

function PasswordField({
  label,
  value,
  placeholder,
  visible,
  onChange,
  onToggle,
}: {
  label: string;
  value: string;
  placeholder: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <label className="space-y-2">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </span>

      <div className="relative">
        <KeyRound
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
        />

        <input
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-white/15 bg-[#09090b] py-3 pl-10 pr-11 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#C9A227]"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}
