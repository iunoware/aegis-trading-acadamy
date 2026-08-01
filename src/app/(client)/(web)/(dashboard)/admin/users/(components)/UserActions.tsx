"use client";

import React from "react";
import { User } from "./UsersTable";
import { Edit2, Ban, UserCheck, Trash2, Settings } from "lucide-react";

interface UserActionsProps {
  user: User;
  onEditUser: (user: User) => void;
  onToggleStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export function UserActions({
  user,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
}: UserActionsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Settings size={15} className="text-[#C9A227]" />
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
          Account Administration Actions
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Edit User Button */}
        <button
          type="button"
          onClick={() => onEditUser(user)}
          className="flex items-center justify-between p-3 rounded-xl bg-[#09090b] border border-white/10 hover:border-sky-500/40 hover:bg-sky-500/10 text-xs font-semibold text-zinc-200 hover:text-sky-300 transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Edit2 size={14} className="text-sky-400" />
            <span>Edit User</span>
          </span>
          <span className="text-[10px] font-mono text-zinc-500">Profile</span>
        </button>

        {/* Suspend / Reactivate User */}
        <button
          type="button"
          onClick={() => onToggleStatus(user.id)}
          className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            user.accountStatus === "Active"
              ? "bg-[#09090b] border-amber-500/30 hover:bg-amber-500/10 text-amber-300"
              : "bg-[#09090b] border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-300"
          }`}
        >
          <span className="flex items-center gap-2">
            {user.accountStatus === "Active" ? (
              <Ban size={14} className="text-amber-400" />
            ) : (
              <UserCheck size={14} className="text-emerald-400" />
            )}
            <span>
              {user.accountStatus === "Active" ? "Suspend Account" : "Reactivate Account"}
            </span>
          </span>
          <span className="text-[10px] font-mono uppercase">
            {user.accountStatus === "Active" ? "Restrict" : "Restore"}
          </span>
        </button>

        {/* Delete User */}
        <button
          type="button"
          onClick={() => onDeleteUser(user.id)}
          className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/20 text-xs font-semibold text-rose-300 transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Trash2 size={14} className="text-rose-400" />
            <span>Delete User</span>
          </span>
          <span className="text-[10px] font-mono text-rose-400 uppercase">
            Permanent
          </span>
        </button>
      </div>
    </div>
  );
}
