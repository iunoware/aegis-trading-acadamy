"use client";

import React from "react";
import { User } from "./UsersTable";
import { ShieldCheck, ShieldAlert, UserCheck, Ban } from "lucide-react";

interface AccountInfoCardProps {
  user: User;
}

export function AccountInfoCard({ user }: AccountInfoCardProps) {
  return (
    <div className="rounded-2xl bg-[#111113] border border-white/10 p-5 space-y-3 shadow-md">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C9A227] block">
        ACCOUNT INFORMATION
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        {/* Subscription Status Only */}
        <div className="p-3.5 rounded-xl bg-[#09090b] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block font-semibold mb-1">
              Subscription Status
            </span>
            {user.isSubscribed ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck size={14} />
                Subscribed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 text-zinc-400 border border-white/10">
                Not Subscribed
              </span>
            )}
          </div>
        </div>

        {/* Account Status Only */}
        <div className="p-3.5 rounded-xl bg-[#09090b] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block font-semibold mb-1">
              Account Status
            </span>
            {user.accountStatus === "Active" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <UserCheck size={14} />
                Active Account
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Ban size={14} />
                Suspended Account
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
