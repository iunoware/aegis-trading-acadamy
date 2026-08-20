"use client";

import { useAuth } from "@/context/AuthContext";
import {
  User,
  LogOut,
  Shield,
  Award,
  // Activity,
  Mail,
  Phone,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function StudentDashboardPage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-zinc-400">
            Loading student profile...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 bg-[#050505] text-white selection:bg-primary/30 py-10 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Glows */}
      {/* <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 blur-[130px] pointer-events-none rounded-full" /> */}

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Public Website
          </Link>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Welcome Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-[11px] font-mono font-bold text-primary uppercase">
            <Shield size={13} />
            Student Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Welcome, {user?.name || "Student"}
          </h1>
          <p className="text-sm text-zinc-400">
            Access your courses, subscription status, and activity overview.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="rounded-2xl border border-white/10 bg-[#111113]/90 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Profile Info</h3>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  Account Details
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <Mail size={14} className="text-zinc-500 shrink-0" />
                <span className="truncate">{user?.email || "Not specified"}</span>
              </div>

              {user?.phone && (
                <div className="flex items-center gap-2 text-zinc-300">
                  <Phone size={14} className="text-zinc-500 shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}

              {user?.discordName && (
                <div className="flex items-center gap-2 text-zinc-300">
                  <MessageSquare size={14} className="text-primary shrink-0" />
                  <span>Discord: {user.discordName}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">Status</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold uppercase">
                  {user?.status || "ACTIVE"}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          <div className="rounded-2xl border border-white/10 bg-[#111113]/90 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Award size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Subscription</h3>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  Membership Status
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                  Active Plan
                </span>
                <p className="text-xs font-bold text-white">Academy Student Access</p>
              </div>

              <p className="text-xs text-zinc-400">
                Full access to student resources and trading modules.
              </p>
            </div>
          </div>

          {/* Activity Overview Card */}
          {/* <div className="rounded-2xl border border-white/10 bg-[#111113]/90 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">My Activity</h3>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  Recent Session
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <p className="text-zinc-300">
                  Successfully authenticated as student.
                </p>
                <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                  Session Active
                </span>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </main>
  );
}
