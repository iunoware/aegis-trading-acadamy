"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { ArrowLeft, Check, Clock3, Lock, Play, PlayCircle, Video } from "lucide-react";

import { getCourseCategory, type Lesson } from "../course-data";

interface CourseCategoryPageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

interface LessonItemProps {
  lesson: Lesson;
  lessonNumber: number;
  isActive: boolean;
  onClick: () => void;
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
            <span>{lesson.duration}</span>
          </div>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500 sm:text-sm">
          {lesson.description}
        </p>
      </div>

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

export default function CourseCategoryPage({ params }: CourseCategoryPageProps) {
  const { categoryId } = use(params);

  const category = getCourseCategory(categoryId);

  const firstAvailableLesson = category?.lessons.find((lesson) => !lesson.isLocked);

  const [activeLessonId, setActiveLessonId] = useState(firstAvailableLesson?.id ?? "");

  const activeLesson = useMemo(() => {
    return (
      category?.lessons.find((lesson) => lesson.id === activeLessonId) ??
      firstAvailableLesson
    );
  }, [activeLessonId, category, firstAvailableLesson]);

  if (!category) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-white">
        <div className="text-center">
          <h1 className="mb-3 text-3xl font-bold">Course category not found</h1>

          <Link href="/courses" className="text-sm font-semibold text-primary">
            Return to courses
          </Link>
        </div>
      </main>
    );
  }

  function handleLessonChange(lesson: Lesson) {
    if (lesson.isLocked) return;

    setActiveLessonId(lesson.id);
  }

  return (
    <main className="min-h-screen bg-background text-white">
      <section className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/3 h-150 w-150 -translate-x-1/2 rounded-full gold-radial-glow opacity-20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl">
          <Link
            href="/courses"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition-colors hover:text-primary"
          >
            <ArrowLeft size={17} />
            <span>Back to Course Categories</span>
          </Link>

          <div className="mb-8">
            <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
              Course Category
            </p>

            <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {category.title}
            </h1>

            <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              {category.description}
            </p>
          </div>

          <div className="mb-10 overflow-hidden rounded-3xl border border-white/10 bg-[#101010]/80 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              {activeLesson?.videoUrl ? (
                <video
                  key={activeLesson.id}
                  controls
                  preload="metadata"
                  className="h-full w-full object-contain"
                >
                  <source src={activeLesson.videoUrl} type="video/mp4" />
                  Your browser does not support the video element.
                </video>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#0b0b0b]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                    <Video size={28} />
                  </div>

                  <p className="text-sm text-zinc-400">Video unavailable</p>
                </div>
              )}
            </div>

            <div className="p-5 sm:p-7">
              <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                    Now Playing
                  </p>

                  <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                    {activeLesson?.title}
                  </h2>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-zinc-400">
                  <Clock3 size={14} />
                  {activeLesson?.duration}
                </div>
              </div>

              <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                {activeLesson?.description}
              </p>
            </div>
          </div>

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

              <span>{category.lessons.length} video lessons</span>
            </div>
          </div>

          <div className="space-y-3">
            {category.lessons.map((lesson, index) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                lessonNumber={index + 1}
                isActive={lesson.id === activeLesson?.id}
                onClick={() => handleLessonChange(lesson)}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
