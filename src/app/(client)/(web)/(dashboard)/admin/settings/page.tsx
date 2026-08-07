"use client";

import { useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  Globe2,
  // LockKeyhole,
  Mail,
  Plus,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  UserPlus,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
// import Toggle from "@/components/Toggle";

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

interface ComplimentaryUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

interface NewComplimentaryUserForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  status: "ACTIVE" | "INACTIVE";
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

const INITIAL_COMPLIMENTARY_USERS: ComplimentaryUser[] = [
  {
    id: "student-001",
    name: "Demo Student",
    email: "student@aegistrading.com",
    phone: "+1 555 010 2026",
    status: "ACTIVE",
    createdAt: "2026-08-06",
  },
];

const INITIAL_USER_FORM: NewComplimentaryUserForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  status: "ACTIVE",
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

// interface ToggleFieldProps {
//   label: string;
//   description: string;
//   checked: boolean;
//   onChange: (checked: boolean) => void;
// }

// function ToggleField({ label, description, checked, onChange }: ToggleFieldProps) {
//   return (
//     <div className="flex items-center justify-between gap-5 border-b border-white/8 py-4 last:border-b-0">
//       <div>
//         <p className="text-sm font-semibold text-zinc-200">{label}</p>

//         <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-500">
//           {description}
//         </p>
//       </div>

//       {/* <button
//         type="button"
//         role="switch"
//         aria-checked={checked}
//         onClick={() => onChange(!checked)}
//         className={`relative h-6 w-12 shrink-0 rounded-full border transition-colors ${
//           checked ? "border-primary bg-primary" : "border-white/15 bg-[#252525]"
//         }`}
//       >
//         <span
//           className={`absolute top-1 h-4 w-4 rounded-full transition-transform ${
//             checked ? "translate-x-1 bg-black" : "-translate-x-5 bg-zinc-400"
//           }`}
//         />
//       </button> */}

//       {/* <label
//         // type="button"
//         role="switch"
//         aria-checked={checked}
//         onClick={() => onChange(!checked)}
//         className="relative cursor-pointer block h-7 w-13 rounded-full bg-gray-300 transition-colors [-webkit-tap-highlight-color:transparent] has-checked:bg-primary dark:bg-gray-600 dark:has-checked:bg-primary"
//       >
//         <input type="checkbox" id="AcceptConditions" className="peer sr-only" />

//         <span className="absolute inset-y-0 inset-s-0 m-1 size-5 rounded-full bg-white transition-[inset-inline-start] peer-checked:inset-s-6 dark:bg-gray-900"></span>
//       </label> */}

//       <Toggle checked={checked} onChange={onChange} />
//     </div>
//   );
// }

const inputClassName =
  "h-11 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-(--primary)/60";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsForm>(INITIAL_SETTINGS);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [complimentaryUsers, setComplimentaryUsers] = useState<ComplimentaryUser[]>(
    INITIAL_COMPLIMENTARY_USERS,
  );

  const [searchQuery, setSearchQuery] = useState("");

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const [newUserForm, setNewUserForm] =
    useState<NewComplimentaryUserForm>(INITIAL_USER_FORM);

  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

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

  function updateNewUserField<K extends keyof NewComplimentaryUserForm>(
    field: K,
    value: NewComplimentaryUserForm[K],
  ) {
    setNewUserForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function closeAddUserModal() {
    if (isCreatingUser) return;

    setIsAddUserModalOpen(false);
    setNewUserForm(INITIAL_USER_FORM);
    setShowPassword(false);
  }

  async function handleCreateComplimentaryUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = newUserForm.name.trim();
    const email = newUserForm.email.trim().toLowerCase();
    const phone = newUserForm.phone.trim();
    const password = newUserForm.password;

    if (!name || !email || !password) {
      return;
    }

    try {
      setIsCreatingUser(true);

      await new Promise((resolve) => setTimeout(resolve, 700));

      const newUser: ComplimentaryUser = {
        id: `student-${Date.now()}`,
        name,
        email,
        phone,
        status: newUserForm.status,
        createdAt: new Date().toISOString(),
      };

      setComplimentaryUsers((currentUsers) => [newUser, ...currentUsers]);

      closeAddUserModal();
    } catch (error) {
      console.error("Unable to create complimentary user:", error);
    } finally {
      setIsCreatingUser(false);
    }
  }

  const filteredComplimentaryUsers = complimentaryUsers.filter((user) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return true;

    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.toLowerCase().includes(query)
    );
  });

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

          {/* User creation */}
          <SettingsSection
            icon={UsersRound}
            title="Student Account Management"
            description="Create brand-new student login accounts with complimentary course access."
          >
            <div className="space-y-5">
              {/* Header controls */}
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="relative w-full lg:max-w-md">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                  />

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by name, email, or phone..."
                    className={`${inputClassName} pl-11`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary-light via-primary to-primary-dark px-5 text-sm font-bold text-black"
                >
                  <Plus size={17} />
                  Create Student Account
                </button>
              </div>

              {/* Information box */}
              <div className="flex items-start gap-3 rounded-xl border border-(--primary)/20 bg-primary/5 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-(--primary)/20 bg-primary/10 text-primary">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">Student access only</p>

                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                    Accounts created here can log in and watch published course videos
                    without purchasing a subscription. They will not have access to any
                    admin routes or admin panel features.
                  </p>
                </div>
              </div>

              {/* Users table */}
              <div className="overflow-hidden rounded-xl border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-212.5 border-collapse text-left">
                    <thead className="bg-white/3">
                      <tr className="border-b border-white/10">
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Student
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Email
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Phone
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Access
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Status
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Created
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredComplimentaryUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-white/8 last:border-b-0"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-(--primary)/20 bg-primary/10 text-sm font-bold text-primary">
                                {user.name.charAt(0).toUpperCase()}
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {user.name}
                                </p>

                                <p className="mt-0.5 text-xs text-zinc-600">Student</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-zinc-300">
                            {user.email}
                          </td>

                          <td className="px-5 py-4 text-sm text-zinc-400">
                            {user.phone || "—"}
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400">
                              Complimentary
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                user.status === "ACTIVE"
                                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                  : "border-zinc-500/20 bg-zinc-500/10 text-zinc-400"
                              }`}
                            >
                              {user.status === "ACTIVE" ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-zinc-500">
                            {new Date(user.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                            })}
                          </td>
                        </tr>
                      ))}

                      {filteredComplimentaryUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-zinc-600">
                              <UsersRound size={21} />
                            </div>

                            <p className="mt-3 text-sm font-semibold text-zinc-300">
                              No students found
                            </p>

                            <p className="mt-1 text-xs text-zinc-600">
                              Try another search or create a complimentary student
                              account.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-right text-xs text-zinc-600">
                {filteredComplimentaryUsers.length}{" "}
                {filteredComplimentaryUsers.length === 1 ? "student" : "students"}
              </p>
            </div>
          </SettingsSection>

          {/* Platform security */}
          {/* <SettingsSection
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
          </SettingsSection> */}
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

      {isAddUserModalOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAddUserModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-student-title"
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#121212] shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
          >
            <div className="flex items-start justify-between border-b border-white/10 px-5 py-5 sm:px-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-(--primary)/30 bg-primary/10 text-primary">
                  <UserPlus size={20} />
                </div>

                <div>
                  <h2 id="add-student-title" className="text-lg font-bold text-white">
                    Create New Student Account
                  </h2>

                  <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                    Create a new email and password that the student can use to log in.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeAddUserModal}
                disabled={isCreatingUser}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleCreateComplimentaryUser}>
              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <FormField label="Full Name">
                  <input
                    type="text"
                    value={newUserForm.name}
                    onChange={(event) => updateNewUserField("name", event.target.value)}
                    placeholder="Enter student name"
                    required
                    className={inputClassName}
                  />
                </FormField>

                {/* <FormField label="Email Address">
                  <input
                    type="email"
                    value={newUserForm.email}
                    onChange={(event) => updateNewUserField("email", event.target.value)}
                    placeholder="Enter email address"
                    required
                    className={inputClassName}
                  />
                </FormField> */}
                <FormField
                  label="New Login Email"
                  description="This email must not already belong to another account."
                >
                  <input
                    type="email"
                    value={newUserForm.email}
                    onChange={(event) => updateNewUserField("email", event.target.value)}
                    placeholder="student@example.com"
                    autoComplete="off"
                    required
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Phone Number" description="Optional contact number.">
                  <input
                    type="tel"
                    value={newUserForm.phone}
                    onChange={(event) => updateNewUserField("phone", event.target.value)}
                    placeholder="Enter phone number"
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Account Status">
                  <select
                    value={newUserForm.status}
                    onChange={(event) =>
                      updateNewUserField(
                        "status",
                        event.target.value as "ACTIVE" | "INACTIVE",
                      )
                    }
                    className={inputClassName}
                  >
                    <option value="ACTIVE" className="bg-[#121212]">
                      Active
                    </option>

                    <option value="INACTIVE" className="bg-[#121212]">
                      Inactive
                    </option>
                  </select>
                </FormField>

                {/* <div className="sm:col-span-2">
                  <FormField
                    label="Temporary Password"
                    description="The student can use this password to log in. Password reset can be added later."
                  >
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newUserForm.password}
                        onChange={(event) =>
                          updateNewUserField("password", event.target.value)
                        }
                        placeholder="Enter temporary password"
                        minLength={8}
                        required
                        className={`${inputClassName} pr-12`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white"
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </FormField>
                </div> */}
                <div className="sm:col-span-2">
                  <FormField
                    label="New Login Password"
                    description="Create the password the student will use for their first login."
                  >
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newUserForm.password}
                        onChange={(event) =>
                          updateNewUserField("password", event.target.value)
                        }
                        placeholder="Create a secure password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                        className={`${inputClassName} pr-12`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white"
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck size={17} className="mt-0.5 shrink-0 text-primary" />

                      <div>
                        <p className="text-sm font-semibold text-white">
                          Student role is fixed
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                          This account will be created as a student. It can access
                          published courses but cannot open or use the admin panel.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeAddUserModal}
                  disabled={isCreatingUser}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                {/* <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary-light via-primary to-primary-dark px-5 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <UserPlus size={17} />

                  {isCreatingUser ? "Creating..." : "Create Student"}
                </button> */}
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary-light via-primary to-primary-dark px-5 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <UserPlus size={17} />

                  {isCreatingUser ? "Creating Account..." : "Create Student Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
