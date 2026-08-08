"use client";

import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { gsap } from "gsap";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function checkExistingAdminSession() {
      try {
        const response = await fetch("/api/admin/auth/me", {
          cache: "no-store",
        });

        if (response.ok) {
          router.replace("/admin");
          return;
        }
      } catch {
        // Ignore session check errors.
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkExistingAdminSession();
  }, [router]);

  useEffect(() => {
    if (!isCheckingAuth && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        {
          opacity: 0,
          y: 25,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: "power2.out",
        },
      );
    }
  }, [isCheckingAuth]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      toast.error("Email and password are required.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Unable to sign in to the admin panel.");

        return;
      }

      toast.success("Admin login successful.");

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      console.error("Admin login error:", error);

      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4">
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <Loader2 size={18} className="animate-spin" />

          <span>Checking admin session...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-4 py-10">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Login Card */}
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#111113]/95 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:p-8"
      >
        {/* Header */}
        <div className="mb-7 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
            <ShieldCheck size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-black tracking-tight text-white">
            Admin Login
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            Sign in to access the Aegis Trading Academy administration panel.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Admin Email
            </label>

            <div className="relative">
              <Mail
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                required
                className="h-12 w-full rounded-xl border border-white/10 bg-[#09090b] pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-primary/60"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Password
            </label>

            <div className="relative">
              <Lock
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="h-12 w-full rounded-xl border border-white/10 bg-[#09090b] pl-11 pr-12 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-primary/60"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary-light via-primary to-primary-dark text-sm font-bold text-black transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In to Admin Panel
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Security notice */}
        <div className="mt-6 rounded-xl border border-white/10 bg-white/3 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={17} className="mt-0.5 shrink-0 text-primary" />

            <div>
              <p className="text-xs font-semibold text-white">Administrator access</p>

              <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                This login is restricted to Super Admin accounts. Student accounts cannot
                access the administration panel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
