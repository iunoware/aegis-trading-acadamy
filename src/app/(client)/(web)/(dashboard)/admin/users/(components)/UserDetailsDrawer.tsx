"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { User } from "./UsersTable";
import { UserProfileCard } from "./UserProfileCard";
import { AccountInfoCard } from "./AccountInfoCard";
import { ActivityTimeline } from "./ActivityTimeline";
import { UserActions } from "./UserActions";
import { X, User as UserIcon } from "lucide-react";

interface UserDetailsDrawerProps {
  user: User | null;
  onClose: () => void;
  onEditUser: (user: User) => void;
  onToggleStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export function UserDetailsDrawer({
  user,
  onClose,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
}: UserDetailsDrawerProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && backdropRef.current && drawerRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        drawerRef.current,
        { x: "100%" },
        { x: "0%", duration: 0.4, ease: "power2.out" }
      );
    }
  }, [user]);

  if (!user) return null;

  const handleClose = () => {
    if (backdropRef.current && drawerRef.current) {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.25 });
      gsap.to(drawerRef.current, {
        x: "100%",
        duration: 0.3,
        ease: "power2.in",
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className="fixed top-0 bottom-0 right-0 z-50 w-full max-w-xl bg-[#050507]/95 backdrop-blur-2xl border-l border-white/10 p-6 flex flex-col justify-between shadow-[-10px_0_40px_rgba(0,0,0,0.9)] overflow-y-auto"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
                <UserIcon size={16} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#C9A227] font-bold uppercase tracking-widest block">
                  REGISTERED USER ACCOUNT
                </span>
                <h2 className="text-base font-extrabold text-white font-sans leading-none">
                  {user.name}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Personal Information */}
          <UserProfileCard user={user} />

          {/* Account Information */}
          <AccountInfoCard user={user} />

          {/* Admin Actions */}
          <UserActions
            user={user}
            onEditUser={onEditUser}
            onToggleStatus={onToggleStatus}
            onDeleteUser={(id) => {
              onDeleteUser(id);
              handleClose();
            }}
          />

          {/* Activity Timeline */}
          <ActivityTimeline activities={user.activityTimeline} />
        </div>
      </aside>
    </div>
  );
}
