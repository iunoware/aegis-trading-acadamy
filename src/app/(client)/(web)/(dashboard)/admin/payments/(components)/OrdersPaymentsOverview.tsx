// "use client";

// import {
//   BadgeIndianRupee,
//   CalendarClock,
//   CheckCircle2,
//   Clock3,
//   XCircle,
// } from "lucide-react";
// import type { OrderPaymentRecord } from "./types";

// interface OrdersPaymentsOverviewProps {
//   records: OrderPaymentRecord[];
// }

// const formatCurrency = (value: number) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(value);

// export function OrdersPaymentsOverview({
//   records,
// }: OrdersPaymentsOverviewProps) {
//   const paidRecords = records.filter((record) => record.paymentStatus === "Paid");
//   const totalRevenue = paidRecords.reduce((sum, record) => sum + record.amount, 0);
//   const pendingCount = records.filter((record) => record.paymentStatus === "Pending").length;
//   const failedCount = records.filter((record) => record.paymentStatus === "Failed").length;
//   const expiringCount = records.filter(
//     (record) => record.accessStatus === "Expiring Soon",
//   ).length;

//   const cards = [
//     {
//       title: "Total Revenue",
//       value: formatCurrency(totalRevenue),
//       description: "Successful payments only",
//       icon: BadgeIndianRupee,
//     },
//     {
//       title: "Successful Payments",
//       value: paidRecords.length.toString(),
//       description: "Completed transactions",
//       icon: CheckCircle2,
//     },
//     {
//       title: "Pending Payments",
//       value: pendingCount.toString(),
//       description: "Awaiting confirmation",
//       icon: Clock3,
//     },
//     {
//       title: "Failed Payments",
//       value: failedCount.toString(),
//       description: "Requires review",
//       icon: XCircle,
//     },
//     {
//       title: "Expiring Soon",
//       value: expiringCount.toString(),
//       description: "Access expires within 7 days",
//       icon: CalendarClock,
//     },
//   ];

//   return (
//     <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
//       {cards.map((card) => {
//         const Icon = card.icon;

//         return (
//           <article
//             key={card.title}
//             className="rounded-2xl border border-white/10 bg-[#111113]/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:border-[#C9A227]/40 hover:bg-[#151518]"
//           >
//             <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-[#C9A227]/30 bg-[#C9A227]/10 text-[#C9A227]">
//               <Icon size={17} />
//             </div>

//             <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-zinc-400">
//               {card.title}
//             </p>
//             <p className="mt-1 text-2xl font-extrabold tracking-tight text-white">
//               {card.value}
//             </p>
//             <p className="mt-3 border-t border-white/5 pt-2 font-mono text-[10px] text-zinc-500">
//               {card.description}
//             </p>
//           </article>
//         );
//       })}
//     </section>
//   );
// }

"use client";

import {
  BadgeIndianRupee,
  CalendarClock,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";
import type { OrderPaymentRecord } from "./types";

interface OrdersPaymentsOverviewProps {
  records: OrderPaymentRecord[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export function OrdersPaymentsOverview({ records }: OrdersPaymentsOverviewProps) {
  const paidRecords = records.filter((record) => record.paymentStatus === "PAID");

  const totalRevenue = paidRecords.reduce((sum, record) => sum + record.amount, 0);

  const pendingCount = records.filter(
    (record) => record.paymentStatus === "PENDING",
  ).length;

  const failedCount = records.filter(
    (record) => record.paymentStatus === "FAILED",
  ).length;

  const expiringCount = records.filter(
    (record) => record.accessStatus === "Expiring Soon",
  ).length;

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      description: "Successful payments only",
      icon: BadgeIndianRupee,
    },
    {
      title: "Successful Payments",
      value: paidRecords.length.toString(),
      description: "Completed transactions",
      icon: CheckCircle2,
    },
    {
      title: "Pending Payments",
      value: pendingCount.toString(),
      description: "Awaiting confirmation",
      icon: Clock3,
    },
    {
      title: "Failed Payments",
      value: failedCount.toString(),
      description: "Requires review",
      icon: XCircle,
    },
    {
      title: "Expiring Soon",
      value: expiringCount.toString(),
      description: "Access expires within 7 days",
      icon: CalendarClock,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.title}
            className="rounded-2xl border border-white/10 bg-[#111113]/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:border-[#C9A227]/40 hover:bg-[#151518]"
          >
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-[#C9A227]/30 bg-[#C9A227]/10 text-[#C9A227]">
              <Icon size={17} />
            </div>

            <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-zinc-400">
              {card.title}
            </p>

            <p className="mt-1 text-2xl font-extrabold tracking-tight text-white">
              {card.value}
            </p>

            <p className="mt-3 border-t border-white/5 pt-2 font-mono text-[10px] text-zinc-500">
              {card.description}
            </p>
          </article>
        );
      })}
    </section>
  );
}
