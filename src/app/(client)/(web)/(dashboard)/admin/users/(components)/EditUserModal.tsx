"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Edit2, X } from "lucide-react";
import { User } from "./UsersTable";

interface EditUserModalProps {
  user: User | null;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [accountStatus, setAccountStatus] = useState<"Active" | "Suspended" | "Inactive">("Active");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setPhone(user.phone);
      setIsSubscribed(user.isSubscribed);
      setAccountStatus(user.accountStatus);
    }
  }, [user]);

  useEffect(() => {
    if (user && backdropRef.current && modalRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        modalRef.current,
        { scale: 0.95, opacity: 0, y: 10 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedName = `${firstName.trim()} ${lastName.trim()}`.trim();

    const updatedUser: User = {
      ...user,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: updatedName,
      email: email.trim(),
      phone: phone.trim(),
      isSubscribed,
      accountStatus,
      activityTimeline: [
        {
          id: `act-edit-${Date.now()}`,
          action: "Updated Profile",
          date: "01 Aug 2026",
          details: "Account details updated by administrator.",
        },
        ...user.activityTimeline,
      ],
    };

    onSave(updatedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-2xl bg-[#09090b] border border-white/15 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-10 space-y-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Edit2 size={16} />
            </div>
            <h3 className="text-base font-extrabold text-white font-sans">
              Edit User Account
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                Subscription
              </label>
              <select
                value={isSubscribed ? "true" : "false"}
                onChange={(e) => setIsSubscribed(e.target.value === "true")}
                className="w-full bg-[#111113] border border-white/15 rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
              >
                <option value="true" className="bg-[#111113]">Subscribed</option>
                <option value="false" className="bg-[#111113]">Not Subscribed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                Account Status
              </label>
              <select
                value={accountStatus}
                onChange={(e) => setAccountStatus(e.target.value as "Active" | "Suspended" | "Inactive")}
                className="w-full bg-[#111113] border border-white/15 rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
              >
                <option value="Active" className="bg-[#111113]">Active</option>
                <option value="Suspended" className="bg-[#111113]">Suspended</option>
                <option value="Inactive" className="bg-[#111113]">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] text-black hover:brightness-110 shadow-md transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
