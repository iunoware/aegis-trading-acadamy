"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import {
  Plus,
  Search,
  Filter,
  ArrowLeft,
  Video,
  Clock,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Upload,
  Folder,
  Layers,
  X,
  Check,
  Play,
  FileQuestion,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

// ============================================================================
// DATA MODELS & MOCK DATA
// ============================================================================

export interface VideoItem {
  id: string;
  title: string;
  videoUrl: string;
  duration: string;
  thumbnail?: string;
  isPreview: boolean;
  order: number;
}

export interface Course {
  id: string;
  name: string;
  coverImage: string;
  description: string;
  status: "Draft" | "Published";
  createdAt: string;
  updatedAt: string;
  videos: VideoItem[];
}

const INITIAL_COURSES: Course[] = [
  {
    id: "crs-1",
    name: "Introduction to Trading",
    coverImage: "/images/cert-nism.png",
    description:
      "Fundamental market concepts, trading terminology, order types, and discipline basics.",
    status: "Published",
    createdAt: "10 Jul 2026",
    updatedAt: "28 Jul 2026",
    videos: [
      {
        id: "vid-1",
        title: "What is Trading?",
        videoUrl: "https://vimeo.com/sample-1",
        duration: "18 min",
        isPreview: true,
        order: 1,
      },
      {
        id: "vid-2",
        title: "Types of Trading & Market Participants",
        videoUrl: "https://vimeo.com/sample-2",
        duration: "22 min",
        isPreview: false,
        order: 2,
      },
      {
        id: "vid-3",
        title: "Market Sessions & Timing Dynamics",
        videoUrl: "https://vimeo.com/sample-3",
        duration: "15 min",
        isPreview: false,
        order: 3,
      },
    ],
  },
  {
    id: "crs-2",
    name: "Price Action & Order Flow",
    coverImage: "/images/cert-cmt.png",
    description:
      "Master institutional liquidity pools, order blocks, premium/discount arrays, and entry models.",
    status: "Published",
    createdAt: "15 Jul 2026",
    updatedAt: "30 Jul 2026",
    videos: [
      {
        id: "vid-4",
        title: "Understanding Market Structure & Trend Shifts",
        videoUrl: "https://vimeo.com/sample-4",
        duration: "24 min",
        isPreview: true,
        order: 1,
      },
      {
        id: "vid-5",
        title: "Identifying Order Blocks & Fair Value Gaps",
        videoUrl: "https://vimeo.com/sample-5",
        duration: "30 min",
        isPreview: false,
        order: 2,
      },
    ],
  },
  {
    id: "crs-3",
    name: "Options Trading Blueprint",
    coverImage: "/images/cert-cfa.png",
    description:
      "Options Greeks, Delta hedging, IV crush, and high-probability directional scalping setups.",
    status: "Published",
    createdAt: "18 Jul 2026",
    updatedAt: "31 Jul 2026",
    videos: [
      {
        id: "vid-6",
        title: "Options Fundamentals & Call/Put Mechanics",
        videoUrl: "https://vimeo.com/sample-6",
        duration: "20 min",
        isPreview: true,
        order: 1,
      },
    ],
  },
  {
    id: "crs-4",
    name: "Swing Trading Strategies",
    coverImage: "/images/cert-nism.png",
    description:
      "Multi-day trend holding, breakout confirmations, position sizing, and trailing stop strategies.",
    status: "Draft",
    createdAt: "22 Jul 2026",
    updatedAt: "22 Jul 2026",
    videos: [],
  },
  {
    id: "crs-5",
    name: "Risk Management & Psychology",
    coverImage: "/images/cert-cmt.png",
    description:
      "Capital preservation protocols, max daily loss limits, risk-reward ratios, and emotional discipline.",
    status: "Published",
    createdAt: "25 Jul 2026",
    updatedAt: "29 Jul 2026",
    videos: [],
  },
];

export default function CourseCMS() {
  const containerRef = useRef<HTMLDivElement>(null);

  // State Management
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Published" | "Draft">("All");

  // Modals State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);

  // Form Fields State - Course Modal
  const [courseName, setCourseName] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseCover, setCourseCover] = useState("/images/cert-nism.png");
  const [courseStatus, setCourseStatus] = useState<"Draft" | "Published">("Published");

  // Form Fields State - Video Modal
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState("15 min");
  const [videoIsPreview, setVideoIsPreview] = useState(false);
  const [videoOrder, setVideoOrder] = useState(1);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current.children,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.08,
            ease: "power2.out",
          },
        );
      }
    }, [activeCourseId, isCourseModalOpen, isVideoModalOpen]);

    return () => ctx.revert();
  }, [activeCourseId, isCourseModalOpen, isVideoModalOpen]);

  // Active course object
  const activeCourse = courses.find((c) => c.id === activeCourseId) || null;

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Course Handlers
  const handleOpenCreateCourse = () => {
    setEditingCourse(null);
    setCourseName("");
    setCourseDesc("");
    setCourseCover("/images/cert-nism.png");
    setCourseStatus("Published");
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (e: React.MouseEvent, c: Course) => {
    e.stopPropagation();
    setEditingCourse(c);
    setCourseName(c.name);
    setCourseDesc(c.description);
    setCourseCover(c.coverImage);
    setCourseStatus(c.status);
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = () => {
    if (!courseName.trim()) {
      toast.error("Course name is required");
      return;
    }

    if (editingCourse) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === editingCourse.id
            ? {
                ...c,
                name: courseName,
                description: courseDesc,
                coverImage: courseCover,
                status: courseStatus,
                updatedAt: "Today",
              }
            : c,
        ),
      );
      toast.success("Course updated successfully");
    } else {
      const newCourse: Course = {
        id: "crs-" + Date.now(),
        name: courseName,
        coverImage: courseCover || "/images/cert-nism.png",
        description: courseDesc,
        status: courseStatus,
        createdAt: "Today",
        updatedAt: "Today",
        videos: [],
      };
      setCourses((prev) => [newCourse, ...prev]);
      toast.success("Course created successfully");
    }

    setIsCourseModalOpen(false);
  };

  const handleDeleteCourse = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    toast.info("Course deleted");
    if (activeCourseId === courseId) setActiveCourseId(null);
  };

  // Video Handlers
  const handleOpenCreateVideo = () => {
    if (!activeCourse) return;
    setEditingVideo(null);
    setVideoTitle("");
    setVideoUrl("https://vimeo.com/sample");
    setVideoDuration("15 min");
    setVideoIsPreview(false);
    setVideoOrder(activeCourse.videos.length + 1);
    setIsVideoModalOpen(true);
  };

  const handleOpenEditVideo = (v: VideoItem) => {
    setEditingVideo(v);
    setVideoTitle(v.title);
    setVideoUrl(v.videoUrl);
    setVideoDuration(v.duration);
    setVideoIsPreview(v.isPreview);
    setVideoOrder(v.order);
    setIsVideoModalOpen(true);
  };

  const handleSaveVideo = () => {
    if (!activeCourseId || !videoTitle.trim()) {
      toast.error("Video title is required");
      return;
    }

    if (editingVideo) {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id === activeCourseId) {
            return {
              ...c,
              videos: c.videos.map((v) =>
                v.id === editingVideo.id
                  ? {
                      ...v,
                      title: videoTitle,
                      videoUrl,
                      duration: videoDuration,
                      isPreview: videoIsPreview,
                      order: videoOrder,
                    }
                  : v,
              ),
            };
          }
          return c;
        }),
      );
      toast.success("Video updated");
    } else {
      const newVideo: VideoItem = {
        id: "vid-" + Date.now(),
        title: videoTitle,
        videoUrl,
        duration: videoDuration,
        isPreview: videoIsPreview,
        order: videoOrder,
      };
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id === activeCourseId) {
            return { ...c, videos: [...c.videos, newVideo] };
          }
          return c;
        }),
      );
      toast.success("Video added to course");
    }

    setIsVideoModalOpen(false);
  };

  const handleDeleteVideo = (videoId: string) => {
    if (!activeCourseId) return;
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === activeCourseId) {
          return {
            ...c,
            videos: c.videos.filter((v) => v.id !== videoId),
          };
        }
        return c;
      }),
    );
    toast.info("Video deleted");
  };

  return (
    <div ref={containerRef} className="w-full max-w-[1400px] mx-auto space-y-6 pb-16 ">
      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: COURSES LIST VIEW (When activeCourseId is null) */}
      {/* ------------------------------------------------------------- */}
      {!activeCourseId && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 text-[10px] font-mono tracking-widest text-[#C9A227] uppercase mb-1">
                <ShieldCheck size={12} />
                ACADEMY CMS
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight">
                Courses
              </h1>
              <p className="text-xs text-zinc-400 mt-1">Manage all academy courses.</p>
            </div>

            <button
              onClick={handleOpenCreateCourse}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] text-black shadow-[0_0_20px_rgba(201,162,39,0.35)] hover:shadow-[0_0_30px_rgba(201,162,39,0.55)] transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
            >
              <Plus size={16} className="stroke-3" />
              <span>Add Course</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111113] border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#C9A227] transition-all"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                <Filter size={13} />
                Status:
              </span>
              {(["All", "Published", "Draft"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-[#C9A227] text-black shadow-md"
                      : "bg-[#111113] border border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => setActiveCourseId(course.id)}
                className="group rounded-2xl bg-[#111113]/90 backdrop-blur-xl border border-white/10 p-5 flex flex-col justify-between hover:border-[#C9A227]/40 hover:bg-[#141417] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer"
              >
                <div>
                  {/* Cover Image Frame */}
                  <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-black/80 border border-white/10 mb-4 group-hover:border-[#C9A227]/30 transition-colors">
                    <Image
                      src={course.coverImage}
                      alt={course.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 pointer-events-none" />

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border shadow-md ${
                          course.status === "Published"
                            ? "bg-[#C9A227]/20 text-[#C9A227] border-[#C9A227]/40"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>

                    {/* Video Count Badge */}
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-mono text-white flex items-center gap-1.5">
                      <Video size={13} className="text-[#C9A227]" />
                      <span>{course.videos.length} Videos</span>
                    </div>
                  </div>

                  {/* Course Name */}
                  <h3 className="text-lg font-bold text-white font-sans group-hover:text-[#C9A227] transition-colors leading-snug mb-2 line-clamp-1">
                    {course.name}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-4">
                    {course.description}
                  </p>
                </div>

                {/* Footer & Actions */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                    <Calendar size={11} />
                    <span>{course.updatedAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleOpenEditCourse(e, course)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-[#C9A227]/20 text-zinc-300 hover:text-[#C9A227] transition-colors"
                      title="Edit Course"
                    >
                      <Edit size={14} />
                    </button>

                    <button
                      onClick={(e) => handleDeleteCourse(e, course.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 size={14} />
                    </button>

                    <span className="px-3 py-1 rounded-lg bg-[#C9A227]/10 border border-[#C9A227]/30 text-xs font-mono text-[#C9A227] font-semibold group-hover:bg-[#C9A227] group-hover:text-black transition-colors">
                      Open &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="rounded-2xl bg-[#111113]/80 border border-white/10 p-12 text-center flex flex-col items-center justify-center">
              <FileQuestion size={40} className="text-zinc-600 mb-3" />
              <h4 className="text-sm font-bold text-white">No Courses Found</h4>
              <p className="text-xs text-zinc-400 mt-1 mb-4">
                Create your first academy course to get started.
              </p>
              <button
                onClick={handleOpenCreateCourse}
                className="px-4 py-2 rounded-xl bg-[#C9A227] text-black font-bold text-xs shadow-md"
              >
                + Add Course
              </button>
            </div>
          )}
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 2: OPEN COURSE DETAIL VIEW (When activeCourse is selected) */}
      {/* ------------------------------------------------------------- */}
      {activeCourse && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveCourseId(null)}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-[#C9A227]/50 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A227] block mb-0.5">
                  COURSE DETAILS & VIDEOS
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight">
                  {activeCourse.name}
                </h1>
              </div>
            </div>

            <button
              onClick={handleOpenCreateVideo}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] text-black shadow-[0_0_20px_rgba(201,162,39,0.35)] hover:shadow-[0_0_30px_rgba(201,162,39,0.55)] transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
            >
              <Plus size={16} className="stroke-[3]" />
              <span>Add Video</span>
            </button>
          </div>

          {/* Course Banner Info Box */}
          <div className="rounded-2xl bg-[#111113]/90 backdrop-blur-xl border border-white/10 p-5 sm:p-6 flex flex-col md:flex-row items-center gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="relative w-full md:w-64 aspect-[16/10] rounded-xl overflow-hidden bg-black border border-white/10 shrink-0">
              <Image
                src={activeCourse.coverImage}
                alt={activeCourse.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30">
                  {activeCourse.status}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {activeCourse.videos.length} Videos Total
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
                {activeCourse.description}
              </p>
            </div>
          </div>

          {/* Videos List Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <Video size={18} className="text-[#C9A227]" />
                <span>Course Videos ({activeCourse.videos.length})</span>
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {activeCourse.videos.map((vid, idx) => (
                <div
                  key={vid.id}
                  className="rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#C9A227]/30 transition-all shadow-md group"
                >
                  {/* Left: Index, Play Thumbnail & Title */}
                  <div className="flex items-center gap-4">
                    <span className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 font-mono text-xs font-bold text-[#C9A227] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <div className="w-10 h-10 rounded-xl bg-black/60 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] shrink-0 group-hover:scale-105 transition-transform">
                      <Play size={16} fill="currentColor" />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white font-sans group-hover:text-[#C9A227] transition-colors">
                        {vid.title}
                      </h4>
                      <span className="text-xs font-mono text-zinc-400">
                        {vid.videoUrl}
                      </span>
                    </div>
                  </div>

                  {/* Right: Duration, Preview Badge & Actions */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="flex items-center gap-1 text-xs font-mono text-zinc-400">
                      <Clock size={13} />
                      <span>{vid.duration}</span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border ${
                        vid.isPreview
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                      }`}
                    >
                      {vid.isPreview ? "Preview ON" : "Preview OFF"}
                    </span>

                    <button
                      onClick={() => handleOpenEditVideo(vid)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#C9A227]/20 text-zinc-300 hover:text-[#C9A227] border border-white/10 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteVideo(vid.id)}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Video"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}

              {activeCourse.videos.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs font-mono text-zinc-500">
                  No videos added to this course yet. Click &quot;Add Video&quot; above to
                  upload video content.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: CREATE / EDIT COURSE MODAL */}
      {/* ------------------------------------------------------------- */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#111113] border border-[#C9A227]/30 p-6 flex flex-col gap-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white font-sans">
                {editingCourse ? "Edit Course" : "Create New Course"}
              </h3>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Course Form Fields */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Price Action & Liquidity"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#09090b] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="Brief summary of course content..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#09090b] border border-white/15 text-xs text-white focus:outline-none focus:border-[#C9A227] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Status
                </label>
                <div className="flex items-center gap-3">
                  {(["Published", "Draft"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setCourseStatus(st)}
                      className={`flex-1 py-2 rounded-xl text-xs font-mono font-semibold border cursor-pointer transition-colors ${
                        courseStatus === st
                          ? "bg-[#C9A227]/20 border-[#C9A227] text-[#C9A227]"
                          : "bg-black/40 border-white/10 text-zinc-400"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/15 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCourse}
                className="px-5 py-2 rounded-xl bg-[#C9A227] text-black font-bold text-xs shadow-md hover:bg-[#e6c55a] transition-colors cursor-pointer"
              >
                {editingCourse ? "Save Changes" : "Create Course"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: ADD / EDIT VIDEO MODAL */}
      {/* ------------------------------------------------------------- */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#111113] border border-[#C9A227]/30 p-6 flex flex-col gap-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white font-sans">
                {editingVideo ? "Edit Video" : "Add New Video"}
              </h3>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Video Form Fields */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. What is Trading?"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#09090b] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Video URL / Stream Embed Link
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://vimeo.com/123456"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#09090b] border border-white/15 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    placeholder="18 min"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#09090b] border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-[#C9A227]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                    Video Order
                  </label>
                  <input
                    type="number"
                    value={videoOrder}
                    onChange={(e) => setVideoOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#09090b] border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
              </div>

              {/* Free Preview Toggle */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Free Preview</div>
                  <div className="text-[11px] text-zinc-400">
                    Allow non-enrolled users to watch this lesson.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setVideoIsPreview(!videoIsPreview)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                    videoIsPreview ? "bg-[#C9A227]" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-black shadow-md transition-transform ${
                      videoIsPreview ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/15 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVideo}
                className="px-5 py-2 rounded-xl bg-[#C9A227] text-black font-bold text-xs shadow-md hover:bg-[#e6c55a] transition-colors cursor-pointer"
              >
                {editingVideo ? "Save Video" : "Add Video"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
