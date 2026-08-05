import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, PlayCircle, ShieldCheck } from "lucide-react";

import { COURSE_CATEGORIES } from "./course-data";

export default function CoursesPage() {
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
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-(--primary)/30 bg-primary/5 px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
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

          {/* Category cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COURSE_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`/courses/${category.id}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#121212]/80 transition-all duration-300 hover:-translate-y-1 hover:border-(--primary)/40 hover:shadow-[0_20px_45px_rgba(212,175,55,0.12)]"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-[#191919]">
                  <Image
                    src={category.thumbnail}
                    alt={category.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />

                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 backdrop-blur-md">
                    <PlayCircle size={14} className="text-primary" />

                    <span className="text-xs font-medium text-zinc-200">
                      {category.lessons.length} lessons
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--primary)/25 bg-primary/10 text-primary">
                      <BookOpen size={18} />
                    </div>

                    <h2 className="pt-1 text-lg font-bold tracking-tight text-white sm:text-xl">
                      {category.title}
                    </h2>
                  </div>

                  <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-zinc-400">
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-xs text-zinc-500">Learn at your own pace</span>

                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <span>View Lessons</span>

                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
