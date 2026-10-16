import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { iconProps } from "./icon";

type SectionHeaderProps = {
  title: string;
  eyebrow?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  id?: string;
};

export function SectionHeader({ title, eyebrow, viewAllHref, viewAllLabel = "View all", id }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        {eyebrow && <p className="text-xs font-semibold text-terracotta">{eyebrow}</p>}
        <h2 id={id} className="text-[1.375rem] font-bold text-ink md:text-[1.75rem]">
          {title}
        </h2>
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 font-heading text-sm font-semibold text-ink hover:text-brown-light"
        >
          {viewAllLabel}
          <span className="sr-only">: {title}</span>
          <ChevronRight className="size-4" {...iconProps} />
        </Link>
      )}
    </div>
  );
}
