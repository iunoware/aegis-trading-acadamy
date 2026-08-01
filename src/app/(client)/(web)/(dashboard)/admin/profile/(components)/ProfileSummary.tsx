import { CalendarDays, CheckCircle2, ShieldCheck } from "lucide-react";
import type { ProfileRecord } from "./types";

interface ProfileSummaryProps {
  profile: ProfileRecord;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const formatRole = (role: ProfileRecord["role"]) => {
  if (role === "SUPER_ADMIN") return "Super Admin";

  return "Admin";
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function ProfileSummary({ profile }: ProfileSummaryProps) {
  return (
    <aside className="h-fit overflow-hidden rounded-2xl border border-white/10 bg-[#111113]/90 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
      <div className="relative border-b border-white/10 p-6 text-center">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#C9A227]/10 blur-[45px]" />

        <div className="relative">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#C9A227]/40 bg-[#C9A227]/15 text-3xl font-extrabold text-[#C9A227]">
            {getInitials(profile.name)}
          </div>

          <h2 className="mt-4 text-lg font-extrabold text-white">{profile.name}</h2>

          <p className="mt-1 break-all font-mono text-xs text-zinc-400">
            {profile.email}
          </p>

          <div
            className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
              profile.isActive
                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                : "border-rose-500/30 bg-rose-500/15 text-rose-400"
            }`}
          >
            <CheckCircle2 size={12} />
            {profile.isActive ? "Active Account" : "Inactive Account"}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <SummaryItem icon={ShieldCheck} label="Role" value={formatRole(profile.role)} />

        <SummaryItem
          icon={CalendarDays}
          label="Created"
          value={formatDate(profile.createdAt)}
        />

        <SummaryItem
          icon={CalendarDays}
          label="Updated"
          value={formatDate(profile.updatedAt)}
        />
      </div>
    </aside>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-[#C9A227]" />

        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          {label}
        </span>
      </div>

      <span className="text-right text-xs font-bold text-white">{value}</span>
    </div>
  );
}
