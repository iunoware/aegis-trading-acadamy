/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import axios from "axios";
import { use, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Clock3, Lock, Play, PlayCircle, Video } from "lucide-react";

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
}

interface LessonItemProps {
  lesson: Lesson;
  lessonNumber: number;
  isActive: boolean;
  onClick: () => void;
}

function formatDuration(seconds?: number | null) {
  if (seconds === null || seconds === undefined) {
    return "—";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function LessonItem({ lesson, lessonNumber, isActive, onClick }: LessonItemProps) {
  return (
    <button
      type="button"
      disabled={lesson.isLocked}
      onClick={onClick}
      className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 sm:p-5 ${
        lesson.isLocked
          ? "cursor-not-allowed border-white/5 bg-white/2 opacity-45"
          : isActive
            ? "border-primary/45 bg-primary/8"
            : "border-white/10 bg-[#121212]/60 hover:border-primary/30 hover:bg-[#171717]"
      }`}
    >
      {/* Lesson Number / Status */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
          lesson.isLocked
            ? "border-white/10 bg-white/5 text-zinc-600"
            : lesson.isCompleted
              ? "border-primary bg-primary text-black"
              : isActive
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-white/10 bg-white/5 text-zinc-400 group-hover:border-primary/30 group-hover:text-primary"
        }`}
      >
        {lesson.isLocked ? (
          <Lock size={17} />
        ) : lesson.isCompleted ? (
          <Check size={17} strokeWidth={3} />
        ) : isActive ? (
          <Play size={16} className="fill-current" />
        ) : (
          <span>{lessonNumber}</span>
        )}
      </div>

      {/* Lesson Details */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
          <h3
            className={`text-sm font-semibold leading-snug sm:text-base ${
              isActive ? "text-white" : "text-zinc-200"
            }`}
          >
            {lesson.title}
          </h3>

          <div className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-zinc-500">
            <Clock3 size={13} />

            <span>{formatDuration(lesson.durationSeconds)}</span>
          </div>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500 sm:text-sm">
          {lesson.description || "No description available."}
        </p>
      </div>

      {/* Play Icon */}
      {!lesson.isLocked && (
        <PlayCircle
          size={20}
          className={`hidden shrink-0 sm:block ${
            isActive ? "text-primary" : "text-zinc-600 group-hover:text-primary"
          }`}
        />
      )}
    </button>
  );
}

interface CourseCategoryPageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

export default function CourseCategoryPage({ params }: CourseCategoryPageProps) {
  const { categoryId } = use(params);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState("");

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
    async function fetchCourse() {
      try {
        setLoading(true);

        const response = await axios.get("/api/admin/courses");

        const courses: Course[] = response.data?.courses ?? [];

        const selectedCourse = courses.find((item) => item.id === categoryId);

        if (!selectedCourse) {
          setCourse(null);
          return;
        }

        setCourse(selectedCourse);

        const lessons = selectedCourse.lessons ?? [];

        const firstAvailableLesson = lessons.find((lesson) => !lesson.isLocked);

        setActiveLessonId(firstAvailableLesson?.id ?? "");
      } catch (error) {
        console.error("Failed to fetch course:", error);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [categoryId]);

  const lessons = course?.lessons ?? [];

  const firstAvailableLesson = useMemo(() => {
    return lessons.find((lesson) => !lesson.isLocked);
  }, [lessons]);

  const activeLesson = useMemo(() => {
    return lessons.find((lesson) => lesson.id === activeLessonId) ?? firstAvailableLesson;
  }, [activeLessonId, lessons, firstAvailableLesson]);

  function handleLessonChange(lesson: Lesson) {
    if (lesson.isLocked) {
      return;
    }

    setActiveLessonId(lesson.id);
  }

  // the actual video file exists at:
  // storage/videos/cmsppun82000g3k3avp71pjq0/7148e5f7-7e30-4686-8bb1-ee94ea4b1869.mp4

  const videoStreamUrl = activeLesson
    ? `/api/admin/courses/${course?.id}/lessons/${activeLesson.id}/video`
    : null;

  /* Loading */
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />

          <p className="text-sm text-zinc-500">Loading course...</p>
        </div>
      </main>
    );
  }

  /* Course Not Found */
  if (!course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-white">
        <div className="text-center">
          <h1 className="mb-3 text-3xl font-bold">Course not found</h1>

          <p className="mb-5 text-sm text-zinc-500">
            The course you are looking for does not exist or is no longer available.
          </p>

          <Link href="/courses" className="text-sm font-semibold text-primary">
            Return to courses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-white">
      <section className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-25">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/3 h-150 w-150 -translate-x-1/2 rounded-full gold-radial-glow opacity-20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl">
          {/* Back Button */}
          <Link
            href="/courses"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition-colors hover:text-primary"
          >
            <ArrowLeft size={17} />

            <span>Back to Course Categories</span>
          </Link>

          {/* Course Heading */}
          <div className="mb-8">
            <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
              Course Category
            </p>

            <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {course.title}
            </h1>

            <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              {course.description || "Explore the video lessons in this course."}
            </p>
          </div>

          {/* Video Player */}
          <div className="mb-10 overflow-hidden rounded-3xl border border-white/10 bg-[#101010]/80 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              {activeLesson && videoStreamUrl ? (
                <video
                  key={activeLesson.id}
                  controls
                  controlsList="nodownload"
                  disablePictureInPicture
                  preload="metadata"
                  playsInline
                  onContextMenu={(event) => event.preventDefault()}
                  className="h-full w-full object-contain"
                >
                  <source src={videoStreamUrl} type="video/mp4" />
                  Your browser does not support the video element.
                </video>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#0b0b0b]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                    <Video size={28} />
                  </div>

                  <p className="text-sm text-zinc-400">
                    {activeLesson ? "Video unavailable" : "No lessons available"}
                  </p>
                </div>
              )}
            </div>

            {/* Video Information */}
            <div className="p-5 sm:p-7">
              <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                    Now Playing
                  </p>

                  <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                    {activeLesson?.title || "No lesson selected"}
                  </h2>
                </div>

                {activeLesson && (
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-zinc-400">
                    <Clock3 size={14} />

                    {formatDuration(activeLesson.durationSeconds)}
                  </div>
                )}
              </div>

              <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                {activeLesson?.description || "Select a lesson below to start learning."}
              </p>
            </div>
          </div>

          {/* Curriculum Header */}
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                Video Lessons
              </p>

              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Course Curriculum
              </h2>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-[#121212]/80 px-4 py-2.5 text-sm text-zinc-400">
              <Video size={16} className="text-primary" />

              <span>
                {lessons.length} {lessons.length === 1 ? "video lesson" : "video lessons"}
              </span>
            </div>
          </div>

          {/* Lessons */}
          {lessons.length > 0 ? (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  lessonNumber={index + 1}
                  isActive={lesson.id === activeLesson?.id}
                  onClick={() => handleLessonChange(lesson)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#121212]/60 p-10 text-center">
              <Video size={32} className="mx-auto mb-4 text-zinc-600" />

              <h3 className="mb-2 text-lg font-semibold text-white">
                No video lessons yet
              </h3>

              <p className="text-sm text-zinc-500">
                Lessons will appear here once they are added to this course.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
