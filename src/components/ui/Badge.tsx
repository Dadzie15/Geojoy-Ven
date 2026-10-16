import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "brand" | "deal" | "success" | "warning" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  brand: "bg-brown text-field",
  deal: "bg-terracotta text-field",
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-ink",
  neutral: "border border-line bg-field text-muted",
};

type BadgeProps = { tone?: BadgeTone; className?: string; children: ReactNode };

export function Badge({ tone = "brand", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-chip px-2 py-0.5 font-heading text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
