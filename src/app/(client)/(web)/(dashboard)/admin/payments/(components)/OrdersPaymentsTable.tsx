// "use client";

// import { useMemo, useState } from "react";
// import { Eye, Filter, Search, Mail, Phone } from "lucide-react";
// // import type {
// //   AccessStatus,
// //   OrderPaymentRecord,
// //   PaymentStatus,
// //   SubscriptionPlan,
// // } from "./types";
// import type {
//   AccessStatus,
//   OrderPaymentRecord,
//   PaymentStatus,
//   SubscriptionPlan,
// } from "./types";
// import { paymentStatusBadge, paymentStatusLabel } from "./format";
// import { DiscordIcon } from "@/components/Icons";

// interface OrdersPaymentsTableProps {
//   records: OrderPaymentRecord[];
//   onSelect: (record: OrderPaymentRecord) => void;
// }

// const formatDate = (value: string) =>
//   new Intl.DateTimeFormat("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   }).format(new Date(value));

// const formatCurrency = (value: number) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(value);

// const getRemainingDays = (expiryDate: string) => {
//   const difference = new Date(expiryDate).getTime() - Date.now();
//   return Math.max(0, Math.ceil(difference / 86_400_000));
// };

// // const paymentBadge: Record<PaymentStatus, string> = {
// //   Paid: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
// //   Pending: "border-amber-500/30 bg-amber-500/15 text-amber-400",
// //   Failed: "border-rose-500/30 bg-rose-500/15 text-rose-400",
// //   Refunded: "border-sky-500/30 bg-sky-500/15 text-sky-400",
// // };

// const accessBadge: Record<AccessStatus, string> = {
//   Active: "text-emerald-400",
//   "Expiring Soon": "text-amber-400",
//   Expired: "text-zinc-500",
//   Cancelled: "text-rose-400",
// };

// export function OrdersPaymentsTable({ records, onSelect }: OrdersPaymentsTableProps) {
//   const [search, setSearch] = useState("");
//   const [plan, setPlan] = useState<"ALL" | SubscriptionPlan>("ALL");
//   const [paymentStatus, setPaymentStatus] = useState<"ALL" | PaymentStatus>("ALL");

//   const filteredRecords = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     return records
//       .filter((record) => {
//         const matchesSearch =
//           !query ||
//           record.userName.toLowerCase().includes(query) ||
//           record.userEmail.toLowerCase().includes(query) ||
//           record.orderId.toLowerCase().includes(query) ||
//           record.transactionId.toLowerCase().includes(query);

//         const matchesPlan = plan === "ALL" || record.plan === plan;
//         const matchesPayment =
//           paymentStatus === "ALL" || record.paymentStatus === paymentStatus;

//         return matchesSearch && matchesPlan && matchesPayment;
//       })
//       .sort(
//         (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
//       );
//   }, [records, search, plan, paymentStatus]);

//   return (
//     <section className="space-y-4">
//       <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#111113]/90 p-4 md:flex-row md:items-center">
//         <div className="relative flex-1">
//           <Search
//             size={16}
//             className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
//           />
//           <input
//             value={search}
//             onChange={(event) => setSearch(event.target.value)}
//             placeholder="Search user, email, order ID or transaction ID..."
//             className="w-full rounded-xl border border-white/15 bg-[#09090b] py-2.5 pl-10 pr-4 text-xs text-white outline-none placeholder:text-zinc-500 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
//           />
//         </div>

//         <div className="flex flex-wrap gap-3">
//           <label className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#09090b] px-3 py-2">
//             <Filter size={13} className="text-[#C9A227]" />
//             <select
//               value={plan}
//               onChange={(event) =>
//                 setPlan(event.target.value as "ALL" | SubscriptionPlan)
//               }
//               className="bg-transparent text-xs text-white outline-none"
//             >
//               <option value="ALL" className="bg-[#111113]">
//                 All Packages
//               </option>
//               <option value="Monthly Subscription" className="bg-[#111113]">
//                 Monthly Subscription
//               </option>
//               <option value="Yearly Subscription" className="bg-[#111113]">
//                 Yearly Subscription
//               </option>
//             </select>
//           </label>

//           <select
//             value={paymentStatus}
//             onChange={(event) =>
//               setPaymentStatus(event.target.value as "ALL" | PaymentStatus)
//             }
//             className="rounded-xl border border-white/15 bg-[#09090b] px-3 py-2 text-xs text-white outline-none"
//           >
//             <option value="ALL" className="bg-[#111113]">
//               All Payment Statuses
//             </option>

//             {/* <option value="Paid" className="bg-[#111113]">
//               Paid
//             </option>
//             <option value="Pending" className="bg-[#111113]">
//               Pending
//             </option>
//             <option value="Failed" className="bg-[#111113]">
//               Failed
//             </option>
//             <option value="Refunded" className="bg-[#111113]">
//               Refunded
//             </option> */}

//             <option value="PAID" className="bg-[#111113]">
//               Paid
//             </option>
//             <option value="CAPTURED" className="bg-[#111113]">
//               Captured
//             </option>
//             <option value="PENDING" className="bg-[#111113]">
//               Pending
//             </option>
//             <option value="AUTHORIZED" className="bg-[#111113]">
//               Authorized
//             </option>
//             <option value="FAILED" className="bg-[#111113]">
//               Failed
//             </option>
//             <option value="CANCELLED" className="bg-[#111113]">
//               Cancelled
//             </option>
//             <option value="REFUNDED" className="bg-[#111113]">
//               Refunded
//             </option>
//             <option value="PARTIALLY_REFUNDED" className="bg-[#111113]">
//               Partially Refunded
//             </option>
//           </select>
//         </div>
//       </div>

//       <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111113]/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
//         <div className="hidden overflow-x-auto md:block">
//           <table className="w-full border-collapse text-left">
//             <thead>
//               <tr className="border-b border-white/10 text-nowrap bg-[#09090b]/80 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
//                 <th className="px-4 py-3.5">User</th>
//                 <th className="px-4 py-3.5">Discord</th>
//                 <th className="px-4 py-3.5">Contact Details</th>
//                 <th className="px-4 py-3.5">Order ID</th>
//                 <th className="px-4 py-3.5">Package</th>
//                 <th className="px-4 py-3.5">Amount</th>
//                 <th className="px-4 py-3.5">Purchase</th>
//                 <th className="px-4 py-3.5">Expiry</th>
//                 <th className="px-4 py-3.5">Remaining</th>
//                 <th className="px-4 py-3.5">Payment</th>
//                 <th className="px-4 py-3.5 text-right">Action</th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
//               {filteredRecords.map((record) => {
//                 const initials = record.userName
//                   .split(" ")
//                   .map((part) => part[0])
//                   .join("")
//                   .slice(0, 2)
//                   .toUpperCase();

//                 return (
//                   <tr
//                     key={record.id}
//                     onClick={() => onSelect(record)}
//                     className="group cursor-pointer hover:bg-white/4"
//                   >
//                     <td className="px-4 py-3.5">
//                       <div className="flex items-center gap-3">
//                         <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#C9A227]/30 bg-[#C9A227]/15 font-bold text-[#C9A227]">
//                           {initials}
//                         </div>
//                         <div>
//                           <p className="font-bold text-white group-hover:text-[#C9A227]">
//                             {record.userName}
//                           </p>
//                           <p className="font-mono text-[10px] text-zinc-500">
//                             {record.id}
//                           </p>
//                         </div>
//                       </div>
//                     </td>

//                     {/* Discord name */}
//                     <td className="py-3.5 px-4">
//                       <div className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[11px] text-zinc-400">
//                         <DiscordIcon className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
//                         <span className="py-3.5 font-mono text-[11px] text-zinc-400">
//                           {record.discordName}
//                         </span>
//                       </div>
//                     </td>

//                     {/* Contact Details */}
//                     <td className="py-3.5 px-4">
//                       <div className="flex flex-col gap-0.5 font-mono text-[11px]">
//                         <span className="flex items-center gap-1 text-zinc-300">
//                           <Mail size={11} className="text-zinc-500" />
//                           {record.userEmail}
//                         </span>
//                         <span className="flex items-center gap-1 text-zinc-400">
//                           <Phone size={11} className="text-zinc-500" />
//                           {record.userPhone}
//                         </span>
//                       </div>
//                     </td>

//                     <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-400">
//                       {record.orderId}
//                     </td>
//                     <td className="px-4 py-3.5">
//                       <span className="rounded-lg border border-[#C9A227]/30 bg-[#C9A227]/10 px-2.5 py-1 font-mono text-[10px] font-bold text-[#C9A227]">
//                         {record.plan === "Monthly Subscription" ? "Monthly" : "Yearly"}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3.5 font-bold text-white">
//                       {formatCurrency(record.amount)}
//                     </td>
//                     <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-400">
//                       {formatDate(record.purchaseDate)}
//                     </td>
//                     <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-300">
//                       {formatDate(record.currentExpiryDate)}
//                     </td>
//                     <td
//                       className={`px-4 py-3.5 font-mono text-[11px] font-bold ${accessBadge[record.accessStatus]}`}
//                     >
//                       {getRemainingDays(record.currentExpiryDate)} Days
//                     </td>
//                     <td className="px-4 py-3.5">
//                       <span
//                         // className={`inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold ${paymentBadge[record.paymentStatus]}`}
//                         className={`inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold ${paymentStatusBadge[record.paymentStatus]}`}
//                       >
//                         {/* {record.paymentStatus} */}
//                         {paymentStatusLabel[record.paymentStatus]}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3.5 text-right">
//                       <button
//                         type="button"
//                         onClick={(event) => {
//                           event.stopPropagation();
//                           onSelect(record);
//                         }}
//                         className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:border-[#C9A227]/40 hover:bg-[#C9A227]/10 hover:text-[#C9A227]"
//                         aria-label={`View ${record.orderId}`}
//                       >
//                         <Eye size={14} />
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         <div className="divide-y divide-white/5 md:hidden">
//           {filteredRecords.map((record) => (
//             <button
//               key={record.id}
//               type="button"
//               onClick={() => onSelect(record)}
//               className="block w-full space-y-3 p-4 text-left hover:bg-white/3"
//             >
//               <div className="flex items-start justify-between gap-3">
//                 <div>
//                   <p className="text-sm font-bold text-white">{record.userName}</p>
//                   <p className="font-mono text-[10px] text-zinc-500">{record.orderId}</p>
//                 </div>
//                 <span
//                   // className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${paymentBadge[record.paymentStatus]}`}
//                   className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${paymentStatusBadge[record.paymentStatus]}`}
//                 >
//                   {/* {record.paymentStatus} */}
//                   {paymentStatusLabel[record.paymentStatus]}
//                 </span>
//               </div>

//               <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-3 font-mono text-[10px]">
//                 <div>
//                   <span className="block text-zinc-500">PACKAGE</span>
//                   <span className="text-white">
//                     {record.plan === "Monthly Subscription" ? "Monthly" : "Yearly"}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="block text-zinc-500">AMOUNT</span>
//                   <span className="text-[#C9A227]">{formatCurrency(record.amount)}</span>
//                 </div>
//                 <div>
//                   <span className="block text-zinc-500">EXPIRY</span>
//                   <span className="text-white">
//                     {formatDate(record.currentExpiryDate)}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="block text-zinc-500">REMAINING</span>
//                   <span className={accessBadge[record.accessStatus]}>
//                     {getRemainingDays(record.currentExpiryDate)} Days
//                   </span>
//                 </div>
//               </div>
//             </button>
//           ))}
//         </div>

//         {filteredRecords.length === 0 && (
//           <div className="p-10 text-center font-mono text-xs text-zinc-500">
//             No payment records match the selected filters.
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }

"use client";

import { useMemo, useState } from "react";
import { Eye, Filter, Search, Mail, Phone } from "lucide-react";
import type {
  AccessStatus,
  OrderPaymentRecord,
  PaymentStatus,
  SubscriptionPlan,
} from "./types";
import { paymentStatusBadge, paymentStatusLabel } from "./format";
import { DiscordIcon } from "@/components/Icons";

interface OrdersPaymentsTableProps {
  records: OrderPaymentRecord[];
  onSelect: (record: OrderPaymentRecord) => void;
}

const formatDate = (value: string | null) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const getRemainingDays = (expiryDate: string | null) => {
  if (!expiryDate) return 0;

  const expiry = new Date(expiryDate);

  if (Number.isNaN(expiry.getTime())) {
    return 0;
  }

  const difference = expiry.getTime() - Date.now();

  return Math.max(0, Math.ceil(difference / 86_400_000));
};

const accessBadge: Record<AccessStatus, string> = {
  Active: "text-emerald-400",
  "Expiring Soon": "text-amber-400",
  Expired: "text-zinc-500",
  Cancelled: "text-rose-400",
};

export function OrdersPaymentsTable({ records, onSelect }: OrdersPaymentsTableProps) {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState<"ALL" | SubscriptionPlan>("ALL");
  const [paymentStatus, setPaymentStatus] = useState<"ALL" | PaymentStatus>("ALL");

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records
      .filter((record) => {
        const matchesSearch =
          !query ||
          record.userName.toLowerCase().includes(query) ||
          record.userEmail.toLowerCase().includes(query) ||
          record.orderId.toLowerCase().includes(query) ||
          record.transactionId.toLowerCase().includes(query);

        const matchesPlan = plan === "ALL" || record.plan === plan;

        const matchesPayment =
          paymentStatus === "ALL" || record.paymentStatus === paymentStatus;

        return matchesSearch && matchesPlan && matchesPayment;
      })
      .sort(
        (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
      );
  }, [records, search, plan, paymentStatus]);

  return (
    <section className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#111113]/90 p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search user, email, order ID or transaction ID..."
            className="w-full rounded-xl border border-white/15 bg-[#09090b] py-2.5 pl-10 pr-4 text-xs text-white outline-none placeholder:text-zinc-500 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Package Filter */}
          <label className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#09090b] px-3 py-2">
            <Filter size={13} className="text-[#C9A227]" />

            <select
              value={plan}
              onChange={(event) =>
                setPlan(event.target.value as "ALL" | SubscriptionPlan)
              }
              className="bg-transparent text-xs text-white outline-none"
            >
              <option value="ALL" className="bg-[#111113]">
                All Packages
              </option>

              <option value="Monthly Subscription" className="bg-[#111113]">
                Monthly Subscription
              </option>

              <option value="Yearly Subscription" className="bg-[#111113]">
                Yearly Subscription
              </option>
            </select>
          </label>

          {/* Payment Status Filter */}
          <select
            value={paymentStatus}
            onChange={(event) =>
              setPaymentStatus(event.target.value as "ALL" | PaymentStatus)
            }
            className="rounded-xl border border-white/15 bg-[#09090b] px-3 py-2 text-xs text-white outline-none"
          >
            <option value="ALL" className="bg-[#111113]">
              All Payment Statuses
            </option>

            <option value="PAID" className="bg-[#111113]">
              Paid
            </option>

            <option value="CAPTURED" className="bg-[#111113]">
              Captured
            </option>

            <option value="PENDING" className="bg-[#111113]">
              Pending
            </option>

            <option value="AUTHORIZED" className="bg-[#111113]">
              Authorized
            </option>

            <option value="FAILED" className="bg-[#111113]">
              Failed
            </option>

            <option value="CANCELLED" className="bg-[#111113]">
              Cancelled
            </option>

            <option value="REFUNDED" className="bg-[#111113]">
              Refunded
            </option>

            <option value="PARTIALLY_REFUNDED" className="bg-[#111113]">
              Partially Refunded
            </option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111113]/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        {/* Desktop */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="text-nowrap border-b border-white/10 bg-[#09090b]/80 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                <th className="px-4 py-3.5">User</th>
                <th className="px-4 py-3.5">Discord</th>
                <th className="px-4 py-3.5">Contact Details</th>
                <th className="px-4 py-3.5">Order ID</th>
                <th className="px-4 py-3.5">Package</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Purchase</th>
                <th className="px-4 py-3.5">Expiry</th>
                <th className="px-4 py-3.5">Remaining</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
              {filteredRecords.map((record) => {
                const initials = record.userName
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <tr
                    key={record.id}
                    onClick={() => onSelect(record)}
                    className="group cursor-pointer hover:bg-white/4"
                  >
                    {/* User */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#C9A227]/30 bg-[#C9A227]/15 font-bold text-[#C9A227]">
                          {initials}
                        </div>

                        <div>
                          <p className="font-bold text-white group-hover:text-[#C9A227]">
                            {record.userName}
                          </p>

                          <p className="font-mono text-[10px] text-zinc-500">
                            {record.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Discord */}
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[11px] text-zinc-400">
                        <DiscordIcon className="h-3.5 w-3.5 shrink-0 text-zinc-500" />

                        <span>{record.discordName}</span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5 font-mono text-[11px]">
                        <span className="flex items-center gap-1 text-zinc-300">
                          <Mail size={11} className="text-zinc-500" />

                          {record.userEmail}
                        </span>

                        <span className="flex items-center gap-1 text-zinc-400">
                          <Phone size={11} className="text-zinc-500" />

                          {record.userPhone}
                        </span>
                      </div>
                    </td>

                    {/* Order ID */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-400">
                      {record.orderId}
                    </td>

                    {/* Package */}
                    <td className="px-4 py-3.5">
                      <span className="rounded-lg border border-[#C9A227]/30 bg-[#C9A227]/10 px-2.5 py-1 font-mono text-[10px] font-bold text-[#C9A227]">
                        {record.plan === "Monthly Subscription" ? "Monthly" : "Yearly"}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5 font-bold text-white">
                      {formatCurrency(record.amount)}
                    </td>

                    {/* Purchase */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-400">
                      {formatDate(record.purchaseDate)}
                    </td>

                    {/* Expiry */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-300">
                      {formatDate(record.currentExpiryDate)}
                    </td>

                    {/* Remaining */}
                    <td
                      className={`px-4 py-3.5 font-mono text-[11px] font-bold ${
                        accessBadge[record.accessStatus]
                      }`}
                    >
                      {record.currentExpiryDate
                        ? `${getRemainingDays(record.currentExpiryDate)} Days`
                        : "—"}
                    </td>

                    {/* Payment Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold ${
                          paymentStatusBadge[record.paymentStatus]
                        }`}
                      >
                        {paymentStatusLabel[record.paymentStatus]}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelect(record);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:border-[#C9A227]/40 hover:bg-[#C9A227]/10 hover:text-[#C9A227]"
                        aria-label={`View ${record.orderId}`}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="divide-y divide-white/5 md:hidden">
          {filteredRecords.map((record) => (
            <button
              key={record.id}
              type="button"
              onClick={() => onSelect(record)}
              className="block w-full space-y-3 p-4 text-left hover:bg-white/3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-white">{record.userName}</p>

                  <p className="font-mono text-[10px] text-zinc-500">{record.orderId}</p>
                </div>

                <span
                  className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${
                    paymentStatusBadge[record.paymentStatus]
                  }`}
                >
                  {paymentStatusLabel[record.paymentStatus]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-3 font-mono text-[10px]">
                {/* Package */}
                <div>
                  <span className="block text-zinc-500">PACKAGE</span>

                  <span className="text-white">
                    {record.plan === "Monthly Subscription" ? "Monthly" : "Yearly"}
                  </span>
                </div>

                {/* Amount */}
                <div>
                  <span className="block text-zinc-500">AMOUNT</span>

                  <span className="text-[#C9A227]">{formatCurrency(record.amount)}</span>
                </div>

                {/* Expiry */}
                <div>
                  <span className="block text-zinc-500">EXPIRY</span>

                  <span className="text-white">
                    {formatDate(record.currentExpiryDate)}
                  </span>
                </div>

                {/* Remaining */}
                <div>
                  <span className="block text-zinc-500">REMAINING</span>

                  <span className={accessBadge[record.accessStatus]}>
                    {record.currentExpiryDate
                      ? `${getRemainingDays(record.currentExpiryDate)} Days`
                      : "—"}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredRecords.length === 0 && (
          <div className="p-10 text-center font-mono text-xs text-zinc-500">
            No payment records match the selected filters.
          </div>
        )}
      </div>
    </section>
  );
}
