"use client";

import { FormEvent, useEffect, useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, ArrowRight, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { gsap } from "gsap";

function ForgotPasswordForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance Animation
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 25, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" },
      );
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Email address is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setSuccessMsg(null);

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || "Failed to process request");
        return;
      }

      setSuccessMsg(data.message);
      toast.success("Password reset code sent!");

      // Navigate to reset password page after 1.5 seconds
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
      }, 1500);
    } catch {
      toast.error("Something went wrong. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      ref={cardRef}
      className="w-full max-w-md rounded-2xl bg-[#111113]/90 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden"
    >
      {/* Top Accent Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12]" />

      {/* Header */}
      <div className="text-center mb-6">
        <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] shadow-[0_0_20px_rgba(201,162,39,0.2)]">
          <KeyRound size={24} />
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight font-sans">
          Forgot Password?
        </h1>

        <p className="text-xs text-zinc-400 mt-1 font-sans leading-relaxed">
          Enter your registered email address to receive a 6-digit verification code to reset your password.
        </p>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-sans flex items-start gap-2.5">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
          <span className="leading-snug">{successMsg} Redirecting to reset page...</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 h-4 w-4 text-zinc-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              className="w-full rounded-xl bg-[#09090b] border border-white/15 py-3 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
              autoComplete="email"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !!successMsg}
          className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold font-sans tracking-wider bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] text-black shadow-[0_0_25px_rgba(201,162,39,0.3)] hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-black" />
              <span>Sending Code...</span>
            </>
          ) : (
            <>
              <span>Send Reset Code</span>
              <ArrowRight size={14} className="stroke-3" />
            </>
          )}
        </button>
      </form>

      {/* Back to Login */}
      <div className="mt-6 pt-4 border-t border-white/10 text-center">
        <Link
          href="/login"
          className="text-xs font-mono text-zinc-400 hover:text-[#C9A227] transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={13} />
          <span>Back to Student Login</span>
        </Link>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <main className="relative min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 overflow-hidden selection:bg-[#C9A227]/30">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 rounded-2xl bg-[#111113] border border-white/10 text-center font-mono text-xs text-zinc-400">
            Loading...
          </div>
        }
      >
        <ForgotPasswordForm />
      </Suspense>
    </main>
  );
}
