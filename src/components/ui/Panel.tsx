import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type PanelProps = HTMLAttributes<HTMLElement> & { as?: "div" | "section" | "article" | "aside" };

export function Panel({ as: Tag = "div", className, ...rest }: PanelProps) {
  return <Tag className={cn("rounded-panel bg-card p-6 shadow-panel sm:p-8", className)} {...rest} />;
}
