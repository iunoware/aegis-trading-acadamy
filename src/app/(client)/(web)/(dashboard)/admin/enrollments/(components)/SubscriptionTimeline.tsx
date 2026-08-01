"use client";

import React from "react";
import { TimelineRecord } from "./EnrollmentsTable";
import {
  Activity,
  CreditCard,
  RefreshCw,
  CalendarPlus,
  Ban,
  ShieldCheck,
  FileText,
} from "lucide-react";

interface SubscriptionTimelineProps {
  timeline: TimelineRecord[];
}

export function SubscriptionTimeline({ timeline }: SubscriptionTimelineProps) {
  const getActionIcon = (type: TimelineRecord["type"]) => {
    switch (type) {
      case "purchase":
        return <CreditCard size={12} className="text-[#C9A227]" />;
      case "renew":
        return <RefreshCw size={12} className="text-emerald-400" />;
      case "plan_change":
        return <ShieldCheck size={12} className="text-[#C9A227]" />;
      case "extend":
        return <CalendarPlus size={12} className="text-sky-400" />;
      case "cancel":
        return <Ban size={12} className="text-rose-400" />;
      case "reactivate":
        return <RefreshCw size={12} className="text-emerald-400" />;
      case "note":
        return <FileText size={12} className="text-[#C9A227]" />;
      default:
        return <Activity size={12} className="text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Activity size={15} className="text-[#C9A227]" />
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
          Subscription Lifecycle Timeline ({timeline.length})
        </h4>
      </div>

      <div className="rounded-xl bg-[#09090b] border border-white/10 p-4 space-y-4">
        {timeline.length > 0 ? (
          <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-white/10">
            {timeline.map((item) => (
              <div key={item.id} className="relative group">
                {/* Dot Icon */}
                <div className="absolute -left-5 top-0.5 w-4 h-4 rounded-full bg-[#111113] border border-white/20 flex items-center justify-center shadow-xs group-hover:border-[#C9A227] transition-colors">
                  {getActionIcon(item.type)}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold text-white leading-tight">
                    {item.action}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {item.date}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                  {item.details}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-xs font-mono text-zinc-500">
            No subscription events recorded.
          </div>
        )}
      </div>
    </div>
  );
}
