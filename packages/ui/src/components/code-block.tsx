"use client";

import { useState } from "react";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import { Copy01Icon, Tick02Icon } from "@hugeicons-pro/core-stroke-rounded";
import { highlightJsx } from "../lib/jsx-highlight";
import { cn } from "../lib/cn";
import { Icon } from "./icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("tsx", xml);
hljs.registerLanguage("jsx", xml);
hljs.registerLanguage("javascript", typescript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("html", xml);

const languages = ["typescript", "ts", "tsx", "jsx", "javascript", "json", "bash", "html"] as const;
const known = new Set<string>(languages);
const jsxLanguages = new Set(["tsx", "jsx"]);

const labels: Record<string, string> = {
  typescript: "TS",
  ts: "TS",
  tsx: "TSX",
  jsx: "JSX",
  javascript: "JS",
  json: "JSON",
  bash: "Shell",
  html: "HTML",
  text: "Text",
};

function guess(code: string) {
  const trimmed = code.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json";
  if (/^(pnpm|npm|yarn|bun|git|cd|ls|echo)\b/.test(trimmed) || trimmed.startsWith("$")) return "bash";
  if (trimmed.includes("</") || trimmed.includes("/>")) return "tsx";
  return null;
}

function highlight(code: string, language?: string) {
  const hinted = language && language !== "auto" && known.has(language) ? language : guess(code);
  if (hinted && jsxLanguages.has(hinted)) return { id: hinted, html: highlightJsx(code) };
  if (hinted) return { id: hinted, html: hljs.highlight(code, { language: hinted, ignoreIllegals: true }).value };
  const result = hljs.highlightAuto(code, [...languages]);
  const id = result.language && known.has(result.language) ? result.language : "text";
  return { id, html: id === "text" ? code.replaceAll("&", "&amp;").replaceAll("<", "&lt;") : result.value };
}

export function CodeBlock({
  code,
  language = "auto",
  variant = "full",
  showLanguage = true,
  scroll = false,
  className,
}: {
  code: string;
  language?: string;
  variant?: "full" | "snippet";
  showLanguage?: boolean;
  scroll?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  if (variant === "snippet") {
    return (
      <div className={cn("bg-bg-subtle flex max-w-full overflow-hidden rounded-[var(--radius-md)]", className)}>
        <span className="bg-fg-subtle/35 w-1 shrink-0" />
        <pre className="max-h-28 min-w-0 flex-1 overflow-auto px-3 py-2 font-mono text-xs whitespace-pre">{code}</pre>
      </div>
    );
  }

  const painted = highlight(code, language);
  const copy = () => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <div className={cn("border-border bg-bg-subtle relative w-full min-w-0 max-w-full overflow-hidden rounded-[var(--radius-md)] border", className)}>
      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        {showLanguage ? <span className="text-fg-subtle text-[10px] font-medium tracking-wide uppercase">{labels[painted.id] ?? painted.id}</span> : null}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label={copied ? "Copied" : "Copy"}
                className="text-fg-muted hover:bg-bg-muted hover:text-fg inline-flex size-7 items-center justify-center rounded-[var(--radius-sm)]"
                onClick={copy}
              />
            }
          >
            <Icon
              icon={copied ? Tick02Icon : Copy01Icon}
              variant="stroke"
              size={14}
              className={copied ? "text-success origin-center animate-[check-pop_var(--motion-duration)_var(--motion-ease)]" : undefined}
            />
          </TooltipTrigger>
          <TooltipContent>{copied ? "Copied" : "Copy"}</TooltipContent>
        </Tooltip>
      </div>
      <pre
        className={cn(
          "hogoshi-code w-full min-w-0 max-w-full p-4 pr-24 font-mono text-xs",
          scroll ? "max-h-[28rem] overflow-auto whitespace-pre" : "wrap-anywhere whitespace-pre-wrap",
          className,
        )}
      >
        <code className={scroll ? "whitespace-pre" : "wrap-anywhere whitespace-pre-wrap"} dangerouslySetInnerHTML={{ __html: painted.html }} />
      </pre>
    </div>
  );
}
