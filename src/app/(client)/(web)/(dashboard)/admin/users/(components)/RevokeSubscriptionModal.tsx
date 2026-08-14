"use client";

import React, { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { User } from "./UsersTable";
import { revokeUserSubscription } from "@/lib/services/users.service";

interface RevokeSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: (updatedUser: User) => void;
}

export function RevokeSubscriptionModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: RevokeSubscriptionModalProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleRevoke = async () => {
    setSubmitting(true);
    try {
      const res = await revokeUserSubscription(user.id);
      if (res.success && res.user) {
        toast.success(res.message || `Subscription for ${user.name} revoked successfully.`);
        onSuccess(res.user);
        onClose();
      } else {
        toast.error(res.message || "Failed to revoke subscription.");
      }
    } catch (err: any) {
      console.error("Revoke subscription error:", err);
      toast.error(err?.response?.data?.message || "Failed to revoke subscription.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-rose-500/20 bg-[#121214] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5 bg-rose-500/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/20 text-rose-400">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Revoke Subscription?</h2>
              <p className="text-xs text-rose-300">Action cannot be undone automatically</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-zinc-300 leading-relaxed">
            Are you sure you want to revoke subscription access for{" "}
            <span className="font-bold text-white">{user.name}</span>?
          </p>
          <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/10 text-xs text-rose-400 font-mono">
            This user will immediately lose access to premium subscription courses.
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRevoke}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-500 text-xs font-bold shadow-lg disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Revoking...</span>
                </>
              ) : (
                <span>Revoke Access</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
