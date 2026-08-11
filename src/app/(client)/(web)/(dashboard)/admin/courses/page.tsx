/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
// "use client";

// import CourseCMS from "./CourseCMS";

// export default function AdminCoursesPage() {
//   return <CourseCMS />;
// }

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  X,
  Play,
  FileQuestion,
  ShieldCheck,
  Calendar,
  Loader2,
  UploadCloud,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
// import apiClient from "@/lib/axios";
import axios from "axios";

// Kept as local literal types (not imported from @/generated/prisma/client)
// so the Prisma client's runtime code never gets pulled into the browser bundle.
type ContentStatus = "DRAFT" | "PUBLISHED" | "HIDDEN";

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  videoUrl: string;
  durationSeconds: number;
  isPreview: boolean;
  displayOrder: number;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  status: ContentStatus;
  displayOrder: number;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

function formatDuration(seconds: number) {
  if (!seconds) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CourseCMS() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Data state
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "PUBLISHED" | "DRAFT">("All");

  // Course modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseThumbnail, setCourseThumbnail] = useState("");
  const [courseStatus, setCourseStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");

  // Video modal
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Lesson | null>(null);
  const [isSavingVideo, setIsSavingVideo] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoMode, setVideoMode] = useState<"upload" | "url">("upload");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDurationSeconds, setVideoDurationSeconds] = useState(0);
  const [videoIsPreview, setVideoIsPreview] = useState(false);

  const [courseThumbnailFile, setCourseThumbnailFile] = useState<File | null>(null);
  const [courseThumbnailPreview, setCourseThumbnailPreview] = useState<string>("");

  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const handleSaveCourse = async () => {
    if (!courseTitle.trim()) {
      toast.error("Course title is required");
      return;
    }

    const formData = new FormData();
    formData.append("title", courseTitle);
    formData.append("description", courseDesc);
    formData.append("status", courseStatus);
    if (courseThumbnailFile) formData.append("thumbnail", courseThumbnailFile);

    setIsSavingCourse(true);
    try {
      if (editingCourse) {
        const res = await axios.patch(`/api/admin/courses/${editingCourse.id}`, formData);
        setCourses((prev) =>
          prev.map((c) => (c.id === editingCourse.id ? { ...c, ...res.data.course } : c)),
        );
        toast.success(res.data.message);
      } else {
        const res = await axios.post("/api/admin/courses", formData);
        setCourses((prev) => [{ ...res.data.course, lessons: [] }, ...prev]);
        toast.success(res.data.message);
      }
      setIsCourseModalOpen(false);
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(msg || "Failed to save course");
    } finally {
      setIsSavingCourse(false);
    }
  };

  // Fetch courses from the DB
  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/admin/courses");
      setCourses(res.data.courses ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power2.out" },
        );
      }
    }, [activeCourseId, isCourseModalOpen, isVideoModalOpen, isLoading]);

    return () => ctx.revert();
  }, [activeCourseId, isCourseModalOpen, isVideoModalOpen, isLoading]);

  const activeCourse = courses.find((c) => c.id === activeCourseId) || null;

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  //  Course Handlers

  const handleOpenCreateCourse = () => {
    setEditingCourse(null);
    setCourseTitle("");
    setCourseDesc("");
    setCourseThumbnail("");
    setCourseStatus("PUBLISHED");
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (e: React.MouseEvent, c: Course) => {
    e.stopPropagation();
    setEditingCourse(c);
    setCourseTitle(c.title);
    setCourseDesc(c.description ?? "");
    setCourseThumbnail(c.thumbnailUrl ?? "");
    setCourseStatus(c.status === "HIDDEN" ? "DRAFT" : c.status);
    setIsCourseModalOpen(true);
  };

  // const handleSaveCourse = async () => {
  //   if (!courseTitle.trim()) {
  //     toast.error("Course title is required");
  //     return;
  //   }

  //   setIsSavingCourse(true);
  //   try {
  //     if (editingCourse) {
  //       const data = await apiClient.patch(`/admin/courses/${editingCourse.id}`, {
  //         title: courseTitle,
  //         description: courseDesc,
  //         thumbnailUrl: courseThumbnail,
  //         status: courseStatus,
  //       });
  //       setCourses((prev) =>
  //         prev.map((c) => (c.id === editingCourse.id ? { ...c, ...data.course } : c)),
  //       );
  //       toast.success(data.message);
  //     } else {
  //       const data = await apiClient.post("/admin/courses", {
  //         title: courseTitle,
  //         description: courseDesc,
  //         thumbnailUrl: courseThumbnail,
  //         status: courseStatus,
  //       });
  //       setCourses((prev) => [{ ...data.course, lessons: [] }, ...prev]);
  //       toast.success(data.message);
  //     }
  //     setIsCourseModalOpen(false);
  //   } catch (err) {
  //     toast.error(err instanceof Error ? err.message : "Failed to save course");
  //   } finally {
  //     setIsSavingCourse(false);
  //   }
  // };

  // const handleDeleteCourse = async (e: React.MouseEvent, courseId: string) => {
  //   e.stopPropagation();
  //   if (
  //     !window.confirm(
  //       "Delete this course and all its videos permanently? This cannot be undone.",
  //     )
  //   ) {
  //     return;
  //   }
  //   try {
  //     const res = await axios.delete(`/api/admin/courses/${courseId}`);
  //     setCourses((prev) => prev.filter((c) => c.id !== courseId));
  //     if (activeCourseId === courseId) setActiveCourseId(null);
  //     toast.success(res.data.message);
  //   } catch (err) {
  //     toast.error(err instanceof Error ? err.message : "Failed to delete course");
  //   }
  // };
  const handleDeleteCourse = (
    e: React.MouseEvent,
    courseId: string,
    courseTitle: string,
  ) => {
    e.stopPropagation();
    setConfirmModal({
      title: "Delete Course",
      message: `Delete "${courseTitle}" and all its videos permanently? This cannot be undone.`,
      onConfirm: async () => {
        try {
          const res = await axios.delete(`/api/admin/courses/${courseId}`);
          setCourses((prev) => prev.filter((c) => c.id !== courseId));
          if (activeCourseId === courseId) setActiveCourseId(null);
          toast.success(res.data.message);
        } catch (err) {
          toast.error(
            axios.isAxiosError(err)
              ? err.response?.data?.message
              : "Failed to delete course",
          );
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  // const handleDeleteVideo = (videoId: string, videoTitle: string) => {
  //   if (!activeCourseId) return;
  //   setConfirmModal({
  //     title: "Delete Video",
  //     message: `Delete "${videoTitle}" permanently? The uploaded file will also be removed.`,
  //     onConfirm: async () => {
  //       try {
  //         const res = await axios.delete(
  //           `/api/admin/courses/${activeCourseId}/lessons/${videoId}`,
  //         );
  //         setCourses((prev) =>
  //           prev.map((c) =>
  //             c.id === activeCourseId
  //               ? { ...c, lessons: c.lessons.filter((v) => v.id !== videoId) }
  //               : c,
  //           ),
  //         );
  //         toast.success(res.data.message);
  //       } catch (err) {
  //         toast.error(
  //           axios.isAxiosError(err)
  //             ? err.response?.data?.message
  //             : "Failed to delete video",
  //         );
  //       } finally {
  //         setConfirmModal(null);
  //       }
  //     },
  //   });
  // };

  //  Video Handlers

  const handleOpenCreateVideo = () => {
    if (!activeCourse) return;
    setEditingVideo(null);
    setVideoTitle("");
    setVideoMode("upload");
    setVideoUrl("");
    setVideoFile(null);
    setVideoDurationSeconds(0);
    setVideoIsPreview(false);
    setIsVideoModalOpen(true);
  };

  const handleOpenEditVideo = (v: Lesson) => {
    setEditingVideo(v);
    setVideoTitle(v.title);
    setVideoMode("url");
    setVideoUrl(v.videoUrl.startsWith("http") ? v.videoUrl : "");
    setVideoFile(null);
    setVideoDurationSeconds(v.durationSeconds);
    setVideoIsPreview(v.isPreview);
    setIsVideoModalOpen(true);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);

    // Client-side duration detection
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    tempVideo.onloadedmetadata = () => {
      URL.revokeObjectURL(tempVideo.src);
      if (Number.isFinite(tempVideo.duration)) {
        setVideoDurationSeconds(Math.round(tempVideo.duration));
      }
    };
    tempVideo.src = URL.createObjectURL(file);
  };

  const handleSaveVideo = async () => {
    if (!activeCourseId || !videoTitle.trim()) {
      toast.error("Video title is required");
      return;
    }

    // ---- Edit existing video (metadata/URL only, no re-upload) ----
    if (editingVideo) {
      setIsSavingVideo(true);
      try {
        const res = await axios.patch(
          `/api/admin/courses/${activeCourseId}/lessons/${editingVideo.id}`,
          {
            title: videoTitle,
            ...(videoMode === "url" && videoUrl.trim()
              ? { videoUrl: videoUrl.trim() }
              : {}),
            durationSeconds: videoDurationSeconds,
            isPreview: videoIsPreview,
          },
        );
        setCourses((prev) =>
          prev.map((c) =>
            c.id === activeCourseId
              ? {
                  ...c,
                  lessons: c.lessons.map((l) =>
                    l.id === editingVideo.id ? res.data.lesson : l,
                  ),
                }
              : c,
          ),
        );
        toast.success(res.data.message);
        setIsVideoModalOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update video");
      } finally {
        setIsSavingVideo(false);
      }
      return;
    }

    // ---- Create new video: upload ----
    if (videoMode === "upload") {
      if (!videoFile) {
        toast.error("Please choose a video file to upload");
        return;
      }
      setIsSavingVideo(true);
      try {
        const formData = new FormData();
        formData.append("file", videoFile);
        formData.append("title", videoTitle);
        formData.append("isPreview", String(videoIsPreview));
        formData.append("durationSeconds", String(videoDurationSeconds));

        const res = await axios.post(
          `/api/admin/courses/${activeCourseId}/lessons/upload`,
          formData,
          // Let the browser set the multipart boundary itself
          // { headers: { "Content-Type": undefined } },
        );

        setCourses((prev) =>
          prev.map((c) =>
            c.id === activeCourseId
              ? { ...c, lessons: [...c.lessons, res.data.lesson] }
              : c,
          ),
        );
        toast.success(res.data.message);
        setIsVideoModalOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to upload video");
      } finally {
        setIsSavingVideo(false);
      }
      return;
    }

    // ---- Create new video: URL ----
    if (!videoUrl.trim()) {
      toast.error("Video URL is required");
      return;
    }
    setIsSavingVideo(true);
    try {
      const res = await axios.post(`/api/admin/courses/${activeCourseId}/lessons`, {
        title: videoTitle,
        videoUrl: videoUrl.trim(),
        durationSeconds: videoDurationSeconds,
        isPreview: videoIsPreview,
      });
      setCourses((prev) =>
        prev.map((c) =>
          c.id === activeCourseId
            ? { ...c, lessons: [...c.lessons, res.data.lesson] }
            : c,
        ),
      );
      toast.success(res.data.message);
      setIsVideoModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add video");
    } finally {
      setIsSavingVideo(false);
    }
  };

  const handleDeleteVideo = (videoId: string, videoTitle: string) => {
    if (!activeCourseId) return;
    setConfirmModal({
      title: "Delete Video",
      message: `Delete "${videoTitle}" permanently? The uploaded file will also be removed.`,
      onConfirm: async () => {
        try {
          const res = await axios.delete(
            `/api/admin/courses/${activeCourseId}/lessons/${videoId}`,
          );
          setCourses((prev) =>
            prev.map((c) =>
              c.id === activeCourseId
                ? { ...c, lessons: c.lessons.filter((v) => v.id !== videoId) }
                : c,
            ),
          );
          toast.success(res.data.message);
        } catch (err) {
          toast.error(
            axios.isAxiosError(err)
              ? err.response?.data?.message
              : "Failed to delete video",
          );
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  //  Render

  if (isLoading) {
    return (
      <div className="w-full max-w-350 mx-auto flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={28} className="text-[#C9A227] animate-spin" />
        <p className="text-xs font-mono text-zinc-400">Loading courses...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full max-w-350 mx-auto space-y-6 pb-16 ">
      {/* VIEW 1: COURSES LIST VIEW */}

      {!activeCourseId && (
        <>
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
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] text-black shadow-[0_0_20px_rgba(201,162,39,0.35)] hover:shadow-[0_0_30px_rgba(201,162,39,0.55)] transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
            >
              <Plus size={16} className="stroke-3" />
              <span>Add Course</span>
            </button>
          </div>

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
              {(["All", "PUBLISHED", "DRAFT"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-[#C9A227] text-black shadow-md"
                      : "bg-[#111113] border border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {st === "All" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => setActiveCourseId(course.id)}
                className="group rounded-2xl bg-[#111113]/90 backdrop-blur-xl border border-white/10 p-5 flex flex-col justify-between hover:border-[#C9A227]/40 hover:bg-[#141417] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer"
              >
                <div>
                  <div className="relative w-full aspect-16/10 rounded-xl overflow-hidden bg-black/80 border border-white/10 mb-4 group-hover:border-[#C9A227]/30 transition-colors">
                    <Image
                      src={course.thumbnailUrl || "/images/cert-nism.png"}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-60 pointer-events-none" />

                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border shadow-md ${
                          course.status === "PUBLISHED"
                            ? "bg-[#C9A227]/20 text-[#C9A227] border-[#C9A227]/40"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {course.status.charAt(0) + course.status.slice(1).toLowerCase()}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-mono text-white flex items-center gap-1.5">
                      <Video size={13} className="text-[#C9A227]" />
                      <span>{course.lessons.length} Videos</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white font-sans group-hover:text-[#C9A227] transition-colors leading-snug mb-2 line-clamp-1">
                    {course.title}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-4">
                    {course.description || "No description yet."}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                    <Calendar size={11} />
                    <span>{formatDate(course.updatedAt)}</span>
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
                      // onClick={(e) => handleDeleteCourse(e, course.id)}
                      onClick={(e) => handleDeleteCourse(e, course.id, course.title)}
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
                {courses.length === 0
                  ? "Create your first academy course to get started."
                  : "Try adjusting your search or filter."}
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

      {/* VIEW 2: COURSE DETAIL VIEW */}

      {activeCourse && (
        <div className="space-y-6">
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
                  {activeCourse.title}
                </h1>
              </div>
            </div>

            <button
              onClick={handleOpenCreateVideo}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-linear-to-r from-[#e6c55a] via-[#C9A227] to-[#8f6b12] text-black shadow-[0_0_20px_rgba(201,162,39,0.35)] hover:shadow-[0_0_30px_rgba(201,162,39,0.55)] transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
            >
              <Plus size={16} className="stroke-3" />
              <span>Add Video</span>
            </button>
          </div>

          <div className="rounded-2xl bg-[#111113]/90 backdrop-blur-xl border border-white/10 p-5 sm:p-6 flex flex-col md:flex-row items-center gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="relative w-full md:w-64 aspect-16/10 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0">
              <Image
                src={activeCourse.thumbnailUrl || "/images/cert-nism.png"}
                alt={activeCourse.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30">
                  {activeCourse.status.charAt(0) +
                    activeCourse.status.slice(1).toLowerCase()}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {activeCourse.lessons.length} Videos Total
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
                {activeCourse.description || "No description yet."}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <Video size={18} className="text-[#C9A227]" />
                <span>Course Videos ({activeCourse.lessons.length})</span>
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {activeCourse.lessons
                .slice()
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((vid, idx) => (
                  <div
                    key={vid.id}
                    className="rounded-2xl bg-[#111113]/80 backdrop-blur-xl border border-white/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#C9A227]/30 transition-all shadow-md group"
                  >
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
                          {vid.videoUrl.startsWith("http")
                            ? vid.videoUrl
                            : "Uploaded file"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="flex items-center gap-1 text-xs font-mono text-zinc-400">
                        <Clock size={13} />
                        <span>{formatDuration(vid.durationSeconds)}</span>
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
                        // onClick={() => handleDeleteVideo(vid.id)}
                        onClick={() => handleDeleteVideo(vid.id, vid.title)}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Video"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}

              {activeCourse.lessons.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs font-mono text-zinc-500">
                  No videos added to this course yet. Click &quot;Add Video&quot; above to
                  upload video content.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE / EDIT COURSE */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-500 rounded-2xl bg-[#111113] border border-[#C9A227]/30 p-6 flex flex-col gap-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
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

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
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

              {/* <div>
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  value={courseThumbnail}
                  onChange={(e) => setCourseThumbnail(e.target.value)}
                  placeholder="/images/course-cover.png or https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#09090b] border border-white/15 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#C9A227]"
                />
              </div> */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Course Thumbnail
                </label>
                {courseThumbnailPreview && (
                  <div className="relative w-full aspect-16/10 rounded-xl overflow-hidden bg-black border border-white/10 mb-2">
                    <Image
                      src={courseThumbnailPreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setCourseThumbnailFile(file);
                    setCourseThumbnailPreview(URL.createObjectURL(file));
                  }}
                  className="w-full text-xs text-zinc-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#C9A227] file:text-black hover:file:bg-[#e6c55a] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Status
                </label>
                <div className="flex items-center gap-3">
                  {(["PUBLISHED", "DRAFT"] as const).map((st) => (
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
                      {st.charAt(0) + st.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setIsCourseModalOpen(false)}
                disabled={isSavingCourse}
                className="px-4 py-2 rounded-xl border border-white/15 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCourse}
                disabled={isSavingCourse}
                className="px-5 py-2 rounded-xl bg-[#C9A227] text-black font-bold text-xs shadow-md hover:bg-[#e6c55a] transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2"
              >
                {isSavingCourse && <Loader2 size={13} className="animate-spin" />}
                {editingCourse ? "Save Changes" : "Create Course"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT VIDEO */}
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

              {!editingVideo && (
                <div className="flex items-center gap-2 p-1 rounded-xl bg-black/40 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setVideoMode("upload")}
                    className={`flex-1 py-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      videoMode === "upload"
                        ? "bg-[#C9A227] text-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <UploadCloud size={13} />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoMode("url")}
                    className={`flex-1 py-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      videoMode === "url"
                        ? "bg-[#C9A227] text-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <LinkIcon size={13} />
                    Paste URL
                  </button>
                </div>
              )}

              {(editingVideo ? videoMode === "url" : videoMode === "url") && (
                <div>
                  <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                    Video URL
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://vimeo.com/123456"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#09090b] border border-white/15 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
              )}

              {!editingVideo && videoMode === "upload" && (
                <div>
                  <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                    Video File
                  </label>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                    onChange={handleVideoFileChange}
                    className="w-full text-xs text-zinc-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#C9A227] file:text-black hover:file:bg-[#e6c55a] cursor-pointer"
                  />
                  {videoFile && (
                    <p className="text-[11px] text-zinc-500 mt-1.5 font-mono">
                      {videoFile.name} · {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  )}
                </div>
              )}

              {editingVideo &&
                editingVideo.videoUrl &&
                !editingVideo.videoUrl.startsWith("http") && (
                  <p className="text-[11px] text-zinc-500 font-mono">
                    This video was uploaded as a file. Replacing the file itself
                    isn&apos;t supported here yet — you can still update its title,
                    preview flag, and duration.
                  </p>
                )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={videoDurationSeconds}
                    onChange={(e) =>
                      setVideoDurationSeconds(Math.max(0, Number(e.target.value)))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#09090b] border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-[#C9A227]"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Auto-detected from the file when you upload; edit if needed.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                    Preview
                  </label>
                  <button
                    type="button"
                    onClick={() => setVideoIsPreview(!videoIsPreview)}
                    className={`w-full h-10.5 rounded-xl border text-xs font-mono font-semibold cursor-pointer transition-colors ${
                      videoIsPreview
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-black/40 border-white/10 text-zinc-400"
                    }`}
                  >
                    {videoIsPreview ? "Free Preview: ON" : "Free Preview: OFF"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setIsVideoModalOpen(false)}
                disabled={isSavingVideo}
                className="px-4 py-2 rounded-xl border border-white/15 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVideo}
                disabled={isSavingVideo}
                className="px-5 py-2 rounded-xl bg-[#C9A227] text-black font-bold text-xs shadow-md hover:bg-[#e6c55a] transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2"
              >
                {isSavingVideo && <Loader2 size={13} className="animate-spin" />}
                {editingVideo ? "Save Video" : "Add Video"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {confirmModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#111113] border border-rose-500/30 p-6 flex flex-col gap-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
            <div>
              <h3 className="text-lg font-bold text-white font-sans mb-2">
                {confirmModal.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {confirmModal.message}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl border border-white/15 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-md hover:bg-rose-600 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
