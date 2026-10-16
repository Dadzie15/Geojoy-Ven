import Link from "next/link";
import { cn } from "@/lib/cn";

export type CategoryChip = { label: string; href: string; selected: boolean };

/** Links to a parent ("All") and its child categories. Scrolls sideways on phones. */
export function CategoryChips({ label, chips }: { label: string; chips: CategoryChip[] }) {
  return (
    <nav aria-label={label}>
      <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
        {chips.map((chip) => (
          <li key={chip.href} className="shrink-0">
            <Link
              href={chip.href}
              aria-current={chip.selected ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-input border px-4 font-heading text-[0.8125rem] font-medium whitespace-nowrap transition-colors motion-reduce:transition-none",
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
