"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, ChevronLeft, ChevronRight, Quote, ShieldCheck } from "lucide-react";
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TestimonialData {
  id: string;
  customerName: string;
  designation?: string;
  company?: string;
  avatarUrl?: string;
  rating: number;
  reviewText: string;
  status: "Published" | "Hidden";
  displayOrder: number;
  createdAt: string;
}

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const carouselFrameRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get<TestimonialData[]>("/api/admin/testimonial");

        const publishedTestimonials = response.data.filter(
          (testimonial) => testimonial.status === "Published",
        );

        setTestimonials(publishedTestimonials);
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) =>
      testimonials.length > 0 ? (prev + 1) % testimonials.length : 0,
    );
  }, [testimonials.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) =>
      testimonials.length > 0
        ? (prev - 1 + testimonials.length) % testimonials.length
        : 0,
    );
  }, [testimonials.length]);

  // Auto-Slide Loop (Every 6 Seconds, Pauses on Hover)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (isPaused || prefersReducedMotion) return;

    const timer = setInterval(() => {
      handleNext();
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused, handleNext]);

  // GSAP Animations with ScrollTrigger

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(
          [
            labelRef.current,
            headingRef.current,
            paragraphRef.current,
            carouselFrameRef.current,
            controlsRef.current,
          ],
          { opacity: 1, y: 0 },
        );
        return;
      }

      gsap.set(labelRef.current, { opacity: 0, y: 20 });
      gsap.set(headingRef.current, { opacity: 0, y: 30 });
      gsap.set(paragraphRef.current, { opacity: 0, y: 25 });
      gsap.set(carouselFrameRef.current, { opacity: 0, y: 35 });
      gsap.set(controlsRef.current, { opacity: 0, y: 15 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "power3.out" },
      });

      tl.to(labelRef.current, { opacity: 1, y: 0, duration: 0.7 })
        .to(headingRef.current, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
        .to(paragraphRef.current, { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
        .to(carouselFrameRef.current, { opacity: 1, y: 0, duration: 0.9 }, "-=0.4")
        .to(controlsRef.current, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.45,
          scale: 1.1,
          duration: 4.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  // Compute indices for 3-card layout frame
  const count = testimonials.length;

  const leftIdx = count > 0 ? (activeIndex - 1 + count) % count : 0;

  const rightIdx = count > 0 ? (activeIndex + 1) % count : 0;

  const visibleCards =
    count > 0
      ? [
          {
            data: testimonials[leftIdx],
            position: "left",
          },
          {
            data: testimonials[activeIndex],
            position: "center",
          },
          {
            data: testimonials[rightIdx],
            position: "right",
          },
        ]
      : [];

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      aria-label="Testimonials Section"
      className="relative w-full py-28 lg:py-20 bg-background text-white overflow-hidden "
    >
      {/* BACKGROUND GLOW */}

      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          ref={glowRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 rounded-full gold-radial-glow opacity-30 blur-3xl transform-gpu"
        />
      </div>

      {/* SECTION CONTAINER */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Small Label */}
        <div ref={labelRef} className="mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-(--primary)/30 text-xs font-semibold tracking-widest text-primary font-mono uppercase bg-primary/5">
            <ShieldCheck size={14} className="text-primary" />
            TESTIMONIALS
          </div>
        </div>

        {/* Main Heading */}
        <h2
          ref={headingRef}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans mb-4 text-center max-w-3xl"
        >
          Real Stories. <br />
          <span className="gold-gradient-text">Real Growth.</span>
        </h2>

        {/* Supporting Paragraph (Max width 650px) */}
        <p
          ref={paragraphRef}
          className="text-base sm:text-lg font-normal leading-relaxed text-zinc-300 max-w-162.5 text-center mb-16 sm:mb-20"
        >
          Hear directly from traders who transformed their learning journey through
          structured education, disciplined execution and continuous mentorship at Aegis
          Trading Academy.
        </p>

        {/* CAROUSEL CARDS FRAME */}
        {/* <div
          ref={carouselFrameRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="w-full relative max-w-[1200px] mx-auto min-h-[340px] flex items-center justify-center mb-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center w-full">
            {visibleCards.map(({ data, position }) => {
              const isCenter = position === "center";
              return (
                <div
                  key={data.id}
                  className={`transition-all duration-500 ease-out transform ${
                    isCenter
                      ? "scale-100 md:scale-105 opacity-100 z-20"
                      : "hidden md:block scale-95 opacity-50 hover:opacity-75 z-10"
                  }`}
                >
                  <article
                    className={`relative rounded-[24px] glass-panel p-8 sm:p-9 flex flex-col justify-between h-full min-h-[300px] border transition-all duration-300 ${
                      isCenter
                        ? "border-(--primary)/50 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_35px_rgba(212,175,55,0.18)] bg-[#141414]/90"
                        : "border-white/10 bg-[#101010]/60"
                    } hover:-translate-y-1.5`}
                  >
                    <div className="absolute top-4 right-6 text-white/5 pointer-events-none ">
                      <Quote size={64} />
                    </div>

                    <div>
                      <div
                        className="flex items-center gap-1.5 mb-5"
                        aria-label="5 out of 5 stars"
                      >
                        {Array.from({ length: data.rating }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className="fill-[var(--primary)] text-primary"
                          />
                        ))}
                      </div>

                      <p className="text-base sm:text-lg text-zinc-200 leading-relaxed font-sans italic mb-6 relative z-10">
                        &ldquo;{data.reviewText}&rdquo;
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-bold text-white tracking-tight font-sans">
                          {data.customerName}
                        </h4>
                        <span className="text-xs font-mono font-semibold text-muted uppercase tracking-wider block">
                          {data.designation}
                        </span>
                      </div>

                      <span className="text-xs font-mono text-(--primary)/80 font-medium">
                        {data.company || "Aegis training academy"}
                      </span>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div> */}

        <div
          ref={carouselFrameRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="w-full relative max-w-300 mx-auto min-h-85 flex items-center justify-center mb-10"
        >
          {isLoading ? (
            <p className="text-sm text-zinc-400">Loading testimonials...</p>
          ) : visibleCards.length === 0 ? (
            <p className="text-sm text-zinc-400">No testimonials available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center w-full">
              {visibleCards.map(({ data, position }) => {
                const isCenter = position === "center";

                return (
                  <div
                    key={`${data.id}-${position}`}
                    className={`transition-all duration-500 ease-out transform ${
                      isCenter
                        ? "scale-100 md:scale-105 opacity-100 z-20"
                        : "hidden md:block scale-95 opacity-50 hover:opacity-75 z-10"
                    }`}
                  >
                    <article
                      className={`relative rounded-3xl glass-panel p-8 sm:p-9 flex flex-col justify-between h-full min-h-75 border transition-all duration-300 ${
                        isCenter
                          ? "border-primary/50 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_35px_rgba(212,175,55,0.18)] bg-[#141414]/90"
                          : "border-white/10 bg-[#101010]/60"
                      } hover:-translate-y-1.5`}
                    >
                      <div className="absolute top-4 right-6 text-white/5 pointer-events-none ">
                        <Quote size={64} />
                      </div>

                      <div>
                        <div
                          className="flex items-center gap-1.5 mb-5"
                          aria-label={`${data.rating} out of 5 stars`}
                        >
                          {Array.from({
                            length: data.rating,
                          }).map((_, index) => (
                            <Star
                              key={index}
                              size={16}
                              className="fill-primary text-primary"
                            />
                          ))}
                        </div>

                        <p className="text-base sm:text-lg text-zinc-200 leading-relaxed font-sans italic mb-6 relative z-10">
                          &ldquo;{data.reviewText}&rdquo;
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-bold text-white tracking-tight font-sans">
                            {data.customerName}
                          </h4>

                          <span className="text-xs font-mono font-semibold text-muted uppercase tracking-wider block">
                            {data.designation || "Aegis Academy Student"}
                          </span>
                        </div>

                        <span className="text-xs font-mono text-primary/80 font-medium">
                          {data.company || "Aegis Trading Academy"}
                        </span>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CAROUSEL CONTROLS: ARROWS + PAGINATION DOTS */}

        <div ref={controlsRef} className="flex items-center gap-6">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            aria-label="Previous Testimonial"
            className="w-11 h-11 rounded-full glass-panel border border-white/15 flex items-center justify-center text-white hover:text-primary hover:border-primary/50 hover:scale-110 active:scale-95 transition-all duration-300 shadow-md cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Navigation Dots */}
          <div
            className="flex items-center gap-2.5"
            aria-label="Testimonial Carousel Pagination"
          >
            {testimonials.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to testimonial ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "w-8 bg-primary shadow-[0_0_12px_rgba(212,175,55,0.6)]"
                      : "w-2.5 bg-white/20 hover:bg-white/40"
                  }`}
                />
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            aria-label="Next Testimonial"
            className="w-11 h-11 rounded-full glass-panel border border-white/15 flex items-center justify-center text-white hover:text-primary hover:border-primary/50 hover:scale-110 active:scale-95 transition-all duration-300 shadow-md cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
