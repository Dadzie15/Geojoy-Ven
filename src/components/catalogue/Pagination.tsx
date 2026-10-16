import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { iconProps } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

type PaginationProps = {
  /** Current page, 1 to pageCount. */
  page: number;
  pageCount: number;
  /** URL of a page, e.g. (n) => catalogueHref("/products", params, { page: n }). */
  hrefFor: (page: number) => string;
};

/** Up to this many pages are all listed; beyond it, distant pages collapse into "…". */
const MAX_LISTED = 7;

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, index) => from + index);

/** 1 2 3 4 5 6 7, or 1 … 4 5 6 … 12 (null is a gap). Always MAX_LISTED items when there are more pages. */
function pageItems(page: number, pageCount: number): (number | null)[] {
  if (pageCount <= MAX_LISTED) return range(1, pageCount);
  // First, last and the pages either side of the current one; near an end, the first or last five.
  let start = page - 1;
  let end = page + 1;
  if (page <= 4) [start, end] = [2, 5];
  if (page >= pageCount - 3) [start, end] = [pageCount - 4, pageCount - 1];
  return [1, ...(start > 2 ? [null] : []), ...range(start, end), ...(end < pageCount - 1 ? [null] : []), pageCount];
}

const boxClasses =
  "grid size-11 place-items-center rounded-input border font-heading text-[0.8125rem] font-semibold transition-colors motion-reduce:transition-none";
const linkClasses = cn(boxClasses, "border-line bg-field text-ink hover:bg-sand-tint");

/**
 * Numbered pagination as plain links (?page=n), so it works without JavaScript and the back button
 * returns to the previous page. Phones show previous, current and next only.
 */
export function Pagination({ page, pageCount, hrefFor }: PaginationProps) {
  if (pageCount <= 1) return null;

  const step = (target: number, label: string, Icon: typeof ChevronLeft) =>
    target >= 1 && target <= pageCount ? (
      <Link href={hrefFor(target)} aria-label={label} className={linkClasses}>
        <Icon className="size-4" {...iconProps} />
      </Link>
    ) : (
      <span aria-hidden="true" className={cn(boxClasses, "border-line text-muted/50")}>
        <Icon className="size-4" {...iconProps} />
      </span>
    );

  return (
    <nav aria-label="Pagination">
      <ul className="flex items-center justify-center gap-2">
        <li>{step(page - 1, "Previous page", ChevronLeft)}</li>
        {pageItems(page, pageCount).map((item, index) =>
          item === null ? (
            <li key={`gap-${index}`} aria-hidden="true" className="grid size-11 place-items-center text-muted max-md:hidden">
              …
            </li>
          ) : (
            <li key={item} className={cn(item !== page && "max-md:hidden")}>
              <Link
                href={hrefFor(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={item === page ? cn(boxClasses, "border-brown bg-brown text-field") : linkClasses}
              >
                {item}
              </Link>
            </li>
          ),
        )}
        <li>{step(page + 1, "Next page", ChevronRight)}</li>
      </ul>
    </nav>
  );
}
