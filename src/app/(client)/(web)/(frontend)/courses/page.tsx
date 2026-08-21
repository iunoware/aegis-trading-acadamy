"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Lock,
  LogIn,
  PlayCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";

interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  durationSeconds?: number | null;
  videoUrl?: string | null;
  isLocked?: boolean;
  isCompleted?: boolean;
}

interface Course {
  id: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  lessons?: Lesson[];
  _count?: { lessons: number };
}

type AccessState = "loading" | "unauthenticated" | "ready";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [accessState, setAccessState] = useState<AccessState>("loading");
  const [lockedModalCourse, setLockedModalCourse] = useState<Course | null>(null);

  useEffect(() => {
    const disableContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener("contextmenu", disableContextMenu);

    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
    };
  }, []);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await axios.get("/api/courses");

        const fetchedCourses: Course[] = response.data?.courses ?? [];

        setCourses(fetchedCourses);
        setHasActiveSubscription(Boolean(response.data?.hasActiveSubscription));
        setAccessState("ready");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setAccessState("unauthenticated");
          return;
        }

        console.error("Failed to fetch courses:", error);
        setCourses([]);
        setAccessState("ready");
      }
    }

    fetchCourses();
  }, []);

  return (
    <main className="min-h-screen bg-background text-white">
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.85)_100%)]" />

          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(to_right,#C8A84A_1px,transparent_1px),linear-gradient(to_bottom,#C8A84A_1px,transparent_1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="gold-radial-glow absolute left-1/2 top-1/3 h-150 w-150 -translate-x-1/2 rounded-full opacity-20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          {/* Heading */}
          <div className="mb-12 text-center sm:mb-16">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
              <ShieldCheck size={14} />
              Course Library
            </div>

            <h1 className="mx-auto mb-5 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Choose Your
              <span className="gold-gradient-text"> Learning Category.</span>
            </h1>

            <p className="mx-auto max-w-175 text-sm leading-relaxed text-zinc-300/90 sm:text-base lg:text-lg">
              Select a category to explore its structured video lessons and continue your
              trading education.
            </p>
          </div>

          {/* Loading */}
          {accessState === "loading" && (
            <div className="flex min-h-75 items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />

                <p className="text-sm text-zinc-500">Loading courses...</p>
              </div>
            </div>
          )}

          {/* Not logged in */}
          {accessState === "unauthenticated" && (
            <div className="flex min-h-75 items-center justify-center">
              <div className="max-w-sm text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <LogIn size={24} className="text-zinc-500" />
                </div>

                <h2 className="mb-2 text-xl font-bold text-white">Please log in first</h2>

                <p className="mb-6 text-sm text-zinc-500">
                  You need to be logged in to view and access the course library.
                </p>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105"
                >
                  <LogIn size={16} />
                  Log In
                </Link>
              </div>
            </div>
          )}

          {/* Empty State (authenticated, but no courses published) */}
          {accessState === "ready" && courses.length === 0 && (
            <div className="flex min-h-75 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <BookOpen size={24} className="text-zinc-500" />
                </div>

                <h2 className="mb-2 text-xl font-bold text-white">
                  No courses available
                </h2>

                <p className="text-sm text-zinc-500">
                  Courses will appear here once they are published.
                </p>
              </div>
            </div>
          )}

          {/* Course Cards */}
          {accessState === "ready" && courses.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const lessonCount = course._count?.lessons ?? course.lessons?.length ?? 0;
                const isLocked = !hasActiveSubscription;

                const CardInner = (
                  <div className="cursor-pointer">
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden bg-[#191919]">
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className={`object-cover transition-transform duration-500 ${
                            isLocked ? "scale-105" : "group-hover:scale-105"
                          }`}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#191919]">
                          <BookOpen size={40} className="text-zinc-700" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />

                      {isLocked ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          {/* <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/60 backdrop-blur-md">
                            <Lock size={22} className="text-primary" />
                          </div> */}
                        </div>
                      ) : (
                        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 backdrop-blur-md">
                          <PlayCircle size={14} className="text-primary" />

                          <span className="text-xs font-medium text-zinc-200">
                            {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-6 ">
                      <div className="mb-3 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--primary)/25 bg-primary/10 text-primary">
                          <BookOpen size={18} />
                        </div>

                        <h2 className="pt-1 text-lg font-bold tracking-tight text-white sm:text-xl">
                          {course.title}
                        </h2>
                      </div>

                      <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-zinc-400">
                        {course.description || "Explore this course and start learning."}
                      </p>

                      <div className="flex items-center justify-between border-t border-white/10 pt-4">
                        <span className="text-xs text-zinc-500">
                          {isLocked ? "Subscription required" : "Learn at your own pace"}
                        </span>

                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                          <span>{isLocked ? "Unlock" : "View Lessons"}</span>

                          <ArrowRight
                            size={16}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );

                const cardClasses =
                  "group overflow-hidden rounded-2xl border border-white/10 bg-[#121212]/80 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_45px_rgba(212,175,55,0.12)]";

                if (isLocked) {
                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => setLockedModalCourse(course)}
                      className={`${cardClasses} text-left`}
                    >
                      {CardInner}
                    </button>
                  );
                }

                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className={cardClasses}
                  >
                    {CardInner}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Locked Course Modal */}
      {lockedModalCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={() => setLockedModalCourse(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#121212] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLockedModalCourse(null)}
              className="absolute right-4 top-4 text-zinc-500 hover:text-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
              <Lock size={22} className="text-primary" />
            </div>

            <h3 className="mb-2 text-center text-lg font-bold text-white">
              {lockedModalCourse.title}
            </h3>

            <p className="mb-6 text-center text-sm text-zinc-400">
              You don&apos;t have an active subscription yet. Purchase a plan to unlock
              this course and every other course in the library.
            </p>

            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105"
            >
              View Pricing
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
