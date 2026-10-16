"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { iconProps } from "@/components/ui/icon";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { cn } from "@/lib/cn";

type ExploreCategory = { id: string; name: string; slug: string; productCount: number };

const twoDigits = (value: number) => String(value).padStart(2, "0");

/** Every top-level category with its product count. Swipes on phones; the pager moves it from 768 px. */
export function CategoryExploreStrip({ categories }: { categories: ExploreCategory[] }) {
  const { ref, atStart, atEnd, page, pages, scrollPage } = useHorizontalScroll<HTMLUListElement>();
  if (categories.length === 0) return null;

  const pagerButton = (direction: 1 | -1, disabled: boolean) => {
    const Icon = direction === 1 ? ChevronRight : ChevronLeft;
    return (
      <button
        type="button"
        aria-label={direction === 1 ? "Next categories" : "Previous categories"}
        aria-disabled={disabled}
        onClick={disabled ? undefined : () => scrollPage(direction)}
        className={cn("grid size-11 place-items-center rounded-input", disabled ? "text-muted" : "text-ink")}
      >
        <Icon className="size-4" {...iconProps} />
      </button>
    );
  };

  return (
    <section aria-labelledby="explore-title" className="rounded-panel bg-card px-6 pt-4 pb-2 shadow-panel sm:px-8 sm:pt-5">
      <h2 id="explore-title" className="sr-only">
        Explore categories
      </h2>
      <ul
        ref={ref}
        aria-labelledby="explore-title"
        className="relative flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex w-1/2 shrink-0 snap-start justify-center sm:w-1/3 lg:w-1/4 lg:[&:nth-child(4n)]:justify-end lg:[&:nth-child(4n+1)]:justify-start"
          >
            <div className="flex flex-col items-center text-center">
              <p className="font-heading text-sm font-semibold text-ink">
                {category.name}{" "}
                <span className="align-super text-[0.6875rem] font-normal text-muted">
                  {category.productCount}
                  <span className="sr-only"> products</span>
                </span>
              </p>
              <Link
                href={`/category/${category.slug}`}
                className="inline-flex min-h-11 items-center text-xs font-semibold text-terracotta underline underline-offset-4 hover:text-brown focus-visible:outline-offset-[-2px]"
              >
                Explore<span className="sr-only"> {category.name}</span>
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {pages > 1 && (
        <div className="-mr-3 hidden items-center justify-end md:flex">
          {pagerButton(-1, atStart)}
          <p className="flex items-center gap-2 font-heading text-xs">
            <span className="sr-only">
              Page {page} of {pages}
            </span>
            <span aria-hidden="true" className="font-semibold text-ink">
              {twoDigits(page)}
            </span>
            <span aria-hidden="true" className="h-px w-8 bg-line" />
            <span aria-hidden="true" className="text-muted">
              {twoDigits(pages)}
            </span>
          </p>
          {pagerButton(1, atEnd)}
        </div>
      )}
    </section>
  );
}
