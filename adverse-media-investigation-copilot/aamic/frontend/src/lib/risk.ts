import type { BadgeVariant } from "@/components/ui/badge";

export function riskBadgeVariant(level: string): BadgeVariant {
  const normalized = level.toLowerCase();
  if (normalized === "high") return "high";
  if (normalized === "medium") return "medium";
  if (normalized === "low") return "low";
  return "default";
}

export function riskTextClass(level: string): string {
  const normalized = level.toLowerCase();
  if (normalized === "high") return "text-risk-high";
  if (normalized === "medium") return "text-risk-medium";
  if (normalized === "low") return "text-risk-low";
  return "text-ink";
}

export function riskRingClass(level: string): string {
  const normalized = level.toLowerCase();
  if (normalized === "high") return "stroke-risk-high";
  if (normalized === "medium") return "stroke-risk-medium";
  if (normalized === "low") return "stroke-risk-low";
  return "stroke-accent";
}

export function severityDotClass(severity: string): string {
  const normalized = severity.toLowerCase();
  if (normalized === "high") return "bg-risk-high";
  if (normalized === "medium") return "bg-risk-medium";
  return "bg-risk-low";
}

const RECOMMENDATION_STYLES: Record<string, string> = {
  Approve: "low",
  Review: "accent",
  "Enhanced Due Diligence": "medium",
  Escalate: "high",
  Reject: "high",
};

export function recommendationVariant(recommendation: string): BadgeVariant {
  return (RECOMMENDATION_STYLES[recommendation] as BadgeVariant) || "default";
}
