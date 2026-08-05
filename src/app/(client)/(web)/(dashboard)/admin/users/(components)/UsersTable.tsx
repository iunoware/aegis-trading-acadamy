"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  ShieldCheck,
  // ShieldAlert,
  // User as UserIcon,
} from "lucide-react";

export interface ActivityRecord {
  id: string;
  action: string;
  date: string;
  details: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  isSubscribed: boolean;
  accountStatus: "Active" | "Suspended";
  joinedDate: string;
  lastLogin: string;
  activityTimeline: ActivityRecord[];
}

interface UsersTableProps {
  users: User[];
  onSelectUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export function UsersTable({
  users,
  onSelectUser,
  onEditUser,
  onDeleteUser,
}: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const tableRef = useRef<HTMLDivElement>(null);

  // GSAP animation on search/filter/sort updates
  useEffect(() => {
    if (tableRef.current) {
      gsap.fromTo(
        tableRef.current,
        { opacity: 0.85, y: 5 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [searchQuery, filterOption, sortBy]);

  // Filtering Logic
  const filteredUsers = users
    .filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q);

      let matchesFilter = true;
      if (filterOption === "SUBSCRIBED") matchesFilter = u.isSubscribed;
      else if (filterOption === "NOT_SUBSCRIBED") matchesFilter = !u.isSubscribed;
      else if (filterOption === "ACTIVE") matchesFilter = u.accountStatus === "Active";
      else if (filterOption === "SUSPENDED") matchesFilter = u.accountStatus === "Suspended";
      else if (filterOption === "RECENT") {
        matchesFilter = new Date(u.joinedDate).getTime() > new Date("2026-07-01").getTime();
      }

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime();
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  return (
    <div className="space-y-4">
      {/* Search, Filter & Sort Bar */}
      <div className="p-4 rounded-2xl bg-[#111113]/90 backdrop-blur-xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-md">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Search by Name, Email, or Mobile Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#09090b] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
          />
        </div>

        {/* Filters & Sorting */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Main Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#09090b] border border-white/15 rounded-xl px-3 py-1.5">
            <Filter size={13} className="text-[#C9A227]" />
            <select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#111113]">All Users</option>
              <option value="SUBSCRIBED" className="bg-[#111113]">Subscribed</option>
              <option value="NOT_SUBSCRIBED" className="bg-[#111113]">Not Subscribed</option>
              <option value="ACTIVE" className="bg-[#111113]">Active Accounts</option>
              <option value="SUSPENDED" className="bg-[#111113]">Suspended Accounts</option>
              <option value="RECENT" className="bg-[#111113]">Recently Joined</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-[#09090b] border border-white/15 rounded-xl px-3 py-1.5">
            <ArrowUpDown size={13} className="text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "name")}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-[#111113]">Sort: Newest</option>
              <option value="oldest" className="bg-[#111113]">Sort: Oldest</option>
              <option value="name" className="bg-[#111113]">Sort: Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Responsive Table */}
      <div
        ref={tableRef}
        className="rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#09090b]/80 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                <th className="py-3.5 px-4 font-semibold">User</th>
                <th className="py-3.5 px-4 font-semibold">Contact Details</th>
                <th className="py-3.5 px-4 font-semibold">Subscription</th>
                <th className="py-3.5 px-4 font-semibold">Joined Date</th>
                <th className="py-3.5 px-4 font-semibold">Last Login</th>
                <th className="py-3.5 px-4 font-semibold">Account Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const initials = `${user.firstName[0] || ""}${user.lastName[0] || ""}`.toUpperCase();

                  return (
                    <tr
                      key={user.id}
                      onClick={() => onSelectUser(user)}
                      className="hover:bg-white/4 transition-colors cursor-pointer group"
                    >
                      {/* Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] font-bold text-xs shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-white block leading-tight group-hover:text-[#C9A227] transition-colors">
                              {user.name}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              ID: {user.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5 font-mono text-[11px]">
                          <span className="flex items-center gap-1 text-zinc-300">
                            <Mail size={11} className="text-zinc-500" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1 text-zinc-400">
                            <Phone size={11} className="text-zinc-500" />
                            {user.phone}
                          </span>
                        </div>
                      </td>

                      {/* Subscription Status (Subscribed / Not Subscribed ONLY) */}
                      <td className="py-3.5 px-4 font-mono">
                        {user.isSubscribed ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <ShieldCheck size={12} />
                            Subscribed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/5 text-zinc-400 border border-white/10">
                            Not Subscribed
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400">
                        {user.joinedDate}
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-300">
                        {user.lastLogin}
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-4 font-mono">
                        {user.accountStatus === "Active" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectUser(user)}
                            title="View User Details"
                            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:border-[#C9A227]/40 hover:bg-[#C9A227]/10 text-zinc-400 hover:text-[#C9A227] flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditUser(user)}
                            title="Edit User Info"
                            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:border-sky-500/40 hover:bg-sky-500/10 text-zinc-400 hover:text-sky-400 flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteUser(user.id)}
                            title="Delete User Account"
                            className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 font-mono">
                    No registered users match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive User Cards */}
        <div className="block md:hidden divide-y divide-white/5">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => onSelectUser(user)}
                className="p-4 space-y-3 hover:bg-white/3 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] font-bold text-xs">
                      {`${user.firstName[0] || ""}${user.lastName[0] || ""}`}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{user.name}</h4>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  {user.isSubscribed ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Subscribed
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-zinc-400 border border-white/10">
                      Not Subscribed
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">JOINED:</span>
                    <span className="text-zinc-300">{user.joinedDate}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">STATUS:</span>
                    <span
                      className={`font-bold ${
                        user.accountStatus === "Active"
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {user.accountStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-zinc-500 font-mono text-xs">
              No registered users found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
