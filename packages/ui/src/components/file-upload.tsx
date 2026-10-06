"use client";

import { Cancel01Icon, CloudUploadIcon, File01Icon } from "@hugeicons-pro/core-stroke-rounded";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import { cn } from "../lib/cn";
import { Icon } from "./icon";
import { ImageViewer } from "./image-viewer";

export interface FileRejection {
  file: File;
  reason: string;
}

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  value?: File[];
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  onReject?: (rejections: FileRejection[]) => void;
  className?: string;
  children?: ReactNode;
}

interface FileUploadState {
  id: string;
  files: File[];
  urls: (string | null)[];
  errors: FileRejection[];
  accept?: string;
  maxSize?: number;
  multiple: boolean;
  single: boolean;
  disabled: boolean;
  add: (files: File[]) => void;
  remove: (index: number) => void;
  preview: (index: number) => void;
}

const FileUploadContext = createContext<FileUploadState | null>(null);

function useFileUpload() {
  const value = useContext(FileUploadContext);
  if (!value) throw new Error("FileUpload parts must be used within FileUpload");
  return value;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size < 10 ? 1 : 0)} ${units[unit]}`;
}

function matches(file: File, accept: string) {
  return accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule);
      if (rule.endsWith("/*")) return file.type.startsWith(rule.slice(0, -1));
      return file.type === rule;
    });
}

function describe(accept?: string, maxSize?: number) {
  const formats = accept
    ?.split(",")
    .map((rule) => rule.trim().replace(/^\./, "").replace("/*", "").replace(/^.*\//, "").toUpperCase())
    .filter(Boolean)
    .join(", ");
  return [formats, maxSize ? `up to ${formatBytes(maxSize)}` : ""].filter(Boolean).join(" · ");
}

function useImageUrls(files: File[]) {
  const urls = useMemo(
    () => files.map((file) => (file.type.startsWith("image/") ? URL.createObjectURL(file) : null)),
    [files],
  );
  useEffect(() => () => urls.forEach((url) => url && URL.revokeObjectURL(url)), [urls]);
  return urls;
}

const fileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

const removeClass =
  "bg-bg-elevated border-border text-fg-muted hover:text-fg hover:bg-bg-subtle inline-flex cursor-pointer items-center justify-center rounded-full border shadow-[var(--shadow-sm)] transition-colors duration-[var(--motion-duration)] disabled:cursor-not-allowed disabled:opacity-50";

export function FileUpload({
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  disabled = false,
  value,
  defaultValue = [],
  onValueChange,
  onReject,
  className,
  children,
}: FileUploadProps) {
  const id = useId();
  const [local, setLocal] = useState(defaultValue);
  const [errors, setErrors] = useState<FileRejection[]>([]);
  const [viewing, setViewing] = useState<number | null>(null);
  const files = value ?? local;
  const limit = multiple ? (maxFiles ?? Infinity) : 1;
  const single = limit === 1;
  const urls = useImageUrls(files);
  const images = files.flatMap((file, at) => (urls[at] ? [{ src: urls[at], name: file.name, alt: file.name }] : []));

  const commit = (next: File[]) => {
    setLocal(next);
    onValueChange?.(next);
  };

  const add = (incoming: File[]) => {
    const rejected: FileRejection[] = [];
    const accepted = incoming.filter((file) => {
      if (accept && !matches(file, accept)) rejected.push({ file, reason: "Format is not supported" });
      else if (maxSize && file.size > maxSize) rejected.push({ file, reason: `Larger than ${formatBytes(maxSize)}` });
      else return true;
      return false;
    });
    const base = single ? [] : files;
    const room = single ? 1 : Math.max(0, limit - base.length);
    accepted.slice(room).forEach((file) => rejected.push({ file, reason: `Only ${limit} files allowed` }));
    if (accepted.length) commit([...base, ...accepted.slice(0, room)]);
    setErrors(rejected);
    if (rejected.length) onReject?.(rejected);
  };

  const state: FileUploadState = {
    id,
    files,
    urls,
    errors,
    accept,
    maxSize,
    multiple: multiple && !single,
    single,
    disabled,
    add,
    remove: (index) => commit(files.filter((_, at) => at !== index)),
    preview: (index) => {
      const at = images.findIndex((image) => image.src === urls[index]);
      if (at >= 0) setViewing(at);
    },
  };

  return (
    <FileUploadContext.Provider value={state}>
      <div className={cn("flex w-full flex-col gap-2", className)}>
        {children ?? (
          <>
            <FileUploadDropzone />
            {single ? null : <FileList />}
          </>
        )}
      </div>
      <ImageViewer
        images={images}
        index={viewing ?? 0}
        open={viewing !== null && images.length > 0}
        onOpenChange={(open) => !open && setViewing(null)}
        onIndexChange={setViewing}
      />
    </FileUploadContext.Provider>
  );
}

function SinglePreview() {
  const { files, urls, disabled, remove, preview } = useFileUpload();
  const file = files[0];
  if (!file) return null;
  return (
    <div className="absolute inset-0 animate-[item-in_var(--motion-duration)_var(--motion-ease)]">
      {urls[0] ? (
        <button
          type="button"
          aria-label={`Preview ${file.name}`}
          className="size-full cursor-zoom-in"
          onClick={(event) => {
            event.preventDefault();
            preview(0);
          }}
        >
          <img src={urls[0]} alt="" className="size-full object-cover" />
        </button>
      ) : (
        <div className="bg-bg-elevated flex size-full flex-col items-center justify-center gap-2 px-4 text-center">
          <Icon icon={File01Icon} variant="stroke" size={24} className="text-fg-muted" />
          <span className="text-fg max-w-full truncate text-sm font-medium">{file.name}</span>
          <span className="text-fg-subtle text-xs">{formatBytes(file.size)} · drop or click to replace</span>
        </div>
      )}
      <button
        type="button"
        aria-label={`Remove ${file.name}`}
        disabled={disabled}
        className={cn(removeClass, "absolute top-2 right-2 size-7")}
        onClick={(event) => {
          event.preventDefault();
          remove(0);
        }}
      >
        <Icon icon={Cancel01Icon} variant="stroke" size={14} />
      </button>
    </div>
  );
}

export function FileUploadDropzone({ label = "Drop files here or browse", className }: { label?: string; className?: string }) {
  const { id, files, errors, accept, maxSize, multiple, single, disabled, add } = useFileUpload();
  const depth = useRef(0);
  const [over, setOver] = useState(false);
  const hint = describe(accept, maxSize);
  const filled = single && files.length > 0;

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    depth.current = 0;
    setOver(false);
    if (!disabled) add([...event.dataTransfer.files]);
  };

  return (
    <>
      <label
        htmlFor={id}
        data-over={over || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          "border-border-strong bg-bg-elevated hover:bg-bg-subtle data-[over]:border-accent data-[over]:bg-accent-muted relative flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-[var(--radius-lg)] border border-dashed px-4 py-8 text-center transition-[background-color,border-color,scale] duration-[var(--motion-duration)] ease-[var(--motion-ease)] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[over]:scale-[1.01]",
          filled && "h-48 border-solid p-0",
          className,
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          depth.current += 1;
          if (!disabled) setOver(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => {
          depth.current -= 1;
          if (depth.current <= 0) setOver(false);
        }}
        onDrop={onDrop}
      >
        {filled ? (
          <SinglePreview />
        ) : (
          <>
            <span className="bg-bg-subtle text-fg flex size-10 items-center justify-center rounded-full">
              <Icon icon={CloudUploadIcon} variant="stroke" size={20} />
            </span>
            <span className="text-fg text-sm font-medium">{label}</span>
            {hint ? <span className="text-fg-subtle text-xs">{hint}</span> : null}
          </>
        )}
        <input
          id={id}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(event) => {
            add([...(event.target.files ?? [])]);
            event.target.value = "";
          }}
        />
      </label>
      {errors.map((error) => (
        <p
          key={`${error.file.name}-${error.reason}`}
          className="text-danger animate-[item-in_var(--motion-duration)_var(--motion-ease)] text-xs"
        >
          {error.file.name}: {error.reason}
        </p>
      ))}
    </>
  );
}

function Thumb({ index, className }: { index: number; className: string }) {
  const { files, urls, preview } = useFileUpload();
  const file = files[index];
  if (urls[index]) {
    return (
      <button
        type="button"
        aria-label={`Preview ${file.name}`}
        className={cn("bg-bg-subtle shrink-0 cursor-zoom-in overflow-hidden", className)}
        onClick={() => preview(index)}
      >
        <img src={urls[index]} alt="" className="size-full object-cover" />
      </button>
    );
  }
  return (
    <span className={cn("bg-bg-subtle flex shrink-0 items-center justify-center", className)}>
      <Icon icon={File01Icon} variant="stroke" size={18} className="text-fg-muted" />
    </span>
  );
}

export function FileList({ variant = "col", className }: { variant?: "col" | "row"; className?: string }) {
  const { files, disabled, remove } = useFileUpload();
  if (!files.length) return null;

  if (variant === "row") {
    return (
      <ul className={cn("flex flex-wrap gap-3 pt-2", className)}>
        {files.map((file, index) => (
          <li
            key={fileKey(file)}
            className="relative flex w-20 animate-[item-in_var(--motion-duration)_var(--motion-ease)] flex-col gap-1"
          >
            <Thumb index={index} className="border-border size-20 rounded-[var(--radius-md)] border" />
            <span className="text-fg-muted truncate text-xs">{file.name}</span>
            <button
              type="button"
              aria-label={`Remove ${file.name}`}
              disabled={disabled}
              className={cn(removeClass, "absolute -top-2 -right-2 size-6")}
              onClick={() => remove(index)}
            >
              <Icon icon={Cancel01Icon} variant="stroke" size={12} />
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={cn("flex flex-col gap-1.5", className)}>
      {files.map((file, index) => (
        <li
          key={fileKey(file)}
          className="border-border bg-bg-elevated flex animate-[item-in_var(--motion-duration)_var(--motion-ease)] items-center gap-3 rounded-[var(--radius-md)] border p-2"
        >
          <Thumb index={index} className="size-10 rounded-[var(--radius-sm)]" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-fg truncate text-sm">{file.name}</span>
            <span className="text-fg-subtle text-xs">{formatBytes(file.size)}</span>
          </span>
          <button
            type="button"
            aria-label={`Remove ${file.name}`}
            disabled={disabled}
            className="text-fg-subtle hover:bg-bg-subtle hover:text-fg inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)]"
            onClick={() => remove(index)}
          >
            <Icon icon={Cancel01Icon} variant="stroke" size={16} />
          </button>
        </li>
      ))}
    </ul>
  );
}
