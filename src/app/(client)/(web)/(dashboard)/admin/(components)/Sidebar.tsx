"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  BadgeIndianRupee,
  Users,
  GraduationCap,
  Receipt,
  UserRound,
  MessageSquareQuote,
  Award,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

interface NavItem {
  link: string;
  title: string;
  icon: React.ReactNode;
}

interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupLabel: "DASHBOARD",
    items: [
      {
        link: "/admin",
        title: "Dashboard",
        icon: <LayoutDashboard size={20} className="shrink-0" />,
      },
    ],
  },
  {
    groupLabel: "MANAGEMENT",
    items: [
      {
        link: "/admin/courses",
        title: "Courses",
        icon: <BookOpen size={20} className="shrink-0" />,
      },
      // {
      //   link: "/admin/categories",
      //   title: "Categories",
      //   icon: <FolderTree size={20} className="shrink-0" />,
      // },
      {
        link: "/admin/pricing",
        title: "Pricing",
        icon: <BadgeIndianRupee size={20} className="shrink-0" />,
      },
    ],
  },
  {
    groupLabel: "USERS",
    items: [
      {
        link: "/admin/users",
        title: "Users",
        icon: <Users size={20} className="shrink-0" />,
      },
      {
        link: "/admin/enrollments",
        title: "Enrollments",
        icon: <GraduationCap size={20} className="shrink-0" />,
      },
    ],
  },
  {
    groupLabel: "SALES",
    items: [
      {
        link: "/admin/payments",
        title: "Orders & Payments",
        icon: <Receipt size={20} className="shrink-0" />,
      },
    ],
  },
  {
    groupLabel: "CONTENT",
    items: [
      {
        link: "/admin/testimonials",
        title: "Testimonials",
        icon: <MessageSquareQuote size={20} className="shrink-0" />,
      },
      {
        link: "/admin/certificates",
        title: "Certificates",
        icon: <Award size={20} className="shrink-0" />,
      },
    ],
  },
  {
    groupLabel: "SYSTEM",
    items: [
      {
        link: "/admin/settings",
        title: "Settings",
        icon: <Settings size={20} className="shrink-0" />,
      },
    ],
  },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Screen resize handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ESC key listener to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Logout handler
  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        toast.error("Logout failed");
        return;
      }

      toast.success("Logged out successfully");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* MOBILE TRIGGER BUTTON (TOP NAVBAR ITEM ON MOBILE) */}
      {/* ------------------------------------------------------------- */}
      <div className="lg:hidden fixed top-3 left-4 z-40">
        <button
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open Navigation Sidebar"
          className="w-10 h-10 rounded-xl bg-[#0a0a0c]/90 backdrop-blur-xl border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] hover:text-white shadow-lg cursor-pointer transition-colors"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE BACKDROP OVERLAY */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE SLIDE-OVER SIDEBAR DRAWER */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="lg:hidden fixed top-0 bottom-0 left-0 z-50 w-[280px] bg-[#050505]/98 backdrop-blur-2xl border-r border-white/10 rounded-tr-2xl rounded-br-2xl p-5 flex flex-col justify-between select-none shadow-[10px_0_30px_rgba(0,0,0,0.9)] overflow-y-auto"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 mb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-xl bg-black/60 border border-[#C9A227]/30 flex items-center justify-center p-1.5 shadow-md">
                    <Image
                      src="/images/logo.png"
                      alt="Aegis Logo"
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-white tracking-wider font-sans leading-none">
                      AEGIS TRADING
                    </h2>
                    <span className="text-[10px] font-mono text-[#C9A227] font-semibold tracking-widest uppercase">
                      Admin Panel
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileOpen(false)}
                  aria-label="Close Menu"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile Navigation List */}
              <nav
                className="flex flex-col gap-6"
                aria-label="Mobile Navigation"
              >
                {NAV_GROUPS.map((group) => (
                  <div key={group.groupLabel} className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase px-3 mb-1">
                      {group.groupLabel}
                    </span>

                    {group.items.map((item) => {
                      const isActive =
                        item.link === "/admin"
                          ? pathname === "/admin"
                          : pathname.startsWith(item.link);

                      return (
                        <Link
                          key={item.link}
                          href={item.link}
                          onClick={handleLinkClick}
                          className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                            isActive
                              ? "bg-[#C9A227]/15 text-white font-semibold border border-[#C9A227]/30 shadow-[0_0_15px_rgba(201,162,39,0.15)]"
                              : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                          }`}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#C9A227] rounded-r-full shadow-[0_0_8px_rgba(201,162,39,0.8)]" />
                          )}
                          <span
                            className={
                              isActive ? "text-[#C9A227]" : "text-zinc-400"
                            }
                          >
                            {item.icon}
                          </span>
                          <span>{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>

            {/* Bottom Profile & Logout (Mobile) */}
            <div className="pt-4 mt-6 border-t border-white/10 flex flex-col gap-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="relative w-8 h-8 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227] font-bold text-xs">
                  <span>A</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#050505] absolute bottom-0 right-0" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white leading-tight">
                    Super Admin
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Administrator
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-zinc-300 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 cursor-pointer"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* DESKTOP STICKY SIDEBAR (280px Expanded, 88px Collapsed) */}
      {/* ------------------------------------------------------------- */}
      <motion.aside
        animate={{ width: isCollapsed ? 88 : 280 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex sticky top-0 h-screen shrink-0 bg-[#050505]/95 backdrop-blur-2xl border-r border-white/10 rounded-tr-2xl rounded-br-2xl p-4 flex-col justify-between z-30 select-none shadow-[10px_0_30px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div
            className={`flex items-center pb-5 mb-3 border-b border-white/10 ${
              isCollapsed ? "justify-center" : "justify-between px-2"
            }`}
          >
            <Link
              href="/admin"
              className="flex items-center gap-3 group overflow-hidden"
            >
              <div className="relative w-9 h-9 rounded-xl bg-black/60 border border-[#C9A227]/30 flex items-center justify-center p-1.5 shadow-md shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="Aegis Logo"
                  width={28}
                  height={28}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col overflow-hidden whitespace-nowrap"
                >
                  <span className="text-sm font-extrabold text-white tracking-wider font-sans leading-none">
                    AEGIS TRADING
                  </span>
                  <span className="text-[10px] font-mono text-[#C9A227] font-semibold tracking-widest uppercase mt-0.5">
                    Admin Panel
                  </span>
                </motion.div>
              )}
            </Link>

            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                aria-label="Collapse Sidebar"
                className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:border-[#C9A227]/40 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </div>

          {/* Expand Toggle Button (when collapsed) */}
          {isCollapsed && (
            <div className="flex justify-center mb-3">
              <button
                onClick={() => setIsCollapsed(false)}
                aria-label="Expand Sidebar"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-[#C9A227]/40 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Navigation Groups Container */}
          <div className="flex-1 overflow-y-auto scrollbar-none space-y-5 pr-1">
            {NAV_GROUPS.map((group) => (
              <div key={group.groupLabel} className="flex flex-col gap-1">
                {/* Group Heading */}
                {!isCollapsed ? (
                  <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase px-3 mb-1 block">
                    {group.groupLabel}
                  </span>
                ) : (
                  <div className="h-px bg-white/5 my-1 mx-2" />
                )}

                {/* Group Items */}
                {group.items.map((item) => {
                  const isActive =
                    item.link === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.link);

                  return (
                    <div
                      key={item.link}
                      className="relative group"
                      onMouseEnter={() => setHoveredItem(item.link)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Link
                        href={item.link}
                        onClick={handleLinkClick}
                        className={`relative flex items-center gap-3 rounded-xl transition-all duration-200 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] ${
                          isCollapsed
                            ? "h-11 w-11 mx-auto justify-center p-0"
                            : "px-3.5 py-2.5"
                        } ${
                          isActive
                            ? "bg-[#C9A227]/12 text-white font-semibold border border-[#C9A227]/25 shadow-[0_0_15px_rgba(201,162,39,0.12)]"
                            : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                        }`}
                      >
                        {/* Active Left Indicator Line */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#C9A227] rounded-r-full shadow-[0_0_8px_rgba(201,162,39,0.8)]" />
                        )}

                        {/* Icon */}
                        <span
                          className={`transition-transform duration-200 group-hover:translate-x-0.5 ${
                            isActive
                              ? "text-[#C9A227]"
                              : "text-zinc-400 group-hover:text-zinc-200"
                          }`}
                        >
                          {item.icon}
                        </span>

                        {/* Item Title */}
                        {!isCollapsed && (
                          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                            {item.title}
                          </span>
                        )}
                      </Link>

                      {/* Tooltip when Collapsed */}
                      {isCollapsed && hoveredItem === item.link && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-[78px] top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 rounded-lg bg-[#18181b] text-xs font-semibold text-white border border-[#C9A227]/30 shadow-xl whitespace-nowrap pointer-events-none"
                        >
                          {item.title}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom Section: Profile & Logout */}
          <div className="pt-3 mt-3 border-t border-white/10 flex flex-col gap-2 shrink-0">
            <div
              className={`flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/5 transition-all ${
                isCollapsed ? "p-2 justify-center" : "p-2.5"
              }`}
            >
              <div className="relative w-8 h-8 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227] font-bold text-xs shrink-0 shadow-inner">
                <span>A</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#050505] absolute bottom-0 right-0" />
              </div>

              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden whitespace-nowrap">
                  <span className="text-xs font-bold text-white leading-tight text-ellipsis overflow-hidden">
                    Super Admin
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Administrator
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              aria-label="Logout"
              className={`flex items-center gap-2 rounded-xl border border-white/10 text-xs font-semibold text-zinc-300 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 cursor-pointer ${
                isCollapsed
                  ? "w-11 h-10 mx-auto justify-center p-0"
                  : "w-full py-2.5 px-3 justify-center"
              }`}
            >
              <LogOut size={16} className="shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
