"use client";

import {
  // Check,
  Eye,
  EyeOff,
  Plus,
  // Save,
  Search,
  // Settings2,
  ShieldCheck,
  UserPlus,
  UsersRound,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";

interface SettingsForm {
  academyName: string;
  supportEmail: string;
  supportPhone: string;
  websiteUrl: string;
}

const INITIAL_SETTINGS: SettingsForm = {
  academyName: "Aegis Trading Academy",
  supportEmail: "support@aegistrading.com",
  supportPhone: "+91 98765 43210",
  websiteUrl: "https://aegistrading.com",
};

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
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212]">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            <Icon size={19} />
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
    <div className="space-y-2">
      <div>
        <label className="text-sm font-semibold text-zinc-300">{label}</label>

        {description && (
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">{description}</p>
        )}
      </div>

      {children}
    </div>
  );
}

const inputClassName =
  "h-11 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-primary/60";

export default function AdminSettingsPage() {
  // GENERAL SETTINGS
  const [settings, setSettings] = useState<SettingsForm>(INITIAL_SETTINGS);

  const [savedSettings, setSavedSettings] = useState<SettingsForm>(INITIAL_SETTINGS);

  // COMPLIMENTARY STUDENT USERS
  const [complimentaryUsers, setComplimentaryUsers] = useState<ComplimentaryUser[]>(
    INITIAL_COMPLIMENTARY_USERS,
  );
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const [newUserForm, setNewUserForm] =
    useState<NewComplimentaryUserForm>(INITIAL_USER_FORM);

  const [showPassword, setShowPassword] = useState(false);

  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // SAVE STATE
  const [isSaving, setIsSaving] = useState(false);

  const [saved, setSaved] = useState(false);

  // CHECK FOR GENERAL SETTINGS CHANGES
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  // EDIT STUDENT
  const [editingUser, setEditingUser] = useState<ComplimentaryUser | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // DELETE STUDENT
  const [deletingUser, setDeletingUser] = useState<ComplimentaryUser | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  function openEditModal(user: ComplimentaryUser) {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
    });
  }

  function closeEditModal() {
    if (isSavingEdit) return;
    setEditingUser(null);
  }

  async function handleUpdateUser(event: React.FormEvent) {
    event.preventDefault();
    if (!editingUser) return;

    const name = editForm.name.trim();
    const email = editForm.email.trim().toLowerCase();

    if (!name || !email) return;

    try {
      setIsSavingEdit(true);

      const response = await axios.patch("/api/admin/complimentary-users", {
        userId: editingUser.id,
        name,
        email,
        phone: editForm.phone.trim(),
        status: editForm.status,
      });

      const updated = response.data.user;

      setComplimentaryUsers((current) =>
        current.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)),
      );

      setEditingUser(null);
    } catch (error) {
      console.error("Unable to update complimentary user:", error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Failed to update student account.");
      } else {
        alert("Failed to update student account.");
      }
    } finally {
      setIsSavingEdit(false);
    }
  }
  async function handleDeleteUser() {
    if (!deletingUser) return;

    try {
      setIsDeletingUser(true);

      await axios.delete("/api/admin/complimentary-users", {
        data: { userId: deletingUser.id },
      });

      setComplimentaryUsers((current) => current.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
    } catch (error) {
      console.error("Unable to delete complimentary user:", error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Failed to delete student account.");
      } else {
        alert("Failed to delete student account.");
      }
    } finally {
      setIsDeletingUser(false);
    }
  }

  useEffect(() => {
    async function loadComplimentaryUsers() {
      try {
        setIsLoadingUsers(true);

        const response = await axios.get("/api/admin/complimentary-users");

        const users = response.data.users ?? [];

        setComplimentaryUsers(users);
      } catch (error) {
        console.error("Unable to fetch complimentary users:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    }

    loadComplimentaryUsers();
  }, []);

  // GENERAL SETTINGS UPDATE
  function updateField(
    field: keyof SettingsForm,
    value: SettingsForm[keyof SettingsForm],
  ) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [field]: value,
    }));

    setSaved(false);
  }

  // SAVE SETTINGS
  async function handleSave() {
    if (!hasChanges) {
      return;
    }

    try {
      setIsSaving(true);
      setSaved(false);

      await new Promise((resolve) => setTimeout(resolve, 700));

      setSavedSettings(settings);
      setSaved(true);
    } catch (error) {
      console.error("Unable to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  }

  // NEW STUDENT FORM UPDATE
  function updateNewUserField(
    field: keyof NewComplimentaryUserForm,
    value: NewComplimentaryUserForm[keyof NewComplimentaryUserForm],
  ) {
    setNewUserForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  // CLOSE CREATE USER MODAL
  function closeAddUserModal() {
    if (isCreatingUser) {
      return;
    }

    setIsAddUserModalOpen(false);
    setNewUserForm(INITIAL_USER_FORM);
    setShowPassword(false);
  }

  // CREATE COMPLIMENTARY STUDENT
  async function handleCreateComplimentaryUser(event: React.FormEvent) {
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

      const response = await axios.post("/api/admin/complimentary-users", {
        name,
        email,
        phone,
        password,
        status: newUserForm.status,
      });

      const createdUser = response.data.user;

      const user: ComplimentaryUser = {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone || "",
        status: createdUser.status,
        createdAt: createdUser.createdAt,
      };

      setComplimentaryUsers((currentUsers) => [user, ...currentUsers]);

      closeAddUserModal();
    } catch (error) {
      console.error("Unable to create complimentary user:", error);

      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Failed to create student account.");
      } else {
        alert("Failed to create student account.");
      }
    } finally {
      setIsCreatingUser(false);
    }
  }

  // FILTER USERS
  const filteredComplimentaryUsers = complimentaryUsers.filter((user) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Admin Panel
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Platform Settings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
              Manage academy details, subscriptions, course access, notifications, and
              platform security.
            </p>
          </div>

          {/* <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary-light via-primary to-primary-dark px-5 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
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
          </button> */}
        </div>

        <div className="mt-6 space-y-6">
          {/* STUDENT ACCOUNT MANAGEMENT */}
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
              <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
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

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Actions
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
                              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-bold text-primary">
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

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(user)}
                                aria-label="Edit student"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                              >
                                <Pencil size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeletingUser(user)}
                                aria-label="Delete student"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
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
        </div>

        {/* BOTTOM SAVE BAR */}
        {/* <div className="sticky bottom-4 mt-8 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#121212]/95 p-4 shadow-[0_15px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl">
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
            disabled={isSaving || !hasChanges}
            className="ml-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary-light via-primary to-primary-dark px-6 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
        </div> */}
      </div>

      {/* CREATE STUDENT MODAL */}
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
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-white/10 px-5 py-5 sm:px-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
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
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleCreateComplimentaryUser}>
              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                {/* Full name */}

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

                {/* Email */}
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

                {/* Phone */}
                <FormField label="Phone Number" description="Optional contact number.">
                  <input
                    type="tel"
                    value={newUserForm.phone}
                    onChange={(event) => updateNewUserField("phone", event.target.value)}
                    placeholder="Enter phone number"
                    className={inputClassName}
                  />
                </FormField>

                {/* Status */}
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

                {/* Password */}
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

                {/* Student role information */}
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

              {/* Modal footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeAddUserModal}
                  disabled={isCreatingUser}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

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

      {editingUser && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#121212] shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
          >
            <div className="flex items-start justify-between border-b border-white/10 px-5 py-5 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-white">Edit Student Account</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Update this student&apos;s account details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={isSavingEdit}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser}>
              <div className="space-y-5 p-5 sm:p-6">
                <FormField label="Full Name">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  label="Login Email"
                  description="Changing this updates the email the student logs in with."
                >
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, email: e.target.value }))
                    }
                    autoComplete="off"
                    required
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Phone Number">
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Account Status">
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        status: e.target.value as "ACTIVE" | "INACTIVE",
                      }))
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
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isSavingEdit}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary-light via-primary to-primary-dark px-5 text-sm font-bold text-black disabled:opacity-60"
                >
                  {isSavingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingUser && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeletingUser)
              setDeletingUser(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#121212] shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
          >
            <div className="p-6">
              <h2 className="text-lg font-bold text-white">Delete Student Account</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                This will permanently remove{" "}
                <span className="text-white">{deletingUser.name}</span>&apos;s account (
                {deletingUser.email}) and revoke their complimentary access. This
                can&apos;t be undone.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={isDeletingUser}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isDeletingUser}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {isDeletingUser ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
