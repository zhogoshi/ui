"use client";

import {
  Alert02Icon,
  FullScreenIcon,
  PauseIcon,
  PictureInPictureOnIcon,
  PlayIcon,
  RepeatIcon,
  Settings02Icon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeMute02Icon,
} from "@hugeicons-pro/core-solid-rounded";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { cn } from "../lib/cn";
import { CollapseScreenIcon } from "./collapse-screen-icon";
import { Icon, type AppIcon } from "./icon";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Slider } from "./slider";
import { Spinner } from "./spinner";
import { SPEEDS, VideoSettings, type SleepTimer, type VideoFit } from "./video-settings";

export interface VideoSource {
  src: string;
  label: string;
  type?: string;
}

export interface VideoPlayerProps {
  sources: VideoSource[];
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  loop?: boolean;
  preview?: boolean;
  className?: string;
}

const STORAGE = "hogoshi-player";
const FRAME = 1 / 30;
const IDLE_MS = 2600;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

const controlClass =
  "text-fg hover:bg-fg/10 inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none transition-colors duration-[var(--motion-duration)] focus-visible:ring-2 focus-visible:ring-ring";

function Control({ label, icon, onClick }: { label: string; icon: AppIcon; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} className={controlClass} onClick={onClick}>
      <Icon icon={icon} size={20} />
    </button>
  );
}

function readStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE) ?? "") as { volume: number; muted: boolean };
  } catch {
    return { volume: 1, muted: false };
  }
}

function useTimeline(video: RefObject<HTMLVideoElement | null>, duration: number) {
  const track = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLVideoElement>(null);
  const pending = useRef<number | null>(null);
  const busy = useRef(false);
  const resume = useRef(false);
  const [hover, setHover] = useState<{ time: number; x: number; width: number } | null>(null);
  const [hovering, setHovering] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);

  const measure = (clientX: number) => {
    const rect = track.current?.getBoundingClientRect();
    if (!rect || !duration) return null;
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return { time: ratio * duration, x: ratio * rect.width, width: rect.width };
  };

  const seekPreview = (time: number) => {
    const node = preview.current;
    if (!node) return;
    if (busy.current) {
      pending.current = time;
      return;
    }
    busy.current = true;
    node.currentTime = time;
  };

  const onPreviewSeeked = () => {
    busy.current = false;
    if (pending.current === null) return;
    const next = pending.current;
    pending.current = null;
    seekPreview(next);
  };

  const seekTo = (clientX: number) => {
    const point = measure(clientX);
    if (point && video.current) video.current.currentTime = point.time;
  };

  const handlers = {
    onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => {
      const point = measure(event.clientX);
      if (!point) return;
      setHover(point);
      setHovering(true);
      seekPreview(point.time);
      if (scrubbing) seekTo(event.clientX);
    },
    onPointerLeave: () => setHovering(false),
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      const node = video.current;
      resume.current = Boolean(node && !node.paused);
      node?.pause();
      setScrubbing(true);
      seekTo(event.clientX);
    },
    onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => {
      setScrubbing(false);
      if (event.pointerType !== "mouse") setHovering(false);
      if (resume.current) void video.current?.play();
    },
  };

  return { track, preview, hover, hovering, scrubbing, handlers, onPreviewSeeked };
}

export function VideoPlayer({
  sources,
  poster,
  title,
  autoPlay = false,
  loop: initialLoop = false,
  preview: showPreview = true,
  className,
}: VideoPlayerProps) {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const restore = useRef<{ time: number; playing: boolean } | null>(null);
  const [source, setSource] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState<[number, number][]>([]);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [loop, setLoop] = useState(initialLoop);
  const [sleep, setSleep] = useState<SleepTimer>(null);
  const [fit, setFit] = useState<VideoFit>("contain");
  const [waiting, setWaiting] = useState(false);
  const [ended, setEnded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [active, setActive] = useState(true);
  const [settings, setSettings] = useState(false);
  const [hint, setHint] = useState<{ id: number; text: string } | null>(null);
  const [flash, setFlash] = useState<{ id: number; icon: AppIcon } | null>(null);
  const timeline = useTimeline(video, duration);

  const src = sources[source]?.src ?? sources[0]?.src;
  const visible = active || !playing || settings || timeline.scrubbing || failed;

  useEffect(() => {
    const stored = readStored();
    setVolume(clamp(stored.volume, 0, 1));
    setMuted(stored.muted);
  }, []);

  useEffect(() => {
    const node = video.current;
    if (!node) return;
    node.volume = volume;
    node.muted = muted;
    localStorage.setItem(STORAGE, JSON.stringify({ volume, muted }));
  }, [volume, muted]);

  useEffect(() => {
    if (video.current) video.current.playbackRate = rate;
  }, [rate, source]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = () => {
      if (video.current) setCurrent(video.current.currentTime);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === root.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  useEffect(() => () => clearTimeout(idle.current), []);

  useEffect(() => {
    if (typeof sleep !== "number") return;
    const timer = setTimeout(() => {
      video.current?.pause();
      setSleep(null);
    }, sleep * 60_000);
    return () => clearTimeout(timer);
  }, [sleep]);

  const poke = useCallback(() => {
    setActive(true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setActive(false), IDLE_MS);
  }, []);

  const say = (text: string) => setHint({ id: Date.now(), text });

  const toggle = () => {
    const node = video.current;
    if (!node || failed) return;
    const next = node.paused || node.ended;
    if (next) void node.play();
    else node.pause();
    setFlash({ id: Date.now(), icon: next ? PlayIcon : PauseIcon });
  };

  const seekBy = (seconds: number, label = `${seconds > 0 ? "+" : "−"}${Math.abs(seconds)}s`) => {
    const node = video.current;
    if (!node) return;
    node.currentTime = clamp(node.currentTime + seconds, 0, node.duration || 0);
    setCurrent(node.currentTime);
    say(label);
  };

  const changeVolume = (next: number) => {
    const value = clamp(Math.round(next * 100) / 100, 0, 1);
    setVolume(value);
    setMuted(value === 0);
    say(`${Math.round(value * 100)}%`);
  };

  const changeRate = (next: number) => {
    setRate(next);
    say(`${next}×`);
  };

  const toggleFullscreen = () => {
    const node = root.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    const media = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (document.fullscreenElement) void document.exitFullscreen();
    else if (node?.requestFullscreen) void node.requestFullscreen();
    else media?.webkitEnterFullscreen?.();
  };

  const togglePip = () => {
    const node = video.current;
    if (!node || !document.pictureInPictureEnabled) return;
    if (document.pictureInPictureElement) void document.exitPictureInPicture();
    else void node.requestPictureInPicture();
  };

  const changeSource = (label: string) => {
    const index = sources.findIndex((item) => item.label === label);
    const node = video.current;
    if (index < 0 || index === source || !node) return;
    restore.current = { time: node.currentTime, playing: !node.paused };
    setSource(index);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (event.metaKey || event.ctrlKey || event.altKey || target.closest("input, [role=slider], [role=dialog]")) return;
    if (target instanceof HTMLButtonElement && (event.key === " " || event.key === "Enter")) return;
    const node = video.current;
    if (!node) return;
    const key = event.key.toLowerCase();
    const actions: Record<string, () => void> = {
      " ": toggle,
      k: toggle,
      f: toggleFullscreen,
      m: () => setMuted((value) => !value),
      i: togglePip,
      arrowleft: () => seekBy(-5),
      arrowright: () => seekBy(5),
      j: () => seekBy(-10),
      l: () => seekBy(10),
      arrowup: () => changeVolume(volume + 0.05),
      arrowdown: () => changeVolume(volume - 0.05),
      home: () => (node.currentTime = 0),
      end: () => (node.currentTime = node.duration),
      ",": () => node.paused && seekBy(-FRAME, "−1 frame"),
      ".": () => node.paused && seekBy(FRAME, "+1 frame"),
      "<": () => changeRate(SPEEDS[Math.max(0, SPEEDS.indexOf(rate) - 1)]),
      ">": () => changeRate(SPEEDS[Math.min(SPEEDS.length - 1, SPEEDS.indexOf(rate) + 1)]),
    };
    const action = /^[0-9]$/.test(key) ? () => (node.currentTime = (Number(key) / 10) * node.duration) : actions[key];
    if (!action) return;
    event.preventDefault();
    action();
    poke();
  };

  const volumeIcon = muted || volume === 0 ? VolumeMute02Icon : volume < 0.5 ? VolumeLowIcon : VolumeHighIcon;
  const played = duration ? (current / duration) * 100 : 0;
  const hover = timeline.hover;

  return (
    <div
      ref={root}
      data-mode="dark"
      tabIndex={0}
      aria-label={title ?? "Video player"}
      className={cn(
        "bg-bg text-fg group/player relative isolate aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] outline-none select-none focus-visible:ring-2 focus-visible:ring-ring",
        fullscreen && "rounded-none",
        !visible && "cursor-none",
        className,
      )}
      onPointerMove={poke}
      onPointerLeave={() => playing && setActive(false)}
      onKeyDown={onKeyDown}
    >
      <video
        ref={video}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop && sleep !== "end"}
        playsInline
        preload="metadata"
        className={cn("size-full", fit === "cover" ? "object-cover" : "object-contain")}
        onClick={toggle}
        onDoubleClick={toggleFullscreen}
        onPlay={() => {
          setPlaying(true);
          setEnded(false);
          poke();
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setEnded(true);
          if (sleep === "end") setSleep(null);
        }}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onCanPlay={() => setWaiting(false)}
        onError={() => setFailed(true)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onProgress={(event) => {
          const ranges = event.currentTarget.buffered;
          setBuffered(Array.from({ length: ranges.length }, (_, at) => [ranges.start(at), ranges.end(at)]));
        }}
        onLoadedMetadata={(event) => {
          const node = event.currentTarget;
          setFailed(false);
          node.volume = volume;
          node.muted = muted;
          node.playbackRate = rate;
          if (!restore.current) return;
          node.currentTime = restore.current.time;
          if (restore.current.playing) void node.play();
          restore.current = null;
        }}
      />

      {waiting && !failed ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <Spinner size="lg" className="bg-overlay rounded-full p-3" />
        </div>
      ) : null}

      {failed ? (
        <div className="bg-overlay absolute inset-0 grid place-items-center gap-2 text-center">
          <div className="grid justify-items-center gap-2">
            <Icon icon={Alert02Icon} size={28} className="text-danger" />
            <p className="text-sm">This video can’t be played</p>
          </div>
        </div>
      ) : null}

      {flash ? (
        <div key={flash.id} className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="bg-overlay grid size-16 animate-[player-flash_600ms_var(--motion-ease)_forwards] place-items-center rounded-full">
            <Icon icon={flash.icon} size={28} />
          </span>
        </div>
      ) : null}

      {hint ? (
        <p
          key={hint.id}
          className="bg-overlay pointer-events-none absolute top-[12%] left-1/2 -translate-x-1/2 animate-[player-flash_900ms_ease-out_forwards] rounded-full px-3 py-1 text-sm font-medium tabular-nums"
        >
          {hint.text}
        </p>
      ) : null}

      {title ? (
        <div
          className={cn(
            "from-overlay pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b to-transparent px-4 pt-3 pb-10 transition-opacity duration-[var(--motion-duration)]",
            visible ? "opacity-100" : "opacity-0",
          )}
        >
          <p className="truncate text-sm font-medium">{title}</p>
        </div>
      ) : null}

      <div
        className={cn(
          "from-overlay absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent px-3 pt-12 pb-[calc(0.25rem+var(--safe-bottom))] transition-opacity duration-[var(--motion-duration)] ease-[var(--motion-ease)]",
          visible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div
          ref={timeline.track}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(current)}
          aria-valuetext={`${formatTime(current)} of ${formatTime(duration)}`}
          className="group/timeline relative flex h-4 cursor-pointer touch-none items-center"
          {...timeline.handlers}
        >
          <div className="bg-fg/20 relative h-1 w-full overflow-hidden rounded-full transition-[height] duration-[var(--motion-duration)] group-hover/timeline:h-1.5">
            {buffered.map(([start, end]) => (
              <span
                key={start}
                className="bg-fg/30 absolute inset-y-0"
                style={{ left: `${(start / duration) * 100}%`, width: `${((end - start) / duration) * 100}%` }}
              />
            ))}
            {hover && timeline.hovering ? <span className="bg-fg/25 absolute inset-y-0 left-0" style={{ width: hover.x }} /> : null}
            <span className="bg-accent absolute inset-y-0 left-0" style={{ width: `${played}%` }} />
          </div>
          <span
            className={cn(
              "bg-accent pointer-events-none absolute size-3.5 -translate-x-1/2 rounded-full transition-transform duration-[var(--motion-duration)] group-hover/timeline:scale-100",
              timeline.scrubbing ? "scale-100" : "scale-0",
            )}
            style={{ left: `${played}%` }}
          />
          <div
            className={cn(
              "pointer-events-none absolute bottom-6 grid -translate-x-1/2 justify-items-center gap-1 transition-opacity duration-[var(--motion-duration)]",
              timeline.hovering || timeline.scrubbing ? "opacity-100" : "opacity-0",
            )}
            style={{ left: hover ? clamp(hover.x, showPreview ? 88 : 24, hover.width - (showPreview ? 88 : 24)) : 0 }}
          >
            {showPreview ? (
              <video
                ref={timeline.preview}
                src={sources.at(-1)?.src}
                muted
                playsInline
                preload="metadata"
                tabIndex={-1}
                aria-hidden
                className="border-fg/20 bg-bg aspect-video w-44 rounded-[var(--radius-md)] border object-cover shadow-[var(--shadow-md)]"
                onSeeked={timeline.onPreviewSeeked}
              />
            ) : null}
            <span className="bg-overlay rounded-full px-2 py-0.5 text-xs font-medium tabular-nums">
              {formatTime(hover?.time ?? 0)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <Control label={ended ? "Replay" : playing ? "Pause" : "Play"} icon={ended ? RepeatIcon : playing ? PauseIcon : PlayIcon} onClick={toggle} />
          <div className="group/volume flex items-center">
            <Control label={muted ? "Unmute" : "Mute"} icon={volumeIcon} onClick={() => setMuted((value) => !value)} />
            <div className="w-0 overflow-hidden transition-[width] duration-[var(--motion-duration)] ease-[var(--motion-ease)] group-focus-within/volume:w-20 group-hover/volume:w-20">
              <Slider
                aria-label="Volume"
                className="w-20 px-2.5"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onValueChange={(value) => {
                  setVolume(value);
                  setMuted(value === 0);
                }}
              />
            </div>
          </div>
          <p className="text-fg-muted px-2 text-xs tabular-nums">
            <span className="text-fg">{formatTime(current)}</span> / {formatTime(duration)}
          </p>
          <span className="flex-1" />
          {rate !== 1 ? <span className="text-fg-muted text-xs tabular-nums">{rate}×</span> : null}
          <Popover open={settings} onOpenChange={setSettings}>
            <PopoverTrigger aria-label="Settings" className={controlClass}>
              <Icon
                icon={Settings02Icon}
                size={20}
                className={cn("transition-transform duration-[var(--motion-duration)]", settings && "rotate-45")}
              />
            </PopoverTrigger>
            <PopoverContent
              data-mode="dark"
              container={fullscreen ? root : undefined}
              side="top"
              align="end"
              className="w-72 p-1"
            >
              <VideoSettings
                rate={rate}
                onRate={changeRate}
                qualities={sources.map((item) => item.label)}
                quality={sources[source]?.label ?? ""}
                onQuality={changeSource}
                sleep={sleep}
                onSleep={setSleep}
                fit={fit}
                onFit={setFit}
                loop={loop}
                onLoop={setLoop}
              />
            </PopoverContent>
          </Popover>
          <Control label="Picture in picture" icon={PictureInPictureOnIcon} onClick={togglePip} />
          <Control
            label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            icon={fullscreen ? CollapseScreenIcon : FullScreenIcon}
            onClick={toggleFullscreen}
          />
        </div>
      </div>
    </div>
  );
}
