import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ActiveMembershipCardProps {
  subscription: {
    id: string;
    status: string;
    currentExpiryDate: string;
    plan: {
      id: string;
      type: string;
      name: string;
      durationMonths: number;
    };
  };
}

export default function ActiveMembershipCard({
  subscription,
}: ActiveMembershipCardProps) {
  const expiryDate = new Date(subscription.currentExpiryDate).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <div className="w-full my-15 max-w-220 rounded-3xl border border-primary/30 bg-primary/5 p-8 text-center shadow-[0_20px_60px_rgba(212,175,55,0.08)] sm:p-12">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Check size={28} strokeWidth={3} />
      </div>

      <h3 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
        You&apos;re Already a Member 🎉
      </h3>

      <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
        Thank you for choosing Aegis Trading Academy. Your subscription is currently
        active, and you already have access to our complete learning experience.
      </p>

      <div className="mx-auto mb-8 max-w-md rounded-2xl border border-white/10 bg-black/20 p-6">
        <p className="mb-2 text-xs font-mono font-semibold uppercase tracking-widest text-primary">
          {subscription.plan.name}
        </p>

        <p className="text-sm text-zinc-400">Active until</p>

        <p className="mt-1 text-xl font-bold text-white">{expiryDate}</p>
      </div>

      <Link
        href="/courses"
        className="group inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-7 py-4 font-bold uppercase tracking-wider text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(212,175,55,0.25)]"
      >
        <span>Continue Learning</span>

        <ArrowRight
          size={18}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </Link>
    </div>
  );
}
