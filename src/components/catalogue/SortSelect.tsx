"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { iconProps } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { SORT_OPTIONS, catalogueHref, toQueryString, type CatalogueParams } from "@/lib/catalogue/params";
import type { ProductSort } from "@/lib/catalogue/types";

type SortSelectProps = {
  pathname: string;
  params: CatalogueParams;
  /** Full width under 768 px (All products, where Sort sits on its own row on phones). */
  stretch?: boolean;
};

/** "Sort by" select. Changing it updates the URL; without JavaScript it is a small GET form. */
export function SortSelect({ pathname, params, stretch = false }: SortSelectProps) {
  const router = useRouter();
  const id = useId();
  // The other filters travel with the form, so sorting keeps them.
  const kept = [...new URLSearchParams(toQueryString({ ...params, sort: "popular", page: 1 }))];

  return (
    <form method="get" action={pathname} className={cn("flex items-center gap-2", stretch && "max-md:w-full")}>
      {kept.map(([name, value], index) => (
        <input key={`${name}-${index}`} type="hidden" name={name} value={value} />
      ))}
      <div
        className={cn(
          "relative flex min-h-11 items-center rounded-input border border-line bg-field pl-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brown",
          stretch && "max-md:flex-1",
        )}
      >
        <label htmlFor={id} className="text-[0.8125rem] whitespace-nowrap text-muted max-sm:sr-only">
          Sort by:
        </label>
        <select
          id={id}
          name="sort"
          value={params.sort}
          onChange={(event) =>
            router.push(catalogueHref(pathname, params, { sort: event.target.value as ProductSort }), {
              scroll: false,
            })
          }
          className={cn(
            "min-h-11 cursor-pointer appearance-none bg-transparent py-2 pr-9 pl-1 font-heading text-[0.8125rem] font-semibold text-ink focus-visible:outline-none",
            stretch && "max-md:flex-1",
          )}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink"
          {...iconProps}
        />
      </div>
      <noscript>
        <button type="submit" className={buttonClasses({ variant: "secondary", size: "small" })}>
          Sort
        </button>
      </noscript>
    </form>
  );
}
