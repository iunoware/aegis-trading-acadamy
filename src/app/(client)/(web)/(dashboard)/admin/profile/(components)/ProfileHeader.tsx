import { ShieldCheck } from "lucide-react";
import type { AdminRole } from "./types";

interface ProfileHeaderProps {
  role: AdminRole;
}

const formatRole = (role: AdminRole) => {
  if (role === "SUPER_ADMIN") return "Super Admin";

  return "Admin";
};

export function ProfileHeader({ role }: ProfileHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#C9A227]/30 bg-[#C9A227]/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-[#C9A227]">
          <ShieldCheck size={13} />
          Account Settings
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Profile
        </h1>

        <p className="mt-1 text-sm text-zinc-400">
          Manage your account details and password.
        </p>
      </div>

      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#C9A227]/30 bg-[#C9A227]/10 px-4 py-2 font-mono text-xs font-bold text-[#C9A227]">
        <ShieldCheck size={15} />
        {formatRole(role)}
      </div>
    </header>
  );
}
