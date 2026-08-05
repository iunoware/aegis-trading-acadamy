/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { User } from "./UsersTable";
import { Mail, Phone, Calendar, Clock, User as UserIcon } from "lucide-react";

interface UserProfileCardProps {
  user: User;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const initials = `${user.firstName[0] || ""}${user.lastName[0] || ""}`.toUpperCase();

  return (
    <div className="rounded-2xl bg-[#111113] border border-white/10 p-5 space-y-4 shadow-md">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative w-14 h-14 rounded-full bg-linear-to-br from-[#e6c55a]/20 to-[#C9A227]/30 border-2 border-[#C9A227]/50 flex items-center justify-center text-[#C9A227] font-extrabold text-lg shadow-lg shrink-0">
          <span>{initials}</span>
          <span
            className={`w-3.5 h-3.5 rounded-full border-2 border-[#111113] absolute bottom-0 right-0 ${
              user.accountStatus === "Active" ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
        </div>

        {/* Name & ID */}
        <div>
          <h3 className="text-lg font-black text-white font-sans">{user.name}</h3>
          <span className="text-xs font-mono text-zinc-400">Account ID: {user.id}</span>
        </div>
      </div>

      {/* Personal Information Grid */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C9A227] block">
          PERSONAL INFORMATION
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-[#09090b] border border-white/5">
            <span className="text-[10px] text-zinc-500 block uppercase">First Name</span>
            <span className="text-white font-semibold">{user.firstName}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#09090b] border border-white/5">
            <span className="text-[10px] text-zinc-500 block uppercase">Last Name</span>
            <span className="text-white font-semibold">{user.lastName}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#09090b] border border-white/5 flex items-center gap-2">
            <Mail size={14} className="text-[#C9A227] shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] text-zinc-500 block uppercase">Email</span>
              <span className="text-zinc-200 truncate block font-medium">
                {user.email}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#09090b] border border-white/5 flex items-center gap-2">
            <Phone size={14} className="text-[#C9A227] shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase">
                Phone Number
              </span>
              <span className="text-zinc-200 font-medium">{user.phone}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#09090b] border border-white/5 flex items-center gap-2">
            <Calendar size={14} className="text-[#C9A227] shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase">
                Registration Date
              </span>
              <span className="text-zinc-200 font-medium">{user.joinedDate}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#09090b] border border-white/5 flex items-center gap-2">
            <Clock size={14} className="text-[#C9A227] shrink-0" />
            <div>
              {/* <span className="text-[10px] text-zinc-500 block uppercase">Last Login</span>
              <span className="text-zinc-200 font-medium">{user.lastLogin}</span> */}
              <span className="text-[10px] text-zinc-500 block uppercase">Discord</span>
              <span className="text-zinc-200 font-medium">{user.discordName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
