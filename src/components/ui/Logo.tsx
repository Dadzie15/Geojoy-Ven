import { cn } from "@/lib/cn";

export type LogoTone = "dark" | "light";

type LogoProps = { tone?: LogoTone; className?: string };

/** Roof-over-a-smile mark (logo option B). "dark" is for light surfaces, "light" for brown ones. */
export function LogoMark({ tone = "dark", className }: LogoProps) {
  const dark = tone === "dark";
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("shrink-0", className)}>
      <circle cx="24" cy="24" r="24" className={dark ? "fill-brown" : "fill-field"} />
      <path
        d="M12.5 25.5 24 14.5l11.5 11"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={dark ? "stroke-field" : "stroke-brown"}
      />
      <path d="M17 30.5q7 6.5 14 0" fill="none" strokeWidth="3.5" strokeLinecap="round" className="stroke-terracotta" />
    </svg>
  );
}

export function Logo({ tone = "dark", className }: LogoProps) {
  const dark = tone === "dark";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark tone={tone} className="size-10 sm:size-11" />
      <span className="flex flex-col leading-none">
        <span className={cn("font-heading text-xl font-bold tracking-tight sm:text-2xl", dark ? "text-ink" : "text-field")}>
          GeoJoy
        </span>
        <span
          className={cn(
            "mt-1 pl-px font-heading text-[0.625rem] font-semibold tracking-[0.3em] uppercase",
            dark ? "text-muted" : "text-sand-tint",
          )}
        >
          Ventures
        </span>
      </span>
    </span>
  );
}
