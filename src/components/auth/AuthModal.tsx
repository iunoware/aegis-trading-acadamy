"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  MessageSquare,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { gsap } from "gsap";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalView,
    closeAuthModal,
    openLoginModal,
    openSignupModal,
    setAuthUser,
  } = useAuth();

  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Form states - Register
  const [fullName, setFullName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [discordName, setDiscordName] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI control states
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Entrance animation
  useEffect(() => {
    if (isAuthModalOpen) {
      if (modalRef.current) {
        gsap.fromTo(
          modalRef.current,
          { opacity: 0, scale: 0.95, y: 15 },
          { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power2.out" }
        );
      }
      if (backdropRef.current) {
        gsap.fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3 }
        );
      }
    }
  }, [isAuthModalOpen, authModalView]);

  if (!isAuthModalOpen) return null;

  async function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error("Email and password are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login failed.");
        return;
      }

      toast.success("Welcome back! Login successful.");
      setAuthUser(data.user);
      setLoginEmail("");
      setLoginPassword("");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong during login.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegisterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!fullName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      toast.error("Full name, email, and password are required.");
      return;
    }

    if (registerPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email: registerEmail,
          phone,
          discordName,
          password: registerPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed.");
        return;
      }

      toast.success("Account created! You are now logged in.");
      setAuthUser(data.user);
      setFullName("");
      setRegisterEmail("");
      setPhone("");
      setDiscordName("");
      setRegisterPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Something went wrong during registration.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={closeAuthModal}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-md my-8 overflow-hidden rounded-2xl border border-white/10 bg-[#111113]/95 p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl"
      >
        {/* Top Gold Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-primary to-amber-600" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Close Modal"
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-1 rounded-lg border border-white/10 bg-black/40 hover:bg-white/10 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-black tracking-tight text-white font-sans">
            {authModalView === "login" ? "Welcome Back" : "Join Aegis Academy"}
          </h2>
          <p className="mt-1 text-xs text-zinc-400 font-sans">
            {authModalView === "login"
              ? "Sign in to access your trading dashboard"
              : "Create an account to start your trading journey"}
          </p>
        </div>

        {/* LOGIN FORM */}
        {authModalView === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-xl bg-[#09090b] border border-white/15 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl bg-[#09090b] border border-white/15 py-2.5 pl-10 pr-11 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
                  autoComplete="current-password"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-3 px-4 rounded-xl text-xs font-bold font-sans tracking-wider bg-gradient-to-r from-amber-400 via-primary to-amber-600 text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
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

            <div className="mt-5 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-zinc-400 font-sans">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={openSignupModal}
                  className="font-bold text-primary hover:underline transition-colors cursor-pointer"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* SIGNUP FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
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
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl bg-[#09090b] border border-white/15 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
                  autoComplete="name"
                />
              </div>
            </div>

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
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl bg-[#09090b] border border-white/15 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
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
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 890"
                    className="w-full rounded-xl bg-[#09090b] border border-white/15 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
                    autoComplete="tel"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
                <span>Discord Username</span>
                <span className="text-[10px] text-primary font-normal font-mono">Community Access</span>
              </label>
              <div className="relative flex items-center">
                <MessageSquare className="absolute left-3.5 h-4 w-4 text-primary" />
                <input
                  type="text"
                  value={discordName}
                  onChange={(e) => setDiscordName(e.target.value)}
                  placeholder="Username (e.g. trader#1234)"
                  className="w-full rounded-xl bg-[#09090b] border border-primary/30 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

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
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full rounded-xl bg-[#09090b] border border-white/15 py-2.5 pl-10 pr-10 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full rounded-xl bg-[#09090b] border border-white/15 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-3 px-4 rounded-xl text-xs font-bold font-sans tracking-wider bg-gradient-to-r from-amber-400 via-primary to-amber-600 text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
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

            <div className="mt-4 pt-3 border-t border-white/10 text-center">
              <p className="text-xs text-zinc-400 font-sans">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="font-bold text-primary hover:underline transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
