/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import axios from "axios";
import {
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  ArrowLeft,
  Check,
  Clock3,
  Lock,
  Play,
  Pause,
  PlayCircle,
  Video,
  Loader2,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
} from "lucide-react";

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

type WatermarkPosition = "bottom-left" | "bottom-right" | "top-left" | "top-right";

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

/* Used inside the custom player for live playback time (fractional seconds) */
function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${mins}:${secs.toString().padStart(2, "0")}`;
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

/*
 * Custom Video Player - YouTube-style controls, fully self
 * contained. Parent only supplies the blob src + a watermark
 * node to render as an overlay.
 */

interface CustomVideoPlayerProps {
  src: string;
  watermark?: React.ReactNode;
}

function CustomVideoPlayer({ src, watermark }: CustomVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isVolumeHover, setIsVolumeHover] = useState(false);
  const [hoverPreview, setHoverPreview] = useState<{ time: number; x: number } | null>(
    null,
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  /* Controls stay visible whenever paused, scrubbing, or the volume popover is open */
  const forceVisible = !isPlaying || isScrubbing || isVolumeHover;

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (!forceVisible) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [forceVisible]);

  useEffect(() => {
    if (forceVisible) {
      setShowControls(true);

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      resetControlsTimer();
    }
  }, [forceVisible]);

  /* Wire up native video element events */
  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => setDuration(video.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => {
      setIsMuted(video.muted);
      setVolume(video.volume);
    };
    const onEnded = () => {
      setIsPlaying(false);
      video.currentTime = 0;
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("ended", onEnded);
    };
  }, [src]);

  /* Fullscreen state (also covers pressing Esc) */
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused || video.ended) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = !video.muted;

    if (!video.muted && video.volume === 0) {
      video.volume = 0.5;
    }
  }, []);

  const changeVolume = useCallback((value: number) => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const clamped = Math.min(1, Math.max(0, value));

    video.volume = clamped;
    video.muted = clamped === 0;
  }, []);

  const skip = useCallback(
    (seconds: number) => {
      const video = videoRef.current;

      if (!video) {
        return;
      }

      video.currentTime = Math.min(
        video.duration || 0,
        Math.max(0, video.currentTime + seconds),
      );

      resetControlsTimer();
    },
    [resetControlsTimer],
  );

  const timeFromClientX = useCallback(
    (clientX: number) => {
      const bar = progressBarRef.current;

      if (!bar || !duration) {
        return 0;
      }

      const rect = bar.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));

      return ratio * duration;
    },
    [duration],
  );

  const handleProgressMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) {
      return;
    }

    const time = timeFromClientX(event.clientX);
    const x = event.clientX - progressBarRef.current.getBoundingClientRect().left;

    setHoverPreview({ time, x });
  };

  const handleProgressMouseLeave = () => {
    if (!isScrubbing) {
      setHoverPreview(null);
    }
  };

  const handleScrubStart = (event: ReactMouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;

    setIsScrubbing(true);

    const time = timeFromClientX(event.clientX);

    if (video) {
      video.currentTime = time;
    }

    setCurrentTime(time);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const t = timeFromClientX(moveEvent.clientX);

      if (video) {
        video.currentTime = t;
      }

      setCurrentTime(t);

      if (progressBarRef.current) {
        setHoverPreview({
          time: t,
          x: moveEvent.clientX - progressBarRef.current.getBoundingClientRect().left,
        });
      }
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
      setHoverPreview(null);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      container.requestFullscreen().catch(() => {});
    }
  }, []);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case " ":
      case "k":
      case "K":
        event.preventDefault();
        togglePlay();
        break;
      case "ArrowRight":
        event.preventDefault();
        skip(5);
        break;
      case "ArrowLeft":
        event.preventDefault();
        skip(-5);
        break;
      case "ArrowUp":
        event.preventDefault();
        changeVolume((videoRef.current?.volume ?? 0) + 0.05);
        break;
      case "ArrowDown":
        event.preventDefault();
        changeVolume((videoRef.current?.volume ?? 0) - 0.05);
        break;
      case "m":
      case "M":
        toggleMute();
        break;
      case "f":
      case "F":
        toggleFullscreen();
        break;
      default:
        break;
    }

    resetControlsTimer();
  };

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => {
        if (!forceVisible) {
          setShowControls(false);
        }
      }}
      className="group/player relative h-full w-full bg-black outline-none"
    >
      <video
        ref={videoRef}
        src={src}
        preload="metadata"
        playsInline
        disablePictureInPicture
        onClick={togglePlay}
        onContextMenu={(event) => event.preventDefault()}
        className="h-full w-full cursor-pointer object-contain"
      >
        Your browser does not support the video element.
      </video>

      {watermark}

      {/* Big center play button, shown while paused */}
      {!isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play"
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 transition-colors"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-transform hover:scale-110">
            <Play size={30} className="ml-1 fill-current" />
          </span>
        </button>
      )}

      {/* Controls bar */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-black/90 via-black/50 to-transparent px-3 pb-2 pt-10 transition-opacity duration-300 sm:px-4 ${
          showControls ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* Progress / scrub bar */}
        <div
          ref={progressBarRef}
          onMouseMove={handleProgressMouseMove}
          onMouseLeave={handleProgressMouseLeave}
          onMouseDown={handleScrubStart}
          className="group/progress relative mb-2 flex h-3 w-full cursor-pointer items-center"
        >
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/25 transition-all group-hover/progress:h-1.5">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary opacity-0 shadow transition-opacity group-hover/progress:opacity-100"
            style={{ left: `${progress}%` }}
          />

          {hoverPreview && (
            <div
              className="pointer-events-none absolute -top-9 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 font-mono text-xs text-white"
              style={{ left: hoverPreview.x }}
            >
              {formatTime(hoverPreview.time)}
            </div>
          )}
        </div>

        {/* Control row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:text-primary"
            >
              {isPlaying ? (
                <Pause size={20} className="fill-current" />
              ) : (
                <Play size={20} className="ml-0.5 fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={() => skip(-10)}
              aria-label="Rewind 10 seconds"
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:text-primary"
            >
              <RotateCcw size={19} />
              <span className="pointer-events-none absolute text-[8px] font-bold">
                10
              </span>
            </button>

            <button
              type="button"
              onClick={() => skip(10)}
              aria-label="Forward 10 seconds"
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:text-primary"
            >
              <RotateCw size={19} />
              <span className="pointer-events-none absolute text-[8px] font-bold">
                10
              </span>
            </button>

            <div
              className="flex items-center"
              onMouseEnter={() => setIsVolumeHover(true)}
              onMouseLeave={() => setIsVolumeHover(false)}
            >
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:text-primary"
              >
                <VolumeIcon size={19} />
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isVolumeHover ? "w-16 sm:w-20" : "w-0"
                }`}
              >
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(event) => changeVolume(parseFloat(event.target.value))}
                  className="h-1 w-16 cursor-pointer accent-primary sm:w-20"
                  aria-label="Volume"
                />
              </div>
            </div>

            <span className="ml-1 hidden font-mono text-xs text-zinc-300 sm:inline">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-zinc-300 sm:hidden">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:text-primary"
            >
              {isFullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
            </button>
          </div>
        </div>
      </div>
    </div>
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

  /*
   * Blob URL state for the currently loaded video.
   * We fetch the video ourselves (with credentials) instead of
   * pointing <video src> directly at the streaming route, so the
   * real endpoint never appears in "copy video address" / view-source.
   */
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  /*
   * Tracks the blob URL + abort controller for the in-flight fetch
   * so we can cancel/revoke correctly when the lesson changes fast.
   */
  const currentBlobUrlRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /*
   * Watermark: identifies which student is watching, so if a
   * screen recording leaks, we know whose account to suspend.
   */
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkPosition, setWatermarkPosition] =
    useState<WatermarkPosition>("bottom-left");

  /*
   * Disable right click for entire page
   */
  useEffect(() => {
    const disableContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener("contextmenu", disableContextMenu);

    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
    };
  }, []);

  /*
   * Fetch the logged-in student's identity for the watermark
   */
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await axios.get("/api/auth/me");
        const user = response.data?.user;

        if (user) {
          setWatermarkText(user.email || user.id || "Unknown");
        }
      } catch (error) {
        console.error("Failed to fetch current user for watermark:", error);
      }
    }

    fetchCurrentUser();
  }, []);

  /*
   * Move the watermark to a different corner periodically so it
   * can't be reliably cropped out of a screen recording.
   */
  useEffect(() => {
    const positions: WatermarkPosition[] = [
      "bottom-left",
      "bottom-right",
      "top-left",
      "top-right",
    ];

    const interval = setInterval(() => {
      setWatermarkPosition((current) => {
        const currentIndex = positions.indexOf(current);
        const nextIndex = (currentIndex + 1) % positions.length;
        return positions[nextIndex];
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  /*
   * Fetch course
   */
  useEffect(() => {
    async function fetchCourse() {
      try {
        setLoading(true);

        const response = await axios.get("/api/courses");

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

  /*
   * Fetch the active lesson's video as a blob and point the
   * <video> element at an object URL instead of the raw
   * streaming endpoint. This keeps the real /api/stream/[id]
   * URL out of "copy video address", view-source, and share sheets.
   */
  useEffect(() => {
    if (!activeLesson) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }

    setVideoBlobUrl(null);
    setVideoLoadError(false);
    setDownloadProgress(null);
    setIsVideoLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function loadVideo() {
      try {
        const response = await fetch(`/api/stream/${activeLesson!.id}`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error("Failed to load video");
        }

        const contentLengthHeader = response.headers.get("Content-Length");
        const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let receivedBytes = 0;

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          if (value) {
            chunks.push(value);
            receivedBytes += value.length;

            if (totalBytes > 0) {
              setDownloadProgress(Math.round((receivedBytes / totalBytes) * 100));
            }
          }
        }

        const blob = new Blob(chunks as BlobPart[], { type: "video/mp4" });
        const objectUrl = URL.createObjectURL(blob);

        currentBlobUrlRef.current = objectUrl;
        setVideoBlobUrl(objectUrl);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Failed to load video:", error);
        setVideoLoadError(true);
      } finally {
        setIsVideoLoading(false);
      }
    }

    loadVideo();

    return () => {
      controller.abort();
    };
  }, [activeLesson?.id]);

  useEffect(() => {
    return () => {
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
    };
  }, []);

  const watermarkPositionClasses: Record<WatermarkPosition, string> = {
    "bottom-left": "bottom-3 left-3",
    "bottom-right": "bottom-3 right-3",
    "top-left": "top-3 left-3",
    "top-right": "top-3 right-3",
  };

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
              {course.title}
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              {course.description || "Explore the video lessons in this course."}
            </p>
          </div>

          {/* Video Player */}
          <div className="mb-10 overflow-hidden rounded-3xl border border-white/10 bg-[#101010]/80 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              {activeLesson && !videoLoadError ? (
                <>
                  {isVideoLoading && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/90">
                      <Loader2 size={32} className="animate-spin text-primary" />
                      <p className="text-sm text-zinc-400">
                        {downloadProgress !== null
                          ? `Loading video... ${downloadProgress}%`
                          : "Loading video..."}
                      </p>
                    </div>
                  )}

                  {videoBlobUrl && (
                    <CustomVideoPlayer
                      key={activeLesson.id}
                      src={videoBlobUrl}
                      watermark={
                        watermarkText ? (
                          <div
                            className={`pointer-events-none absolute z-20 rounded-md bg-black/40 px-2 py-1 font-mono text-[10px] text-white/50 backdrop-blur-sm transition-all duration-700 ${watermarkPositionClasses[watermarkPosition]}`}
                          >
                            {watermarkText}
                          </div>
                        ) : null
                      }
                    />
                  )}
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#0b0b0b]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                    <Video size={28} />
                  </div>
                  <p className="text-sm text-zinc-400">
                    {activeLesson
                      ? videoLoadError
                        ? "Failed to load video. Please try again."
                        : "Video unavailable"
                      : "No lessons available"}
                  </p>
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
