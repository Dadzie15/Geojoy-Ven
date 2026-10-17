import Link from "next/link";
import { cn } from "@/lib/cn";

export type CategoryChip = { label: string; href: string; selected: boolean };

type CategoryChipsProps = {
  label: string;
  chips: CategoryChip[];
  /** "pill" is fully rounded (All products); the default has the input radius (Category). */
  shape?: "chip" | "pill";
  /** "center" centres the chips once they wrap (1024 px and up), as in the Search no-results state. */
  align?: "start" | "center";
};

/** Links to a parent ("All") and its child categories (or, on Search, related searches). Scrolls sideways on phones. */
export function CategoryChips({ label, chips, shape = "chip", align = "start" }: CategoryChipsProps) {
  return (
    <nav aria-label={label} className="min-w-0">
      <ul
        className={cn(
          "-mx-4 flex gap-3 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden",
          align === "center" && "lg:justify-center",
        )}
      >
        {chips.map((chip) => (
          <li key={chip.href} className="shrink-0">
            <Link
              href={chip.href}
              aria-current={chip.selected ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center border px-4 font-heading text-[0.8125rem] font-medium whitespace-nowrap transition-colors motion-reduce:transition-none",
                shape === "pill" ? "rounded-pill" : "rounded-input",
                chip.selected
                  ? "border-brown bg-brown text-field"
                  : "border-line bg-field text-ink hover:bg-sand-tint",
              )}
            >
              {chip.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
