"use client";

import { useEffect, useRef } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Copyright,
  CreditCard,
  FileText,
  Gavel,
  LockKeyhole,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { gsap } from "gsap";

const disclaimerSections = [
  {
    number: "01",
    title: "For Educational Use Only",
    icon: BookOpen,
    content: (
      <p>
        All information, training materials, and content provided by ATA are strictly for
        educational and informational purposes only. Nothing offered by ATA constitutes
        financial, investment, trading, or professional advice. Users are solely
        responsible for their trading and investment decisions and are encouraged to
        consult a licensed financial advisor before taking any action.
      </p>
    ),
  },
  {
    number: "02",
    title: "Risk Disclosure & No Performance Guarantees",
    icon: AlertTriangle,
    content: (
      <p>
        Trading and investing involve substantial risk, including the possible loss of
        capital. Past performance does not guarantee future results. ATA does not promise,
        guarantee, or imply any specific financial outcomes, profits, or success from the
        use of its educational content, strategies, or methodologies.
      </p>
    ),
  },
  {
    number: "03",
    title: "Intellectual Property Protection",
    icon: Copyright,
    content: (
      <p>
        All materials provided by ATA, including videos, documents, written content,
        graphics, and proprietary strategies, are protected by copyright and intellectual
        property laws. Unauthorized copying, sharing, resale, or distribution of any ATA
        content is strictly prohibited and may result in legal action.
      </p>
    ),
  },
  {
    number: "04",
    title: "Non-Transferable Access",
    icon: LockKeyhole,
    content: (
      <p>
        Access to ATA courses and materials is granted exclusively to the registered
        individual. Sharing, selling, transferring, or providing access to any third party
        is strictly prohibited. Violations may result in immediate termination of access
        without notice and without refund.
      </p>
    ),
  },
  {
    number: "05",
    title: "Limitation of Liability",
    icon: ShieldAlert,
    content: (
      <p>
        To the maximum extent permitted by law, ATA, its founders, instructors, employees,
        and affiliates shall not be liable for any direct, indirect, incidental, or
        consequential losses or damages arising from the use or misuse of the educational
        content. Users acknowledge that participation is entirely at their own risk.
      </p>
    ),
  },
  {
    number: "06",
    title: "Fraud & Impersonation Warning",
    icon: UserCheck,
    content: (
      <p>
        ATA will never request investments, personal financial details, or payments
        outside its official platforms. Any such requests should be considered fraudulent.
        Official communication will only be made through ATA’s verified channels.
      </p>
    ),
  },
  {
    number: "07",
    title: "Governing Law & Jurisdiction",
    icon: Gavel,
    content: (
      <p>
        By accessing ATA’s services or materials, users agree that these Terms shall be
        governed by and construed in accordance with the laws of India. Any disputes
        arising out of or in connection with ATA’s services shall be subject to the
        exclusive jurisdiction of the competent courts in India.
      </p>
    ),
  },
  {
    number: "08",
    title: "Subscription, Payment & No-Refund Policy",
    icon: CreditCard,
    content: (
      <div className="space-y-5">
        <p>
          All purchases made with ATA are final and non-refundable. No refunds will be
          issued under any circumstances, including but not limited to dissatisfaction,
          lack of usage, misunderstanding of content, or account termination due to policy
          violations.
        </p>

        <p>
          Subscriptions automatically renew unless canceled before the renewal date. By
          subscribing, users authorize ATA to charge the payment method on file for all
          applicable fees, including renewal fees. ATA reserves the right to modify
          pricing, features, or services at any time.
        </p>

        <p>
          Users remain responsible for all charges incurred before cancellation and for
          any applicable taxes related to their purchases.
        </p>
      </div>
    ),
  },
];

export default function DisclaimerPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const acknowledgementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      timeline.fromTo(
        headerRef.current,
        {
          opacity: 0,
          y: 24,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
        },
      );

      timeline.fromTo(
        ".disclaimer-card",
        {
          opacity: 0,
          y: 28,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
        },
        "-=0.25",
      );

      timeline.fromTo(
        acknowledgementRef.current,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
        },
        "-=0.2",
      );
    }, pageRef);

    return () => context.revert();
  }, []);

  return (
    <main ref={pageRef} className="min-h-screen overflow-hidden bg-[#09090b] text-white">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 -top-55 h-130 w-130 -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />

        <div className="absolute -bottom-45 -left-45 h-105 w-105 rounded-full bg-primary/5 blur-[110px]" />

        <div className="absolute -right-45 top-[40%] h-100 w-100 rounded-full bg-primary/4 blur-[110px]" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        {/* Header */}
        <header ref={headerRef} className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          {/* Eyebrow */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
            <FileText size={14} className="text-primary" />

            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              Important Information
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-black tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
            Legal <span className="text-primary">Disclaimer</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Please read the following information carefully before accessing or using
            Aegis Trading Academy&apos;s services, courses, and educational materials.
          </p>

          {/* Divider */}
          <div className="mx-auto mt-8 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-white/10" />

            <span className="h-1.5 w-1.5 rounded-full bg-primary" />

            <span className="h-px w-12 bg-white/10" />
          </div>
        </header>

        {/* Disclaimer Cards */}
        <section
          ref={sectionsRef}
          className="space-y-4"
          aria-label="Legal disclaimer sections"
        >
          {disclaimerSections.map((section) => {
            // const Icon = section.icon;

            return (
              <article
                key={section.number}
                // className={`disclaimer-card group relative overflow-hidden rounded-2xl border ${
                //   section.number === "08"
                //     ? "border-primary/20 bg-primary/[0.035]"
                //     : "border-white/8 bg-white/2.5"
                // } p-5 transition-all duration-300 hover:border-primary/20 hover:bg-white/4 sm:p-7`}
                className={`disclaimer-card relative overflow-hidden border-b border-white/20 ${
                  section.number === "08"
                    ? "border-primary/20 bg-white/2.5 rounded-2xl"
                    : ""
                } ${section.number === "07" ? "border-none" : ""} p-5 sm:p-7`}
              >
                {/* Subtle hover glow */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/5 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex flex-col gap-5 sm:flex-row sm:gap-7">
                  {/* Number */}
                  <div className="flex shrink-0 items-start gap-4 sm:block">
                    {/* <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/[0.035] text-xs font-black tracking-wider text-zinc-500 transition-colors duration-300 group-hover:border-primary/20 group-hover:text-primary sm:h-12 sm:w-12">
                      {section.number}
                    </div> */}

                    {/* Mobile separator */}
                    <div className="mt-5 h-px flex-1 bg-white/6 sm:hidden" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-4 flex items-start gap-3">
                      {/* <div className="mt-0.5 hidden shrink-0 text-primary sm:block">
                        <Icon size={19} strokeWidth={1.8} />
                      </div> */}

                      <div>
                        <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
                          {section.title}
                        </h2>

                        <div className="mt-1.5 h-px w-8 bg-primary/40 transition-all duration-300 group-hover:w-12" />
                      </div>
                    </div>

                    <div className="text-sm leading-7 text-zinc-400 sm:text-[15px] sm:leading-7">
                      {section.content}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Acknowledgement */}
        <div
          ref={acknowledgementRef}
          className="mt-8 rounded-2xl border border-primary/15 bg-primary/[0.035] p-6 sm:mt-10 sm:p-7"
        >
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
              <CheckCircle2 size={20} className="text-primary" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-white">Acknowledgement</h2>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                By accessing ATA&apos;s services, courses, or educational materials, you
                acknowledge that you have read, understood, and agreed to the information
                contained in this disclaimer.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center sm:mt-10">
          <p className="text-xs text-zinc-600">Aegis Trading Academy</p>
        </div>
      </div>
    </main>
  );
}
