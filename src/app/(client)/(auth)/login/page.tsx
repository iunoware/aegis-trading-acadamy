"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";

// for pulling in the logo and other assets, you can use the Image component from next/image

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance Animations
  useEffect(() => {
    if (!isCheckingAuth && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 25, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" },
      );
    }
  }, [isCheckingAuth]);

  useEffect(() => {
    async function checkExistingSession() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (response.ok) {
          router.replace("/");
          return;
        }
      } catch {
        // no need to show error here
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkExistingSession();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Login failed");
        return;
      }

      toast.success("Login successful");
      router.replace("/admin");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  // if (isCheckingAuth) {
  //   return (
  //     <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
  //       <div className="flex flex-col items-center gap-3">
  //         <div className="relative w-12 h-12 rounded-2xl bg-black/60 border border-[#C9A227]/30 flex items-center justify-center p-2 shadow-[0_0_20px_rgba(201,162,39,0.2)]">
  //           <Image
  //             src="/images/logo.png"
  //             alt="Aegis Logo"
  //             width={36}
  //             height={36}
  //             className="object-contain"
  //           />
  //         </div>
  //         <Loader2 className="h-5 w-5 animate-spin text-[#C9A227]" />
  //         <span className="text-xs font-mono text-zinc-400">
  //           Verifying session...
  //         </span>
  //       </div>
  //     </main>
  //   );
  // }

  return (
    <main
      ref={pageRef}
      className="relative min-h-screen bg-[#050505] text-white flex items-center justify-center overflow-hidden selection:bg-[#C9A227]/30"
    >
      {/* Background Decorative Radial Glows */}
      {/* <div className="absolute top-0 left-1/4 w-125 h-[500px] bg-[#C9A227]/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-100 h-100 bg-[#C9A227]/5 blur-[120px] pointer-events-none rounded-full" /> */}

      {/* Subtle Grid Background Pattern */}
      {/* <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" /> */}

      {/* Decorative Trading SVG Chart Lines */}
      {/* <div className="absolute inset-0 pointer-events-none opacity-25">
        <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
          <path
            d="M0,600 Q300,550 500,350 T1000,200 T1200,100"
            stroke="#C9A227"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <path
            d="M0,650 Q400,600 600,450 T1100,250 T1200,180"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        </svg>
      </div> */}

      {/* Content Container (Two-column Desktop Layout) */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Marketing Copy & Aegis Branding (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-6">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 text-[11px] font-mono font-bold tracking-widest text-[#C9A227] uppercase w-fit">
            <ShieldCheck size={13} />
            AEGIS TRADING ACADEMY
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
                Welcome Back
              </h1>
              <span className="text-xs font-mono text-[#C9A227] font-semibold tracking-wider block mt-1">
                Institutional Trading Portal
              </span>
            </div>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed font-sans max-w-md">
            Continue your trading journey with Aegis Trading Academy. Access
            your live strategies, risk management tools, and institutional
            market analytics.
          </p>

          {/* Feature Highlights */}
          {/* <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#111113]/80 border border-white/10 text-xs text-zinc-300 font-mono">
              <div className="w-6 h-6 rounded-lg bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] shrink-0">
                <TrendingUp size={13} />
              </div>
              <span>Real-Time Market Data & Scalping Blueprints</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#111113]/80 border border-white/10 text-xs text-zinc-300 font-mono">
              <div className="w-6 h-6 rounded-lg bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] shrink-0">
                <ShieldCheck size={13} />
              </div>
              <span>Institutional Risk Management Systems</span>
            </div>
          </div> */}

          {/* <div className="pt-4 border-t border-white/10">
            <p className="text-xs font-mono text-zinc-400 italic">
              &ldquo;Learn. Practice. Trade with Confidence.&rdquo;
            </p>
          </div> */}
        </div>

        {/* Right Column: Centered Premium Login Card */}
        <div className="w-full lg:col-span-6 flex justify-center">
          <div
            ref={cardRef}
            className="w-full max-w-md rounded-2xl bg-[#111113]/90 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden"
          >
            {/* Accent Glow Strip */}
            {/* <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12]" /> */}

            {/* Mobile Header Branding */}
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
                Welcome Back
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Continue your trading journey with Aegis Trading Academy
              </p>
            </div>

            {/* Desktop Card Header */}
            <div className="hidden lg:block mb-6">
              <h2 className="text-xl font-black text-white tracking-tight font-sans">
                Sign In to Account
              </h2>
              <p className="text-xs text-zinc-400 mt-1 font-normal">
                Enter your registered credentials to access your dashboard
              </p>
            </div>

            {/* Existing Form with Unchanged Handlers & Logic */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email address"
                    className="w-full rounded-xl bg-[#09090b] border border-white/15 py-3 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-mono text-zinc-400 hover:text-[#C9A227] transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl bg-[#09090b] border border-white/15 py-3 pl-10 pr-11 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold font-sans tracking-wider bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] text-black shadow-[0_0_25px_rgba(201,162,39,0.3)] hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={14} className="stroke-3" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Secondary Actions */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-zinc-400 font-sans">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#C9A227] hover:underline hover:text-[#e6c55a] transition-colors"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
