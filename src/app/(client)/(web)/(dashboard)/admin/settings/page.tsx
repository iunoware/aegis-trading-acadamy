"use client";

import { useState } from "react";
import {
  // Bell,
  // BookOpen,
  Check,
  // CreditCard,
  Globe2,
  LockKeyhole,
  Mail,
  Save,
  Settings2,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";
import Toggle from "@/components/Toggle";

interface SettingsForm {
  academyName: string;
  supportEmail: string;
  supportPhone: string;
  websiteUrl: string;
  monthlyPrice: string;
  yearlyPrice: string;
  courseAccess: "all" | "subscription";
  renewalReminderDays: string;
  emailNotifications: boolean;
  paymentNotifications: boolean;
  expiryNotifications: boolean;
  courseNotifications: boolean;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
}

const INITIAL_SETTINGS: SettingsForm = {
  academyName: "Aegis Trading Academy",
  supportEmail: "support@aegistrading.com",
  supportPhone: "+91 98765 43210",
  websiteUrl: "https://aegistrading.com",
  monthlyPrice: "49",
  yearlyPrice: "300",
  courseAccess: "subscription",
  renewalReminderDays: "3",
  emailNotifications: true,
  paymentNotifications: true,
  expiryNotifications: true,
  courseNotifications: false,
  maintenanceMode: false,
  allowRegistrations: true,
};

interface SettingsSectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212]/80">
      <div className="border-b border-white/10 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-(--primary)/30 bg-primary/10 text-primary">
            <Icon size={20} />
          </div>

          <div>
            <h2 className="text-base font-bold text-white sm:text-lg">{title}</h2>

            <p className="mt-1 text-sm leading-relaxed text-zinc-500">{description}</p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

interface FormFieldProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function FormField({ label, description, children }: FormFieldProps) {
  return (
    <div>
      <div className="mb-2">
        <label className="text-sm font-semibold text-zinc-200">{label}</label>

        {description && (
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">{description}</p>
        )}
      </div>

      {children}
    </div>
  );
}

interface ToggleFieldProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleField({ label, description, checked, onChange }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-white/8 py-4 last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-zinc-200">{label}</p>

        <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-500">
          {description}
        </p>
      </div>

      {/* <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-12 shrink-0 rounded-full border transition-colors ${
          checked ? "border-primary bg-primary" : "border-white/15 bg-[#252525]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full transition-transform ${
            checked ? "translate-x-1 bg-black" : "-translate-x-5 bg-zinc-400"
          }`}
        />
      </button> */}

      {/* <label
        // type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative cursor-pointer block h-7 w-13 rounded-full bg-gray-300 transition-colors [-webkit-tap-highlight-color:transparent] has-checked:bg-primary dark:bg-gray-600 dark:has-checked:bg-primary"
      >
        <input type="checkbox" id="AcceptConditions" className="peer sr-only" />

        <span className="absolute inset-y-0 inset-s-0 m-1 size-5 rounded-full bg-white transition-[inset-inline-start] peer-checked:inset-s-6 dark:bg-gray-900"></span>
      </label> */}

      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

const inputClassName =
  "h-11 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-(--primary)/60";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsForm>(INITIAL_SETTINGS);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateField<K extends keyof SettingsForm>(field: K, value: SettingsForm[K]) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [field]: value,
    }));

    setSaved(false);
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      setSaved(false);

      // Replace this with your API request later.
      // await axios.patch("/api/admin/settings", settings);

      await new Promise((resolve) => setTimeout(resolve, 700));

      setSaved(true);
    } catch (error) {
      console.error("Unable to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-(--primary)/30 bg-primary/5 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
              <ShieldCheck size={14} />
              Admin Panel
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Platform Settings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
              Manage academy details, subscriptions, course access, notifications, and
              platform security.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary-light via-primary to-primary-dark px-5 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saved ? (
              <>
                <Check size={17} strokeWidth={3} />
                Saved
              </>
            ) : (
              <>
                <Save size={17} />
                {isSaving ? "Saving..." : "Save Changes"}
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {/* General settings */}
          <SettingsSection
            icon={Settings2}
            title="General Settings"
            description="Update the primary information displayed across the academy platform."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField label="Academy Name">
                <div className="relative">
                  <UserRound
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                  />

                  <input
                    type="text"
                    value={settings.academyName}
                    onChange={(event) => updateField("academyName", event.target.value)}
                    className={`${inputClassName} pl-11`}
                  />
                </div>
              </FormField>

              <FormField label="Website URL">
                <div className="relative">
                  <Globe2
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                  />

                  <input
                    type="url"
                    value={settings.websiteUrl}
                    onChange={(event) => updateField("websiteUrl", event.target.value)}
                    className={`${inputClassName} pl-11`}
                  />
                </div>
              </FormField>

              <FormField label="Support Email">
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                  />

                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(event) => updateField("supportEmail", event.target.value)}
                    className={`${inputClassName} pl-11`}
                  />
                </div>
              </FormField>

              <FormField label="Support Phone">
                <div className="relative">
                  <Smartphone
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                  />

                  <input
                    type="tel"
                    value={settings.supportPhone}
                    onChange={(event) => updateField("supportPhone", event.target.value)}
                    className={`${inputClassName} pl-11`}
                  />
                </div>
              </FormField>
            </div>
          </SettingsSection>

          {/* Subscription settings */}
          {/* <SettingsSection
            icon={CreditCard}
            title="Subscription Settings"
            description="Configure membership prices and renewal reminder settings."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <FormField label="Monthly Price" description="Monthly membership amount.">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">
                    $
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={settings.monthlyPrice}
                    onChange={(event) => updateField("monthlyPrice", event.target.value)}
                    className={`${inputClassName} pl-8`}
                  />
                </div>
              </FormField>

              <FormField label="Yearly Price" description="Yearly membership amount.">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">
                    $
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={settings.yearlyPrice}
                    onChange={(event) => updateField("yearlyPrice", event.target.value)}
                    className={`${inputClassName} pl-8`}
                  />
                </div>
              </FormField>

              <FormField
                label="Renewal Reminder"
                description="Days before subscription expiry."
              >
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={settings.renewalReminderDays}
                    onChange={(event) =>
                      updateField("renewalReminderDays", event.target.value)
                    }
                    className={`${inputClassName} pr-16`}
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                    days
                  </span>
                </div>
              </FormField>
            </div>
          </SettingsSection> */}

          {/* Notifications */}
          {/* <SettingsSection
            icon={Bell}
            title="Notification Settings"
            description="Choose which activities should send notifications to administrators."
          >
            <ToggleField
              label="Email Notifications"
              description="Receive important platform updates through email."
              checked={settings.emailNotifications}
              onChange={(checked) => updateField("emailNotifications", checked)}
            />

            <ToggleField
              label="Payment Notifications"
              description="Receive a notification whenever a user completes a payment."
              checked={settings.paymentNotifications}
              onChange={(checked) => updateField("paymentNotifications", checked)}
            />

            <ToggleField
              label="Subscription Expiry Notifications"
              description="Receive notifications when a user's subscription is approaching expiry."
              checked={settings.expiryNotifications}
              onChange={(checked) => updateField("expiryNotifications", checked)}
            />

            <ToggleField
              label="Course Completion Notifications"
              description="Receive a notification whenever a user completes a course category."
              checked={settings.courseNotifications}
              onChange={(checked) => updateField("courseNotifications", checked)}
            />
          </SettingsSection> */}

          {/* Platform security */}
          <SettingsSection
            icon={LockKeyhole}
            title="Platform Controls"
            description="Control registrations and temporary platform availability."
          >
            <ToggleField
              label="Allow New Registrations"
              description="Allow new users to create an account on the academy platform."
              checked={settings.allowRegistrations}
              onChange={(checked) => updateField("allowRegistrations", checked)}
            />

            <ToggleField
              label="Maintenance Mode"
              description="Temporarily prevent users from accessing the platform while maintenance is in progress."
              checked={settings.maintenanceMode}
              onChange={(checked) => updateField("maintenanceMode", checked)}
            />
          </SettingsSection>
        </div>

        {/* Bottom save bar */}
        <div className="sticky bottom-4 mt-8 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#121212]/95 p-4 shadow-[0_15px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Settings2 size={17} />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Platform configuration</p>

              <p className="text-xs text-zinc-500">
                Save your changes before leaving this page.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="ml-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary-light via-primary to-primary-dark px-6 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {saved ? (
              <>
                <Check size={17} strokeWidth={3} />
                Changes Saved
              </>
            ) : (
              <>
                <Save size={17} />
                {isSaving ? "Saving..." : "Save Changes"}
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
