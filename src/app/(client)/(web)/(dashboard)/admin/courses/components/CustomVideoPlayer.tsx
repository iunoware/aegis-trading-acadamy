/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
} from "lucide-react";

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

interface CustomVideoPlayerProps {
  src: string;
  watermark?: ReactNode;
}

export function CustomVideoPlayer({ src, watermark }: CustomVideoPlayerProps) {
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

      <div
        className={`absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-black/90 via-black/50 to-transparent px-3 pb-2 pt-10 transition-opacity duration-300 sm:px-4 ${
          showControls ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
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
