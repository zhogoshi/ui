"use client";

import {
  AlarmClockIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  AspectRatioIcon,
  DashboardSpeed01Icon,
  HdIcon,
  KeyboardIcon,
  RepeatIcon,
  Tick02Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { Icon, type AppIcon } from "./icon";
import { Kbd } from "./kbd";
import { Switch } from "./switch";

export type VideoFit = "contain" | "cover";
export type SleepTimer = number | "end" | null;

export const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const SLEEP: { value: SleepTimer; label: string }[] = [
  { value: null, label: "Off" },
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: "end", label: "End of video" },
];

const FITS: { value: VideoFit; label: string }[] = [
  { value: "contain", label: "Fit" },
  { value: "cover", label: "Fill" },
];

const KEYS: [string, string[]][] = [
  ["Play or pause", ["Space", "K"]],
  ["Back or forward 5s", ["←", "→"]],
  ["Back or forward 10s", ["J", "L"]],
  ["Volume", ["↑", "↓"]],
  ["Mute", ["M"]],
  ["Fullscreen", ["F"]],
  ["Mini player", ["I"]],
  ["Jump to 0–90%", ["0", "9"]],
  ["Previous or next frame", [",", "."]],
  ["Speed", ["<", ">"]],
];

type View = "main" | "speed" | "quality" | "sleep" | "fit" | "keys";

const rowClass =
  "hover:bg-fg/10 flex h-9 w-full cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] px-2.5 text-left text-sm outline-none transition-colors duration-[var(--motion-duration)] focus-visible:bg-fg/10";

const speedLabel = (rate: number) => (rate === 1 ? "Normal" : `${rate}×`);

export interface VideoSettingsProps {
  rate: number;
  onRate: (rate: number) => void;
  qualities: string[];
  quality: string;
  onQuality: (quality: string) => void;
  sleep: SleepTimer;
  onSleep: (sleep: SleepTimer) => void;
  fit: VideoFit;
  onFit: (fit: VideoFit) => void;
  loop: boolean;
  onLoop: (loop: boolean) => void;
}

function Row({ icon, label, value, onClick }: { icon: AppIcon; label: string; value: string; onClick: () => void }) {
  return (
    <button type="button" className={rowClass} onClick={onClick}>
      <Icon icon={icon} variant="stroke" size={18} className="text-fg-muted shrink-0" />
      <span className="flex-1">{label}</span>
      <span className="text-fg-muted text-xs">{value}</span>
      <Icon icon={ArrowRight01Icon} variant="stroke" size={16} className="text-fg-subtle shrink-0" />
    </button>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <button type="button" className={cn(rowClass, "border-border mb-1 rounded-b-none border-b font-medium")} onClick={onBack}>
      <Icon icon={ArrowLeft01Icon} variant="stroke" size={18} className="shrink-0" />
      {title}
    </button>
  );
}

function Options<T>({
  options,
  value,
  onPick,
}: {
  options: { value: T; label: string }[];
  value: T;
  onPick: (value: T) => void;
}) {
  return options.map((option) => (
    <button
      key={option.label}
      type="button"
      role="menuitemradio"
      aria-checked={option.value === value}
      className={rowClass}
      onClick={() => onPick(option.value)}
    >
      <span className="flex size-[18px] shrink-0 items-center justify-center">
        {option.value === value ? <Icon icon={Tick02Icon} variant="stroke" size={16} /> : null}
      </span>
      {option.label}
    </button>
  ));
}

export function VideoSettings(props: VideoSettingsProps) {
  const [view, setView] = useState<View>("main");
  const [motion, setMotion] = useState<"forward" | "back" | null>(null);
  const [height, setHeight] = useState<number>();
  const inner = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = inner.current;
    if (!node) return;
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, [view]);

  const go = (next: View) => {
    setMotion(next === "main" ? "back" : "forward");
    setView(next);
  };

  const pick =
    <T,>(apply: (value: T) => void) =>
    (value: T) => {
      apply(value);
      go("main");
    };

  const sleepLabel = SLEEP.find((option) => option.value === props.sleep)?.label ?? "Off";
  const fitLabel = FITS.find((option) => option.value === props.fit)?.label ?? "Fit";

  const views: Record<View, ReactNode> = {
    main: (
      <>
        <Row icon={DashboardSpeed01Icon} label="Speed" value={speedLabel(props.rate)} onClick={() => go("speed")} />
        {props.qualities.length > 1 ? (
          <Row icon={HdIcon} label="Quality" value={props.quality} onClick={() => go("quality")} />
        ) : null}
        <Row icon={AlarmClockIcon} label="Sleep timer" value={sleepLabel} onClick={() => go("sleep")} />
        <Row icon={AspectRatioIcon} label="Video fit" value={fitLabel} onClick={() => go("fit")} />
        <label className={rowClass}>
          <Icon icon={RepeatIcon} variant="stroke" size={18} className="text-fg-muted shrink-0" />
          <span className="flex-1">Loop</span>
          <Switch checked={props.loop} onCheckedChange={props.onLoop} />
        </label>
        <Row icon={KeyboardIcon} label="Hotkeys" value="" onClick={() => go("keys")} />
      </>
    ),
    speed: (
      <>
        <Header title="Speed" onBack={() => go("main")} />
        <Options
          options={SPEEDS.map((rate) => ({ value: rate, label: speedLabel(rate) }))}
          value={props.rate}
          onPick={pick(props.onRate)}
        />
      </>
    ),
    quality: (
      <>
        <Header title="Quality" onBack={() => go("main")} />
        <Options
          options={props.qualities.map((quality) => ({ value: quality, label: quality }))}
          value={props.quality}
          onPick={pick(props.onQuality)}
        />
      </>
    ),
    sleep: (
      <>
        <Header title="Sleep timer" onBack={() => go("main")} />
        <Options options={SLEEP} value={props.sleep} onPick={pick(props.onSleep)} />
      </>
    ),
    fit: (
      <>
        <Header title="Video fit" onBack={() => go("main")} />
        <Options options={FITS} value={props.fit} onPick={pick(props.onFit)} />
      </>
    ),
    keys: (
      <>
        <Header title="Hotkeys" onBack={() => go("main")} />
        <div className="grid gap-1.5 px-2.5 pt-1 pb-2">
          {KEYS.map(([label, keys]) => (
            <div key={label} className="flex items-center justify-between gap-3 text-xs">
              <span className="text-fg-muted">{label}</span>
              <span className="flex gap-1">
                {keys.map((key) => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </span>
            </div>
          ))}
        </div>
      </>
    ),
  };

  return (
    <div
      className="overflow-hidden transition-[height] duration-[var(--motion-duration)] ease-[var(--motion-ease)]"
      style={{ height }}
    >
      <div
        ref={inner}
        key={view}
        className={cn(
          "flex flex-col",
          motion === "forward" && "animate-[panel-from-right_var(--motion-duration)_var(--motion-ease)]",
          motion === "back" && "animate-[panel-from-left_var(--motion-duration)_var(--motion-ease)]",
        )}
      >
        {views[view]}
      </div>
    </div>
  );
}
