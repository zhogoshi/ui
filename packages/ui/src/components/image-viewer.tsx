"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { FullScreenIcon } from "@hugeicons-pro/core-solid-rounded";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Copy01Icon,
  Download04Icon,
  LinkSquare02Icon,
  MoreHorizontalIcon,
  SearchAddIcon,
  SearchMinusIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../lib/cn";
import { ContextMenuContent, ContextMenuItem, ContextMenuRoot, ContextMenuTrigger } from "./context-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
import { CollapseScreenIcon } from "./collapse-screen-icon";
import { Icon } from "./icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { backdropMotion, popupMotion } from "./popup";

export interface ViewerImage {
  src: string;
  alt?: string;
  name?: string;
}

const MIN = 1;
const MAX = 6;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function fileName(image: ViewerImage) {
  return image.name ?? image.src.split("/").pop()?.split("?")[0] ?? "image";
}

export async function downloadImage(image: ViewerImage) {
  try {
    const blob = await (await fetch(image.src)).blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName(image);
    link.click();
    URL.revokeObjectURL(url);
  } catch {
    window.open(image.src, "_blank", "noopener");
  }
}

const toolClass =
  "text-fg hover:bg-bg-subtle inline-flex size-9 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40";

interface View {
  scale: number;
  x: number;
  y: number;
}

const resting: View = { scale: 1, x: 0, y: 0 };

function useStageGestures(onSwipe: (direction: 1 | -1) => void) {
  const stage = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>(resting);
  const [moving, setMoving] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ view: View; x: number; y: number; distance: number } | null>(null);

  const zoomAt = (next: number, clientX: number, clientY: number) => {
    const rect = stage.current?.getBoundingClientRect();
    if (!rect) return;
    setView((current) => {
      const scale = clamp(next, MIN, MAX);
      if (scale === MIN) return resting;
      const px = clientX - rect.left - rect.width / 2;
      const py = clientY - rect.top - rect.height / 2;
      const ratio = scale / current.scale;
      return { scale, x: px - (px - current.x) * ratio, y: py - (py - current.y) * ratio };
    });
  };

  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setView((current) => {
        const rect = node.getBoundingClientRect();
        const scale = clamp(current.scale * Math.exp(-event.deltaY * 0.0025), MIN, MAX);
        if (scale === MIN) return resting;
        const px = event.clientX - rect.left - rect.width / 2;
        const py = event.clientY - rect.top - rect.height / 2;
        const ratio = scale / current.scale;
        return { scale, x: px - (px - current.x) * ratio, y: py - (py - current.y) * ratio };
      });
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  const spread = () => {
    const [a, b] = [...pointers.current.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };

  const handlers = {
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      gesture.current = { view, x: event.clientX, y: event.clientY, distance: spread() };
      setMoving(true);
    },
    onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!pointers.current.has(event.pointerId) || !gesture.current) return;
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const start = gesture.current;
      if (pointers.current.size > 1 && start.distance) {
        setView({ ...start.view, scale: clamp(start.view.scale * (spread() / start.distance), MIN, MAX) });
        return;
      }
      if (start.view.scale > 1) {
        setView({ ...start.view, x: start.view.x + event.clientX - start.x, y: start.view.y + event.clientY - start.y });
      } else {
        setView({ scale: 1, x: (event.clientX - start.x) * 0.6, y: 0 });
      }
    },
    onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => {
      const start = gesture.current;
      pointers.current.delete(event.pointerId);
      if (pointers.current.size) return;
      setMoving(false);
      gesture.current = null;
      if (start && start.view.scale === 1) {
        const dx = event.clientX - start.x;
        if (Math.abs(dx) > 60) onSwipe(dx < 0 ? 1 : -1);
        setView((current) => (current.scale === 1 ? resting : current));
      }
    },
    onDoubleClick: (event: MouseEvent<HTMLDivElement>) => zoomAt(view.scale > 1 ? MIN : 2.5, event.clientX, event.clientY),
  };

  return { stage, view, setView, moving, zoomAt, handlers };
}

export function ImageViewer({
  images,
  index,
  open,
  onOpenChange,
  onIndexChange,
}: {
  images: ViewerImage[];
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
}) {
  const [direction, setDirection] = useState<1 | -1>(1);
  const count = images.length;
  const image = images[clamp(index, 0, Math.max(0, count - 1))];

  const go = (step: 1 | -1) => {
    if (count < 2) return;
    setDirection(step);
    onIndexChange((index + step + count) % count);
  };

  const { stage, view, setView, moving, zoomAt, handlers } = useStageGestures(go);

  useEffect(() => setView(resting), [index, open, setView]);

  if (!image) return null;

  const zoomCenter = (factor: number) => {
    const rect = stage.current?.getBoundingClientRect();
    if (rect) zoomAt(view.scale * factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  const actions = [
    { id: "download", label: "Download", icon: Download04Icon, onSelect: () => void downloadImage(image) },
    { id: "open", label: "Open original", icon: LinkSquare02Icon, onSelect: () => window.open(image.src, "_blank", "noopener") },
    { id: "copy", label: "Copy link", icon: Copy01Icon, onSelect: () => void navigator.clipboard.writeText(image.src) },
  ];

  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={cn("bg-bg/95 fixed inset-0 z-[var(--z-overlay)] backdrop-blur-md", backdropMotion)} />
        <BaseDialog.Popup
          className={cn("fixed inset-0 z-[var(--z-modal)] flex flex-col outline-none", popupMotion)}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") go(1);
            else if (event.key === "ArrowLeft") go(-1);
            else if (event.key === "+" || event.key === "=") zoomCenter(1.5);
            else if (event.key === "-") zoomCenter(1 / 1.5);
            else if (event.key === "0") setView(resting);
          }}
        >
          <BaseDialog.Title className="sr-only">{image.alt ?? fileName(image)}</BaseDialog.Title>
          <div className="flex shrink-0 items-center gap-2 px-3 pt-[calc(0.75rem+var(--safe-top))] pr-[calc(0.75rem+var(--safe-right))] pb-3 pl-[calc(0.75rem+var(--safe-left))]">
            <p className="text-fg-muted min-w-0 flex-1 truncate text-sm">
              {count > 1 ? <span className="text-fg mr-2 tabular-nums">{index + 1} / {count}</span> : null}
              {image.alt ?? fileName(image)}
            </p>
            <button type="button" aria-label="Zoom out" className={toolClass} disabled={view.scale <= MIN} onClick={() => zoomCenter(1 / 1.5)}>
              <Icon icon={SearchMinusIcon} variant="stroke" size={18} />
            </button>
            <button type="button" aria-label="Zoom in" className={toolClass} disabled={view.scale >= MAX} onClick={() => zoomCenter(1.5)}>
              <Icon icon={SearchAddIcon} variant="stroke" size={18} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger aria-label="More" className={toolClass}>
                <Icon icon={MoreHorizontalIcon} variant="stroke" size={18} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {actions.map((action) => (
                  <DropdownMenuItem key={action.id} onClick={action.onSelect}>
                    <Icon icon={action.icon} variant="stroke" size={16} />
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <BaseDialog.Close aria-label="Close" className={toolClass}>
              <Icon icon={Cancel01Icon} variant="stroke" size={18} />
            </BaseDialog.Close>
          </div>
          <ContextMenuRoot>
            <ContextMenuTrigger
              ref={stage}
              className={cn(
                "relative flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden select-none",
                view.scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in",
              )}
              {...handlers}
            >
              <img
                key={image.src}
                src={image.src}
                alt={image.alt ?? ""}
                draggable={false}
                className={cn(
                  "max-h-full max-w-full object-contain px-4 will-change-transform",
                  direction === 1
                    ? "animate-[slide-from-right_var(--motion-duration)_var(--motion-ease)]"
                    : "animate-[slide-from-left_var(--motion-duration)_var(--motion-ease)]",
                  !moving && "transition-transform duration-[var(--motion-duration)] ease-[var(--motion-ease)]",
                )}
                style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
              />
            </ContextMenuTrigger>
            <ContextMenuContent>
              {actions.map((action) => (
                <ContextMenuItem key={action.id} onClick={action.onSelect}>
                  <Icon icon={action.icon} variant="stroke" size={16} />
                  {action.label}
                </ContextMenuItem>
              ))}
            </ContextMenuContent>
          </ContextMenuRoot>
          {count > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous image"
                className={cn(toolClass, "bg-bg-elevated/80 border-border absolute top-1/2 left-[calc(0.75rem+var(--safe-left))] size-11 -translate-y-1/2 border backdrop-blur-md")}
                onClick={() => go(-1)}
              >
                <Icon icon={ArrowLeft01Icon} variant="stroke" size={20} />
              </button>
              <button
                type="button"
                aria-label="Next image"
                className={cn(toolClass, "bg-bg-elevated/80 border-border absolute top-1/2 right-[calc(0.75rem+var(--safe-right))] size-11 -translate-y-1/2 border backdrop-blur-md")}
                onClick={() => go(1)}
              >
                <Icon icon={ArrowRight01Icon} variant="stroke" size={20} />
              </button>
              <div className="flex shrink-0 justify-center gap-1.5 overflow-x-auto px-3 pt-3 pb-[calc(0.75rem+var(--safe-bottom))]">
                {images.map((item, at) => (
                  <button
                    key={`${item.src}-${at}`}
                    type="button"
                    aria-label={`Show image ${at + 1}`}
                    aria-current={at === index || undefined}
                    className="border-border aria-[current]:border-accent size-12 shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius-sm)] border-2 opacity-60 transition-opacity duration-[var(--motion-duration)] hover:opacity-100 aria-[current]:opacity-100"
                    onClick={() => {
                      setDirection(at > index ? 1 : -1);
                      onIndexChange(at);
                    }}
                  >
                    <img src={item.src} alt="" className="size-full object-cover" draggable={false} />
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export function ImageGallery({
  images,
  className,
  imageClassName,
}: {
  images: ViewerImage[];
  className?: string;
  imageClassName?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  useEffect(() => {
    const sync = () => setFull(document.fullscreenElement === root.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  const toggleFull = () => {
    const node = root.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    if (document.fullscreenElement) void document.exitFullscreen();
    else if (node?.requestFullscreen) void node.requestFullscreen();
    else node?.webkitRequestFullscreen?.();
  };
  return (
    <>
      <div
        ref={root}
        className={cn("relative min-w-0 pb-10", full && "bg-bg flex h-full w-full items-center justify-center p-6 pb-16")}
      >
      <div className={cn("grid min-w-0 grid-cols-[repeat(auto-fill,minmax(min(100%,8rem),1fr))] gap-2", full && "w-full max-w-5xl", className)}>
        {images.map((image, at) => (
          <button
            key={`${image.src}-${at}`}
            type="button"
            aria-label={`Open ${image.alt ?? fileName(image)}`}
            className={cn(
              "border-border bg-bg-subtle group aspect-square cursor-zoom-in overflow-hidden rounded-[var(--radius-md)] border outline-none focus-visible:ring-2 focus-visible:ring-ring",
              imageClassName,
            )}
            onClick={() => {
              setIndex(at);
              setOpen(true);
            }}
          >
            <img
              src={image.src}
              alt={image.alt ?? ""}
              loading="lazy"
              draggable={false}
              className="size-full object-cover transition-transform duration-[var(--motion-duration)] ease-[var(--motion-ease)] group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>
      <Tooltip>
        <TooltipTrigger
          delay={0}
          render={
            <button
              type="button"
              aria-label={full ? "Exit fullscreen" : "Fullscreen"}
              className="text-fg-muted hover:bg-bg-muted hover:text-fg absolute right-2 bottom-2 inline-flex size-7 items-center justify-center rounded-[var(--radius-sm)]"
              onClick={toggleFull}
            />
          }
        >
          <Icon icon={full ? CollapseScreenIcon : FullScreenIcon} size={16} />
        </TooltipTrigger>
        <TooltipContent>{full ? "Exit fullscreen" : "Fullscreen"}</TooltipContent>
      </Tooltip>
      </div>
      <ImageViewer images={images} index={index} open={open} onOpenChange={setOpen} onIndexChange={setIndex} />
    </>
  );
}

export function Image({ src, alt, name, className, ...props }: ViewerImage & Omit<ComponentProps<"img">, "src" | "alt">) {
  const [open, setOpen] = useState(false);
  const images = [{ src, alt, name }];
  return (
    <>
      <button
        type="button"
        aria-label={`Open ${alt ?? "image"}`}
        className="cursor-zoom-in overflow-hidden rounded-[var(--radius-md)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setOpen(true)}
      >
        <img src={src} alt={alt ?? ""} loading="lazy" draggable={false} className={cn("block", className)} {...props} />
      </button>
      <ImageViewer images={images} index={0} open={open} onOpenChange={setOpen} onIndexChange={() => undefined} />
    </>
  );
}
