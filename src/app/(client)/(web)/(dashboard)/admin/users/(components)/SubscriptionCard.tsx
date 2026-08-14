"use client";

import React from "react";
import { User } from "./UsersTable";
import { ShieldCheck, Plus, RefreshCw, XCircle, Calendar } from "lucide-react";

interface SubscriptionCardProps {
  user: User;
  onOpenGiveModal: () => void;
  onOpenRevokeModal: () => void;
}

export function SubscriptionCard({
  user,
  onOpenGiveModal,
  onOpenRevokeModal,
}: SubscriptionCardProps) {
  const activeSub = user.activeSubscription;
  const isSubscribed = user.isSubscribed && activeSub;

  return (
    <div className="rounded-2xl bg-[#111113] border border-white/10 p-5 space-y-4 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C9A227] block">
          SUBSCRIPTION
        </span>
        {isSubscribed && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck size={12} />
            Active Access
          </span>
        )}
      </div>

      {isSubscribed ? (
        <div className="space-y-4">
          {/* Active Plan Card */}
          <div className="p-4 rounded-xl bg-[#09090b] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block font-semibold">
                  Current Plan
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  {activeSub.planName}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2 border-t border-white/5">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Started</span>
                <div className="flex items-center gap-1.5 text-zinc-300 mt-0.5">
                  <Calendar size={12} className="text-zinc-500" />
                  <span>{activeSub.startDate}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Expires</span>
                <div className="flex items-center gap-1.5 text-[#C9A227] mt-0.5">
                  <Calendar size={12} className="text-[#C9A227]/70" />
                  <span>{activeSub.currentExpiryDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons for Subscribed User */}
          <div className="grid grid-cols-2 gap-2 font-mono">
            <button
              type="button"
              onClick={onOpenGiveModal}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all"
            >
              <RefreshCw size={13} className="text-[#C9A227]" />
              <span>Change Plan</span>
            </button>
            <button
              type="button"
              onClick={onOpenRevokeModal}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold text-rose-400 transition-all"
            >
              <XCircle size={13} />
              <span>Revoke Access</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#09090b] border border-white/5 text-center space-y-3 font-mono">
          <p className="text-xs text-zinc-400">No active subscription</p>
          <button
            type="button"
            onClick={onOpenGiveModal}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#B38F1F] text-xs font-bold text-black shadow-lg hover:brightness-110 transition-all"
          >
            <Plus size={15} />
            <span>Give Subscription</span>
          </button>
        </div>
      )}
    </div>
  );
}
