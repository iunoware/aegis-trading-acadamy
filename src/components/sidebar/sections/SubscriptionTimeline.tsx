"use client";

import React from "react";
import {
  History,
  ShoppingBag,
  RefreshCw,
  ArrowUpRight,
  CalendarPlus,
  Ban,
  CheckCircle,
  FileText,
} from "lucide-react";

export interface TimelineRecord {
  id: string;
  action: string;
  date: string;
  details: string;
  type:
    | "purchase"
    | "renew"
    | "plan_change"
    | "extend"
    | "cancel"
    | "reactivate"
    | "note";
}

interface SubscriptionTimelineProps {
  timeline: TimelineRecord[];
}

export function SubscriptionTimeline({ timeline }: SubscriptionTimelineProps) {
  const getIcon = (type: TimelineRecord["type"]) => {
    switch (type) {
      case "purchase":
        return <ShoppingBag size={13} className="text-emerald-400" />;
      case "renew":
        return <RefreshCw size={13} className="text-[#C9A227]" />;
      case "plan_change":
        return <ArrowUpRight size={13} className="text-amber-400" />;
      case "extend":
        return <CalendarPlus size={13} className="text-blue-400" />;
      case "cancel":
        return <Ban size={13} className="text-rose-400" />;
      case "reactivate":
        return <CheckCircle size={13} className="text-emerald-400" />;
      case "note":
        return <FileText size={13} className="text-purple-400" />;
      default:
        return <History size={13} className="text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <History size={15} className="text-[#C9A227]" />
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
          Subscription Lifecycle Timeline
        </h4>
      </div>

      {!timeline || timeline.length === 0 ? (
        <div className="p-4 rounded-xl bg-[#111113] border border-white/10 text-center text-xs font-mono text-zinc-500">
          No timeline events recorded.
        </div>
      ) : (
        <div className="rounded-2xl bg-[#111113] border border-white/10 p-4 space-y-4 shadow-md">
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
            {timeline.map((item) => (
              <div key={item.id} className="relative group">
                {/* Dot Icon */}
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#09090b] border border-white/15 flex items-center justify-center shadow-xs">
                  {getIcon(item.type)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-200 font-sans">
                      {item.action}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                      {item.date}
                    </span>
                  </div>
                  {item.details && (
                    <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                      {item.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
