"use client";

import { useState, useEffect, useRef, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  Loader2,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { gsap } from "gsap";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (initialEmail && !email) {
      setEmail(initialEmail);
    }
  }, [initialEmail, email]);

  // GSAP Entrance Animation
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 25, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];

    // Handle pasted full 6-digit code
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || "";
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fullCode = otpDigits.join("");

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      toast.error("Email address is required.");
      return;
    }

    if (fullCode.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    if (!newPassword) {
      toast.error("New password is required.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: fullCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMsg(data.error || "Password reset failed. Please check your code and try again.");
        toast.error(data.error || "Password reset failed");
        return;
      }

      toast.success("Password reset successfully! Please log in with your new password.");
      router.replace("/login");
    } catch {
      setErrorMsg("Something went wrong. Please check your connection and try again.");
      toast.error("Password reset failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      ref={cardRef}
      className="w-full max-w-md rounded-2xl bg-[#111113]/90 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden"
    >
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12]" />

      {/* Header */}
      <div className="text-center mb-6">
        <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] shadow-[0_0_20px_rgba(201,162,39,0.2)]">
          <ShieldAlert size={24} />
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight font-sans">
          Reset Your Password
        </h1>

        <p className="text-xs text-zinc-400 mt-1 font-sans">
          Enter the 6-digit code sent to your email and your new password.
        </p>

        {email ? (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#09090b] border border-white/10 text-xs font-mono text-[#C9A227]">
            <Mail size={13} />
            <span className="font-semibold">{email}</span>
          </div>
        ) : (
          <div className="mt-3 space-y-1 text-left">
            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@example.com"
              className="w-full rounded-xl bg-[#09090b] border border-white/15 py-2 px-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#C9A227]"
            />
          </div>
        )}
      </div>

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-sans flex items-start gap-2.5">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleReset} className="space-y-5">
        {/* 6-Digit OTP Inputs */}
        <div className="space-y-2">
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 text-center">
            6-Digit Reset Code
          </label>

          <div className="flex items-center justify-center gap-2 sm:gap-2.5">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-mono font-bold rounded-xl bg-[#09090b] border outline-none transition-all duration-200 ${
                  digit
                    ? "border-[#C9A227] text-[#C9A227] bg-[#C9A227]/10 shadow-[0_0_10px_rgba(201,162,39,0.2)]"
                    : "border-white/15 text-white focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
            New Password
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 h-4 w-4 text-zinc-500" />
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-xl bg-[#09090b] border border-white/15 py-3 pl-10 pr-11 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
            Confirm New Password
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 h-4 w-4 text-zinc-500" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="w-full rounded-xl bg-[#09090b] border border-white/15 py-3 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || fullCode.length !== 6 || !newPassword}
          className="w-full py-3 px-4 rounded-xl text-xs font-bold font-sans tracking-wider bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] text-black shadow-[0_0_25px_rgba(201,162,39,0.3)] hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-black" />
              <span>Resetting Password...</span>
            </>
          ) : (
            <>
              <span>Reset Password</span>
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

export default function ResetPasswordPage() {
  return (
    <main className="relative min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 overflow-hidden selection:bg-[#C9A227]/30">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 rounded-2xl bg-[#111113] border border-white/10 text-center font-mono text-xs text-zinc-400">
            Loading reset page...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
