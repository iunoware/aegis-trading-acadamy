"use client";

import React, { useState } from "react";
import { Trash2, Loader2, X, AlertOctagon } from "lucide-react";
import { User } from "./UsersTable";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirmDelete: (userId: string) => Promise<void>;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  user,
  onConfirmDelete,
}: DeleteUserModalProps) {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !user) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirmDelete(user.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#121214] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5 bg-rose-500/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/20 text-rose-400 shrink-0">
              <AlertOctagon size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Permanently Delete User?</h2>
              <p className="text-xs text-rose-300 font-mono">Database Record Deletion</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-zinc-300 leading-relaxed">
            Are you sure you want to permanently delete user account{" "}
            <span className="font-bold text-white font-mono">{user.name}</span> ({user.email})?
          </p>

          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1 font-mono">
            <p className="font-bold text-rose-200">⚠️ Warning: Irreversible Action</p>
            <p className="text-[11px] text-rose-300/90 leading-snug">
              This will completely wipe out user profile data, subscriptions, activity logs, and account settings from the database.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg disabled:opacity-50 transition-all cursor-pointer"
            >
              {deleting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  <span>Delete User Permanently</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
