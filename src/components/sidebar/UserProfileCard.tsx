"use client";

import React from "react";
import { Mail, Phone, Calendar, User as UserIcon } from "lucide-react";
import { DiscordIcon } from "@/components/Icons";

export interface UserProfileData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  discordName?: string;
  avatar?: string;
  status?: string;
  joinedDate?: string;
}

interface UserProfileCardProps {
  user: UserProfileData;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const parts = (user.name || "").trim().split(/\s+/);
  const initials =
    parts.length > 1
      ? `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase()
      : `${(user.name || "U")[0] || ""}`.toUpperCase();

  const isStatusActive = user.status === "Active" || user.status === "ACTIVE";

  return (
    <div className="rounded-2xl bg-[#111113] border border-white/10 p-5 space-y-4 shadow-md">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative w-14 h-14 rounded-full bg-linear-to-br from-[#e6c55a]/20 to-[#C9A227]/30 border-2 border-[#C9A227]/50 flex items-center justify-center text-[#C9A227] font-extrabold text-lg shadow-lg shrink-0 overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
          <span
            className={`w-3.5 h-3.5 rounded-full border-2 border-[#111113] absolute bottom-0 right-0 ${
              isStatusActive ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
        </div>

        {/* Name & Email & Status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-black text-white font-sans truncate">{user.name}</h3>
            {user.status && (
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                  user.status === "Active"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : user.status === "Expiring Soon"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : user.status === "Cancelled"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    : "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
                }`}
              >
                {user.status}
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-zinc-400 truncate">{user.email}</p>
          {user.id && (
            <span className="text-[10px] font-mono text-zinc-500">ID: {user.id}</span>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C9A227] block">
          USER INFORMATION
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-[#09090b] border border-white/5 flex items-center gap-2">
            <Mail size={14} className="text-[#C9A227] shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] text-zinc-500 block uppercase">Email</span>
              <span className="text-zinc-200 truncate block font-medium">
                {user.email || "N/A"}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#09090b] border border-white/5 flex items-center gap-2">
            <Phone size={14} className="text-[#C9A227] shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase">Phone</span>
              <span className="text-zinc-200 font-medium">
                {user.phone || "N/A"}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#09090b] border border-white/5 flex items-center gap-2">
            <DiscordIcon className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase">Discord</span>
              <span className="text-zinc-200 font-medium">
                {user.discordName || "N/A"}
              </span>
            </div>
          </div>

          {user.joinedDate && (
            <div className="p-2.5 rounded-xl bg-[#09090b] border border-white/5 flex items-center gap-2">
              <Calendar size={14} className="text-[#C9A227] shrink-0" />
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">Joined</span>
                <span className="text-zinc-200 font-medium">{user.joinedDate}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
