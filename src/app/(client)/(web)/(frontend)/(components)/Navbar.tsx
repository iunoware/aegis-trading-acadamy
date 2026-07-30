"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { Menu, X, ArrowRight, ShieldCheck } from "lucide-react";

export interface NavItemConfig {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { label: "Home", href: "#" },
  { label: "About", href: "#why-choose-aegis" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Mentors", href: "#mentors" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const itemsContainerRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState("#");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // -------------------------------------------------------------
  // Scroll Listener for Glass Transformation
  // -------------------------------------------------------------
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // -------------------------------------------------------------
  // Lock Body Scroll when Mobile Menu is Open
  // -------------------------------------------------------------
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // -------------------------------------------------------------
  // GSAP Initial Page Load Entrance Animation
  // -------------------------------------------------------------
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set([logoRef.current, itemsContainerRef.current?.children, buttonsRef.current], {
          opacity: 1,
          y: 0,
        });
        return;
      }

      gsap.set(logoRef.current, { opacity: 0, x: -20 });
      if (itemsContainerRef.current) {
        gsap.set(itemsContainerRef.current.children, { opacity: 0, y: -15 });
      }
      gsap.set(buttonsRef.current, { opacity: 0, x: 20 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.1 });

      tl.to(logoRef.current, { opacity: 1, x: 0, duration: 0.7 });
      if (itemsContainerRef.current) {
        tl.to(
          itemsContainerRef.current.children,
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
          "-=0.5"
        );
      }
      tl.to(buttonsRef.current, { opacity: 1, x: 0, duration: 0.7 }, "-=0.4");
    }, navRef);

    return () => ctx.revert();
  }, []);

  // -------------------------------------------------------------
  // GSAP Mobile Menu Slide-Over Animation
  // -------------------------------------------------------------
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      gsap.fromTo(
        mobileMenuRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.4, ease: "power3.out" }
      );
    }
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#090909]/85 backdrop-blur-xl border-b border-[var(--primary)]/20 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.6)]"
            : "bg-transparent py-5 border-b border-transparent"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* LEFT: Logo */}
          <div ref={logoRef} className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11">
                <Image
                  src="/images/logo.png"
                  alt="Aegis Trading Academy Logo"
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-extrabold tracking-wider text-white font-sans leading-none">
                  AEGIS
                </span>
                <span className="text-[10px] font-mono text-[var(--primary)] font-semibold tracking-widest uppercase">
                  TRADING ACADEMY
                </span>
              </div>
            </a>
          </div>

          {/* CENTER: Desktop Navigation Items */}
          <div
            ref={itemsContainerRef}
            className="hidden md:flex items-center gap-8 text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeHref === item.href;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setActiveHref(item.href)}
                  className={`relative py-1 transition-all duration-300 hover:-translate-y-0.5 ${
                    isActive
                      ? "text-[var(--primary-light)] font-semibold"
                      : "text-zinc-300 hover:text-[var(--primary)]"
                  }`}
                >
                  <span>{item.label}</span>
                  {/* Luxury Gold Active Indicator */}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(212,175,55,0.8)] animate-pulse" />
                  )}
                </a>
              );
            })}
          </div>

          {/* RIGHT: Buttons */}
          <div ref={buttonsRef} className="hidden md:flex items-center gap-4">
            {/* Secondary Button: Login */}
            <a
              href="#login"
              className="px-5 py-2 rounded-xl border border-white/15 text-sm font-semibold text-white hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              Login
            </a>

            {/* Primary Button: Join Academy */}
            <a
              href="#pricing"
              className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[var(--primary-light)] via-[var(--primary)] to-[var(--primary-dark)] text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Join Academy</span>
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>

          {/* MOBILE: Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Mobile Menu"
              className="w-10 h-10 rounded-xl glass-panel border border-white/15 flex items-center justify-center text-white hover:text-[var(--primary)] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE FULLSCREEN SLIDE-OVER PANEL */}
      {/* ------------------------------------------------------------- */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed inset-0 z-50 bg-[#090909]/98 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-8 select-none"
        >
          {/* Top Bar inside Mobile Panel */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9">
                <Image src="/images/logo.png" alt="Aegis Logo" fill className="object-contain" />
              </div>
              <span className="text-base font-extrabold text-white tracking-wide">
                AEGIS TRADING
              </span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close Menu"
              className="w-10 h-10 rounded-xl glass-panel border border-white/15 flex items-center justify-center text-white hover:text-[var(--primary)] transition-colors cursor-pointer"
            >
              <X size={22} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-5 my-8">
            {NAV_ITEMS.map((item) => (
              <a
                key={`mobile-${item.label}`}
                href={item.href}
                onClick={() => {
                  setActiveHref(item.href);
                  setMobileMenuOpen(false);
                }}
                className="text-2xl font-bold text-zinc-200 hover:text-[var(--primary)] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex flex-col space-y-3 pt-6 border-t border-white/10">
            <a
              href="#login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3.5 rounded-xl border border-white/15 text-base font-semibold text-white hover:border-[var(--primary)]/40 transition-colors"
            >
              Login
            </a>

            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-4 rounded-xl font-bold text-base bg-gradient-to-r from-[var(--primary-light)] via-[var(--primary)] to-[var(--primary-dark)] text-black shadow-[0_0_25px_rgba(212,175,55,0.4)]"
            >
              Join Academy
            </a>
          </div>
        </div>
      )}
    </>
  );
}
