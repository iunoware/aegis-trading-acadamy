/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
// import Image from "next/image";
import { gsap } from "gsap";
import axios from "axios";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Mail,
  // Phone,
  MapPin,
  // Globe,
  // Video,
  // Share2,
  // Send,
  ShieldCheck,
} from "lucide-react";
import {
  // FacebookIcon,
  InstagramIcon,
  XIcon,
  YoutubeIcon,
  // TelegramIcon,
  // YoutubeIcon,
} from "@/components/Icons";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const ctaBoxRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isProfile = pathname.startsWith("/student");

  const [activeSubscription, setActiveSubscription] = useState<any>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("/api/auth/me");

        setActiveSubscription(response.data.user?.activeSubscription ?? null);
      } catch {
        setActiveSubscription(null);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set([ctaBoxRef.current, columnsRef.current?.children], {
          opacity: 1,
          y: 0,
          scale: 1,
        });
        return;
      }

      gsap.set(ctaBoxRef.current, { opacity: 0, y: 30, scale: 0.97 });
      if (columnsRef.current) {
        gsap.set(columnsRef.current.children, { opacity: 0, y: 25 });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "power3.out" },
      });

      tl.to(ctaBoxRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.85 });

      if (columnsRef.current) {
        tl.to(
          columnsRef.current.children,
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 },
          "-=0.4",
        );
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      aria-label="Aegis Trading Academy Footer"
      className="relative w-full bg-[#070707] text-white pt-20 pb-12 overflow-hidden"
    >
      {/* Background Soft Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-225 h-125 gold-radial-glow opacity-20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* TOP CTA BOX */}
        {!isProfile ? (
          <div
            ref={ctaBoxRef}
            className="rounded-3xl glass-panel p-8 sm:p-12 border border-primary/30 text-center flex flex-col items-center mb-20 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_35px_rgba(212,175,55,0.15)]"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 text-xs font-semibold tracking-widest text-primary font-mono uppercase bg-primary/5 mb-4">
              <ShieldCheck size={14} className="text-primary" />
              START YOUR TRANSFORMATION
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans max-w-2xl mb-4">
              Ready to Build <br />
              <span className="gold-gradient-text">Your Trading Future? </span>
            </h2>

            <p className="text-base sm:text-lg text-zinc-300 max-w-xl font-normal leading-relaxed mb-8">
              Join Aegis Trading Academy today and start learning through structured
              education, live mentorship and disciplined trading principles.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              {/* Primary Button */}
              <a
                href="/pricing"
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold text-sm sm:text-base tracking-wide bg-linear-to-r from-primary-light via-primary to-primary-dark text-black shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_40px_rgba(212,175,55,0.55)] transition-all duration-300 transform hover:-translate-y-0.5 w-full sm:w-auto text-center"
              >
                <span>Join Academy</span>
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>

              {/* Secondary Button */}
              {/* <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-sm sm:text-base tracking-wide glass-panel text-white hover:text-primary border border-white/15 hover:border-primary/40 transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto text-center"
              >
                Contact Us
              </a> */}
            </div>
          </div>
        ) : (
          <div></div>
        )}

        {/* FOOTER CONTENT (5 Columns Grid) */}

        <div
          ref={columnsRef}
          // className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-16 border-b border-white/10"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-16 border-b border-white/10"
        >
          {/* Column 1: Brand Info */}
          {/* <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9">
                <Image
                  src="/images/logo.png"
                  alt="Aegis Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-extrabold text-white tracking-wider">
                AEGIS
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
              Building disciplined traders through structured education and real market
              experience.
            </p>
          </div> */}

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-primary uppercase tracking-widest">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/#testimonials"
                  className="hover:text-primary transition-colors"
                >
                  Testimonials
                </Link>
              </li>
              {/* <li>
                <Link href="#contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li> */}
            </ul>
          </div>

          {/* Column 3: Learning */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-primary uppercase tracking-widest">
              Learning
            </h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li>
                <a href="/login" className="hover:text-primary transition-colors">
                  Member Login
                </a>
              </li>

              <li>
                <Link href="/courses" className="hover:text-primary transition-colors">
                  Courses
                </Link>
              </li>

              <li>
                <a href="/pricing" className="hover:text-primary transition-colors">
                  Pricing Plans
                </a>
              </li>

              {/* <li>
                <a href="#community" className="hover:text-primary transition-colors">
                  Community
                </a>
              </li> */}

              {/* <li>
                <a href="#support" className="hover:text-primary transition-colors">
                  Support
                </a>
              </li> */}
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-primary uppercase tracking-widest">
              Legal
            </h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li>
                <Link href="/disclaimer" className="hover:text-white transition">
                  Disclaimer
                </Link>
              </li>
              {/* <li>
                <a href="#privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-primary transition-colors">
                  Terms &amp; Conditions
                </a>
              </li>
              <li>
                <a href="#refund" className="hover:text-primary transition-colors">
                  Refund Policy
                </a>
              </li>
              <li>
                <a href="#disclaimer" className="hover:text-primary transition-colors">
                  Risk Disclaimer
                </a>
              </li> */}
            </ul>
          </div>

          {/* Column 5: Contact & Socials */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-primary uppercase tracking-widest">
              Contact Us
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-primary" />
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=info@aegistrading.com"
                >
                  info@aegistrading.com
                </a>
              </li>
              {/* <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-primary" />
                <a target="_blank" rel="noopener noreferrer" href="tel:+919876543210">
                  +91 98765 43210
                </a>
              </li> */}
              <li className="flex items-center gap-2.5">
                <MapPin size={16} className="text-primary" />
                <span>Chennai, Tamil Nadu, India</span>
              </li>
            </ul>

            {/* Social Media Icons */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://www.instagram.com/aegistradingacademy_?igsh=MWp3ZTlmbHdicXlsYQ%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-primary hover:border-primary/40 transition-colors"
              >
                <InstagramIcon className="h-5" />
              </a>

              <a
                href="https://www.youtube.com/@aegistradingacademy-ata"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-primary hover:border-primary/40 transition-colors"
              >
                <YoutubeIcon className="h-5" />
              </a>

              {/* <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-primary hover:border-primary/40 transition-colors"
              >
                <LinkedInIcon className="h-5" />
              </a> */}

              {/* <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-primary hover:border-primary/40 transition-colors"
              >
                <FacebookIcon className="h-5" />
              </a> */}

              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-primary hover:border-primary/40 transition-colors"
              >
                <XIcon className="h-5" />
              </a>

              {/* <a
                href="https://telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-primary hover:border-primary/40 transition-colors"
              >
                <TelegramIcon className="h-5" />
              </a> */}
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-zinc-400 gap-4">
          <div>
            &copy; {new Date().getFullYear()} Aegis Trading Academy. All rights reserved.{" "}
            {/* <Link href="/disclaimer" className="hover:text-white transition">
              Disclaimer
            </Link> */}
          </div>

          <div className="text-primary/80 ">Designed with precision.</div>
        </div>
      </div>
    </footer>
  );
}
