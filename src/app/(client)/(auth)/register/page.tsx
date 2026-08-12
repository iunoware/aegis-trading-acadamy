"use client";

import { FormEvent, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  Phone,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [discordName, setDiscordName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance Animations
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

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error("Full name, email, and password are required");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          discordName,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      toast.success(data.message || "Account created! Please verify your email.");
      router.replace(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch {
      toast.error("Something went wrong with registration");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-[#050505] text-white flex items-center justify-center overflow-hidden selection:bg-[#C9A227]/30 py-8 sm:py-12">
      {/* Decorative Radial Glows */}
      {/* <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#C9A227]/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#C9A227]/5 blur-[120px] pointer-events-none rounded-full" /> */}

      {/* Grid Pattern */}
      {/* <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" /> */}

      {/* Decorative Chart SVG */}
      {/* <div className="absolute inset-0 pointer-events-none opacity-25">
        <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
          <path
            d="M0,700 Q350,600 550,400 T1050,250 T1200,150"
            stroke="#C9A227"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
        </svg>
      </div> */}

      {/* Content Container (Two-column Desktop Layout) */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Aegis Branding & Value Proposition (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 pr-4">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 text-[11px] font-mono font-bold tracking-widest text-[#C9A227] uppercase w-fit">
            <ShieldCheck size={13} />
            JOIN THE ELITE ACADEMY
          </div> */}

          <div className="flex items-center gap-4">
            {/* <div className="relative w-14 h-14 rounded-2xl bg-black/80 border border-[#C9A227]/40 flex items-center justify-center p-2.5 shadow-[0_0_25px_rgba(201,162,39,0.25)] shrink-0">
              <Image
                src="/images/logo.png"
                alt="Aegis Logo"
                width={44}
                height={44}
                className="object-contain"
              />
            </div> */}
            <div>
              <h1 className="text-3xl font-black text-white font-sans tracking-tight leading-none">
                Create Account
              </h1>
              <span className="text-xs font-mono text-[#C9A227] font-semibold tracking-wider block mt-1">
                Aegis Trading Academy
              </span>
            </div>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed font-sans">
            Start your professional trading journey. Gain immediate access to
            institutional order flow strategies, risk management tools, and
            private community insights.
          </p>

          {/* Membership Benefits List */}
          {/* <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-300">
              <CheckCircle2 size={16} className="text-[#C9A227] shrink-0" />
              <span>Full Access to All Trading Strategy Modules</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-300">
              <CheckCircle2 size={16} className="text-[#C9A227] shrink-0" />
              <span>Exclusive Discord Community Membership</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-300">
              <CheckCircle2 size={16} className="text-[#C9A227] shrink-0" />
              <span>Weekly Live Market Q&A & Scalping Sessions</span>
            </div>
          </div> */}

          {/* <div className="pt-4 border-t border-white/10">
            <p className="text-xs font-mono text-zinc-400 italic">
              &ldquo;Master the markets with institutional precision.&rdquo;
            </p>
          </div> */}
        </div>

        {/* Right Column: Centered Premium Register Card */}
        <div className="w-full lg:col-span-7 flex justify-center">
          <div
            ref={cardRef}
            className="w-full max-w-lg rounded-2xl bg-[#111113]/90 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden"
          >
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12]" />

            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-6">
              {/* <div className="mx-auto mb-3 relative w-12 h-12 rounded-2xl bg-black/80 border border-[#C9A227]/40 flex items-center justify-center p-2 shadow-lg">
                <Image
                  src="/images/logo.png"
                  alt="Aegis Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div> */}
              <h1 className="text-xl font-extrabold text-white">
                Create Account
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Join Aegis Trading Academy today
              </p>
            </div>

            {/* Desktop Card Title */}
            <div className="hidden lg:block mb-5">
              <h2 className="text-xl font-black text-white tracking-tight font-sans">
                Register Your Account
              </h2>
              <p className="text-xs text-zinc-400 mt-1 font-normal">
                Fill in your details to create your academy member account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                  Full Name *
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl bg-[#09090b] border border-white/15 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email & Phone Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                    Email Address *
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="e.g. name@gmail.com"
                      className="w-full rounded-xl bg-[#09090b] border border-white/15 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                    Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl bg-[#09090b] border border-white/15 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </div>

              {/* Discord Name Input (New Requested Field) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
                  <span>Discord Name</span>
                  <span className="text-[10px] text-[#C9A227] font-normal font-mono">
                    Community Access
                  </span>
                </label>
                <div className="relative flex items-center">
                  <MessageSquare className="absolute left-3.5 h-4 w-4 text-[#C9A227]" />
                  <input
                    type="text"
                    value={discordName}
                    onChange={(event) => setDiscordName(event.target.value)}
                    placeholder="Discord Username (e.g. Trader#1234 or username)"
                    className="w-full rounded-xl bg-[#09090b] border border-[#C9A227]/30 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                  />
                </div>
              </div>

              {/* Password & Confirm Password Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                    Password *
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-zinc-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Create password"
                      className="w-full rounded-xl bg-[#09090b] border border-white/15 py-2.5 pl-10 pr-10 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                    Confirm Password *
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-zinc-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Confirm password"
                      className="w-full rounded-xl bg-[#09090b] border border-white/15 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold font-sans tracking-wider bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] text-black shadow-[0_0_25px_rgba(201,162,39,0.3)] hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={14} className="stroke-3" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Link */}
            <div className="mt-5 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-zinc-400 font-sans">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#C9A227] hover:underline hover:text-[#e6c55a] transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
