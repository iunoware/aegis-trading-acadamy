"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItemConfig {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Courses", href: "/courses" },
  // { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const itemsContainerRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll Listener for Glass Transformation
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

  // Lock Body Scroll when Mobile Menu is Open
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

  // GSAP Initial Page Load Entrance Animation
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(
          [logoRef.current, itemsContainerRef.current?.children, buttonsRef.current],
          {
            opacity: 1,
            y: 0,
          },
        );
        return;
      }

      gsap.set(logoRef.current, { opacity: 0, x: -20 });
      if (itemsContainerRef.current) {
        gsap.set(itemsContainerRef.current.children, { opacity: 0, y: -15 });
      }
      gsap.set(buttonsRef.current, { opacity: 0, x: 20 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 0.1,
      });

      tl.to(logoRef.current, { opacity: 1, x: 0, duration: 0.7 });
      if (itemsContainerRef.current) {
        tl.to(
          itemsContainerRef.current.children,
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
          "-=0.5",
        );
      }
      tl.to(buttonsRef.current, { opacity: 1, x: 0, duration: 0.7 }, "-=0.4");
    }, navRef);

    return () => ctx.revert();
  }, []);

  // GSAP Mobile Menu Slide-Over Animation
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      gsap.fromTo(
        mobileMenuRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.4, ease: "power3.out" },
      );
    }
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#090909]/85 backdrop-blur-xl border-b border-(--primary)/20 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.6)]"
            : "bg-transparent py-5 border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* LEFT: Logo */}
          <div ref={logoRef} className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
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
                <span className="text-[10px] font-mono text-primary font-semibold tracking-widest uppercase">
                  TRADING ACADEMY
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER: Desktop Navigation Items */}
          <div
            ref={itemsContainerRef}
            className="hidden md:flex items-center gap-8 text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative py-1 transition-all duration-300 hover:-translate-y-0.5 font-semibold ${
                    isActive
                      ? "text-primary font-bold"
                      : "text-zinc-300 hover:text-primary"
                  }`}
                >
                  <span>{item.label}</span>
                  {/* Luxury Gold Active Indicator */}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(212,175,55,0.8)] animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* RIGHT: Login Button */}
          <div
            ref={buttonsRef}
            className="hidden gold-radial-glow md:flex items-center gap-4"
          >
            <Link
              href="/login"
              className={`px-6 py-2.5 bg-primary rounded-xl  text-sm font-bold tracking-wide transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 ${
                pathname === "/login"
                  ? "border-white/15 text-surface hover:text-primary hover:border-(--primary)/40 bg-black/40 backdrop-blur-md"
                  : "bg-linear-to-r from-primary-light via-primary to-primary-dark text-black border-transparent shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              }`}
            >
              Login
            </Link>
          </div>

          {/* MOBILE: Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Mobile Menu"
              className="w-10 h-10 rounded-xl glass-panel border border-white/15 flex items-center justify-center text-white hover:text-primary transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE FULLSCREEN SLIDE-OVER PANEL */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed inset-0 z-50 bg-[#090909]/98 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-8 "
        >
          {/* Top Bar inside Mobile Panel */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9">
                <Image
                  src="/images/logo.png"
                  alt="Aegis Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-base font-extrabold text-white tracking-wide">
                AEGIS TRADING
              </span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close Menu"
              className="w-10 h-10 rounded-xl glass-panel border border-white/15 flex items-center justify-center text-white hover:text-primary transition-colors cursor-pointer"
            >
              <X size={22} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-5 my-8">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={`mobile-${item.label}`}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-2xl font-bold transition-colors flex items-center justify-between ${
                    isActive
                      ? "text-primary font-extrabold"
                      : "text-zinc-200 hover:text-primary"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex flex-col space-y-3 pt-6 border-t border-white/10">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full text-center py-3.5 rounded-xl border text-base font-semibold transition-colors ${
                pathname === "/login"
                  ? "bg-primary text-black font-bold border-primary shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                  : "border-white/15 text-white hover:border-(--primary)/40"
              }`}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
