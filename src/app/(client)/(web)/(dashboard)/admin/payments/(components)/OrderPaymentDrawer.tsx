/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  Activity,
  CalendarClock,
  CreditCard,
  FileText,
  Mail,
  Phone,
  Receipt,
  UserRound,
  X,
} from "lucide-react";
// import type {
//   ExtensionRequest,
//   OrderPaymentEventType,
//   OrderPaymentRecord,
// } from "./types";
import type { ExtensionRequest, OrderPaymentRecord } from "./types";
import {
  eventTypeDot,
  eventTypeLabel,
  paymentMethodLabel,
  paymentStatusLabel,
} from "./format";
import { ExtendExpiryForm } from "./ExtendExpiryForm";
import { DiscordIcon } from "@/components/Icons";

interface OrderPaymentDrawerProps {
  record: OrderPaymentRecord | null;
  onClose: () => void;
  onExtend: (request: ExtensionRequest) => void;
}

const formatDate = (value: string, includeTime = false) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(new Date(value));

const formatCurrency = (value: number, currency: string = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(value);

// const eventDot: Record<OrderPaymentEventType, string> = {
//   order_created: "bg-zinc-400",
//   payment_completed: "bg-emerald-400",
//   payment_failed: "bg-rose-400",
//   expiry_extended: "bg-[#C9A227]",
//   refund_completed: "bg-sky-400",
//   note: "bg-violet-400",
// };

export function OrderPaymentDrawer({
  record,
  onClose,
  onExtend,
}: OrderPaymentDrawerProps) {
  if (!record) return null;

  const closeDrawer = () => onClose();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div onClick={closeDrawer} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

      <aside className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-[#050507]/95 p-5 shadow-[-10px_0_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
                Order & Payment Details
              </p>
              <h2 className="text-lg font-extrabold text-white">{record.orderId}</h2>
            </div>

            <button
              type="button"
              onClick={closeDrawer}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white"
              aria-label="Close drawer"
            >
              <X size={16} />
            </button>
          </div>

          <section className="rounded-2xl border border-white/10 bg-[#111113] p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#C9A227]/40 bg-[#C9A227]/15 text-[#C9A227]">
                <UserRound size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-white">{record.userName}</h3>
                <div className="mt-2 space-y-1 font-mono text-[11px] text-zinc-400">
                  <p className="flex items-center gap-2 break-all">
                    <Mail size={12} /> {record.userEmail}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={12} /> {record.userPhone}
                  </p>
                  <p className="flex items-center gap-2">
                    <DiscordIcon className="h-3.5" /> {record.discordName}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-2xl border border-[#C9A227]/30 bg-linear-to-b from-[#151518] to-[#0d0d0f] p-5">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#C9A227]/10 blur-[50px]" />
            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
                    Current Package
                  </p>
                  <h3 className="text-lg font-extrabold text-white">{record.plan}</h3>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold text-emerald-400">
                  {record.accessStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
                <InfoCard label="Purchase Date" value={formatDate(record.purchaseDate)} />
                <InfoCard
                  label="Original Expiry"
                  // value={formatDate(record.originalExpiryDate)}
                  value={
                    record.originalExpiryDate
                      ? formatDate(record.originalExpiryDate)
                      : "—"
                  }
                />
                <InfoCard
                  label="Current Expiry"
                  // value={formatDate(record.currentExpiryDate)}
                  value={
                    record.currentExpiryDate ? formatDate(record.currentExpiryDate) : "—"
                  }
                  highlighted
                />
              </div>
            </div>
          </section>

          <ExtendExpiryForm record={record} onExtend={onExtend} />

          <section className="space-y-3">
            <SectionTitle icon={CreditCard} title="Payment Information" />
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-[#09090b] p-4 sm:grid-cols-2">
              <Detail label="Amount" value={formatCurrency(record.amount, record.currency)} accent />
              <Detail
                label="Payment Status"
                value={paymentStatusLabel[record.paymentStatus]}
              />
              <Detail
                label="Payment Method"
                value={
                  record.paymentMethod ? paymentMethodLabel[record.paymentMethod] : "—"
                }
              />
              <Detail label="Payment Gateway" value={record.paymentGateway ?? "—"} />
              <Detail label="Transaction ID" value={record.transactionId} />
              <Detail label="Gateway Payment ID" value={record.gatewayPaymentId ?? "—"} />
            </div>
          </section>

          <section className="space-y-3">
            <SectionTitle icon={Receipt} title="Invoice & Receipt" />
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-[#09090b] p-4 sm:grid-cols-2">
              <Detail
                label="Invoice Number"
                value={record.invoiceNumber ?? "Not generated"}
              />
              <Detail label="Paid At" value={formatDate(record.purchaseDate, true)} />
            </div>
          </section>

          {record.extensions.length > 0 && (
            <section className="space-y-3">
              <SectionTitle icon={CalendarClock} title="Extension History" />
              <div className="space-y-3 rounded-2xl border border-white/10 bg-[#09090b] p-4">
                {record.extensions.map((extension) => (
                  <article
                    key={extension.id}
                    className="rounded-xl border border-white/10 bg-[#111113] p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-bold text-white">
                        +{extension.extensionDays} Days
                      </p>
                      <p className="font-mono text-[10px] text-zinc-500">
                        {formatDate(extension.extendedAt, true)}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                      {formatDate(extension.previousExpiryDate)} →{" "}
                      {formatDate(extension.newExpiryDate)}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-zinc-500">
                      {extension.reason} · {extension.extendedBy}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <SectionTitle icon={Activity} title="Activity Timeline" />
            <div className="relative space-y-4 rounded-2xl border border-white/10 bg-[#09090b] p-4 pl-8 before:absolute before:bottom-5 before:left-4.75 before:top-5 before:w-px before:bg-white/10">
              {record.timeline.map((event) => (
                <article key={event.id} className="relative">
                  <span
                    // className={`absolute -left-5.25 top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-[#09090b] ${eventDot[event.type]}`}
                    className={`absolute -left-5.25 top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-[#09090b] ${eventTypeDot[event.type]}`}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white">{event.title}</h4>
                    <time className="font-mono text-[10px] text-zinc-500">
                      {formatDate(event.createdAt, true)}
                    </time>
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-zinc-400">
                    {event.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <SectionTitle icon={FileText} title="Admin Notes" />
            <div className="rounded-2xl border border-white/10 bg-[#09090b] p-4 text-xs leading-5 text-zinc-400">
              {record.adminNotes || "No internal notes added."}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function InfoCard({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 text-center ${
        highlighted
          ? "border-[#C9A227]/30 bg-[#C9A227]/10"
          : "border-white/5 bg-[#09090b]/80"
      }`}
    >
      <p className="font-mono text-[10px] uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-xs font-bold text-white">{value}</p>
    </div>
  );
}

function Detail({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p
        className={`mt-1 break-all text-xs font-semibold ${
          accent ? "text-[#C9A227]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={15} className="text-[#C9A227]" />
      <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-300">
        {title}
      </h3>
    </div>
  );
}
