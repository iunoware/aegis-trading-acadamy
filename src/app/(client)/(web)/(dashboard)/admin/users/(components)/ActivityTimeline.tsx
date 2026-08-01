"use client";

import React from "react";
import { ActivityRecord } from "./UsersTable";
import {
  Activity,
  UserPlus,
  Key,
  LogIn,
  LogOut,
  UserCheck,
} from "lucide-react";

interface ActivityTimelineProps {
  activities: ActivityRecord[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const getActionIcon = (action: string) => {
    if (action.includes("Created")) return <UserPlus size={12} className="text-[#C9A227]" />;
    if (action.includes("Password")) return <Key size={12} className="text-amber-400" />;
    if (action.includes("Updated")) return <UserCheck size={12} className="text-sky-400" />;
    if (action.includes("Logged Out")) return <LogOut size={12} className="text-zinc-400" />;
    if (action.includes("Logged In")) return <LogIn size={12} className="text-emerald-400" />;
    return <Activity size={12} className="text-zinc-400" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Activity size={15} className="text-[#C9A227]" />
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
          Account Activity Timeline
        </h4>
      </div>

      <div className="rounded-xl bg-[#09090b] border border-white/10 p-4 space-y-4">
        {activities.length > 0 ? (
          <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-white/10">
            {activities.map((act) => (
              <div key={act.id} className="relative group">
                {/* Dot Icon */}
                <div className="absolute -left-5 top-0.5 w-4 h-4 rounded-full bg-[#111113] border border-white/20 flex items-center justify-center shadow-xs group-hover:border-[#C9A227] transition-colors">
                  {getActionIcon(act.action)}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold text-white leading-tight">
                    {act.action}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {act.date}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                  {act.details}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-xs font-mono text-zinc-500">
            No account activity logged yet.
          </div>
        )}
      </div>
    </div>
  );
}
