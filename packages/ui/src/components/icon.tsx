import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

export type AppIcon = IconSvgElement;

export type IconVariant = "fill" | "stroke";

export interface IconProps {
  icon: AppIcon;
  altIcon?: AppIcon;
  showAlt?: boolean;
  variant?: IconVariant;
  size?: number;
  className?: string;
}

export function Icon({ icon, altIcon, showAlt, variant = "fill", size = 16, className }: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      altIcon={altIcon}
      showAlt={showAlt}
      size={size}
      color="currentColor"
      strokeWidth={variant === "stroke" ? 1.75 : undefined}
      className={className}
    />
  );
}
