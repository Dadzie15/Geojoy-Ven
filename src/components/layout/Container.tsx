import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** 1280 px content column (80 px gutters at 1440 px), 16 px gutters on phones. */
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto box-content max-w-7xl px-4 sm:px-6 lg:px-10", className)}>{children}</div>;
}
