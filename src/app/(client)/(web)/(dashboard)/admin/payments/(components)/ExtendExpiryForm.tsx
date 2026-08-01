"use client";

import { useMemo, useState } from "react";
import { CalendarPlus } from "lucide-react";
import type { ExtensionRequest, OrderPaymentRecord } from "./types";

interface ExtendExpiryFormProps {
  record: OrderPaymentRecord;
  onExtend: (request: ExtensionRequest) => void;
}

const toInputDate = (value: string) => new Date(value).toISOString().slice(0, 10);

const addDays = (value: string, days: number) => {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export function ExtendExpiryForm({ record, onExtend }: ExtendExpiryFormProps) {
  const [newExpiryDate, setNewExpiryDate] = useState(
    toInputDate(record.currentExpiryDate),
  );
  const [reason, setReason] = useState("Complimentary access extension");

  const minimumDate = useMemo(() => {
    const currentExpiry = new Date(record.currentExpiryDate);
    const today = new Date();
    const base = currentExpiry > today ? currentExpiry : today;
    base.setDate(base.getDate() + 1);
    return base.toISOString().slice(0, 10);
  }, [record.currentExpiryDate]);

  const applyPreset = (days: number) => {
    const currentExpiry = new Date(record.currentExpiryDate);
    const today = new Date();
    const base = currentExpiry > today ? currentExpiry : today;
    setNewExpiryDate(toInputDate(addDays(base.toISOString(), days)));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    onExtend({
      orderId: record.orderId,
      newExpiryDate: new Date(`${newExpiryDate}T23:59:59`).toISOString(),
      reason: reason.trim() || "Complimentary access extension",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-[#C9A227]/30 bg-[#C9A227]/6 p-4"
    >
      <div className="flex items-center gap-2">
        <CalendarPlus size={15} className="text-[#C9A227]" />
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-300">
          Extend Access Expiry
        </h3>
      </div>

      <p className="text-xs leading-5 text-zinc-400">
        Extend this user&apos;s access without creating another payment record.
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[7, 30, 90, 365].map((days) => (
          <button
            key={days}
            type="button"
            onClick={() => applyPreset(days)}
            className="rounded-lg border border-white/10 bg-[#09090b] px-3 py-2 font-mono text-[10px] font-semibold text-zinc-300 hover:border-[#C9A227]/40 hover:text-[#C9A227]"
          >
            +{days === 365 ? "1 Year" : `${days} Days`}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            New Expiry Date
          </span>
          <input
            type="date"
            min={minimumDate}
            value={newExpiryDate}
            onChange={(event) => setNewExpiryDate(event.target.value)}
            className="w-full rounded-xl border border-white/15 bg-[#09090b] px-3 py-2.5 text-xs text-white outline-none focus:border-[#C9A227]"
          />
        </label>

        <label className="space-y-1.5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Reason
          </span>
          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason for extension"
            className="w-full rounded-xl border border-white/15 bg-[#09090b] px-3 py-2.5 text-xs text-white outline-none placeholder:text-zinc-500 focus:border-[#C9A227]"
          />
        </label>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] px-4 py-2.5 text-xs font-bold text-black hover:brightness-110"
      >
        Confirm Free Extension
      </button>
    </form>
  );
}
