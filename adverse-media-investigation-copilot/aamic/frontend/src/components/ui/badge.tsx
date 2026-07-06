import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "high"
  | "medium"
  | "low"
  | "accent"
  | "outline";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-surface-raised text-ink-muted border border-border",
  high: "bg-risk-high-soft text-risk-high border border-risk-high/20",
  medium: "bg-risk-medium-soft text-risk-medium border border-risk-medium/20",
  low: "bg-risk-low-soft text-risk-low border border-risk-low/20",
  accent: "bg-accent-soft text-accent-dark border border-accent/20",
  outline: "bg-transparent text-ink-muted border border-border",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium font-mono tracking-tight",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  );
}
