import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { iconProps } from "@/components/ui/icon";

/** The last item is the current page and has no href. */
export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 text-[0.8125rem]">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="size-4 text-ink" {...iconProps} />}
            {item.href ? (
              <Link href={item.href} className="inline-flex min-h-11 items-center text-muted hover:text-ink">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
