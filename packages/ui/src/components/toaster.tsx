"use client";

import { Toaster as Sonner, toast } from "sonner";
import { useTheme } from "../theme/theme";

export { toast };

export function Toaster() {
  const { resolved } = useTheme();
  return (
    <Sonner
      theme={resolved}
      position="bottom-right"
      closeButton
      offset={{
        bottom: "1.5rem",
        right: "1.5rem",
      }}
      mobileOffset={{
        bottom: "5rem",
        left: "1rem",
        right: "1rem",
      }}
      style={{ zIndex: "var(--z-toast)" }}
      toastOptions={{
        classNames: {
          toast:
            "hogoshi-grab! bg-bg-elevated! text-fg! border-border! border! shadow-[var(--shadow-md)]! rounded-[var(--radius-md)]! select-none!",
          title: "pointer-events-none! select-none!",
          description: "text-fg-muted! pointer-events-none! select-none!",
          actionButton: "bg-accent! text-accent-fg! pointer-events-auto!",
          cancelButton: "bg-bg-subtle! text-fg-muted! pointer-events-auto!",
          closeButton: "pointer-events-auto!",
        },
      }}
    />
  );
}
