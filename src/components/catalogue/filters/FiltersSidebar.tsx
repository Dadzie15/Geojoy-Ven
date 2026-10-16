"use client";

import { Filter } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { iconProps } from "@/components/ui/icon";
import { catalogueHref, clearedParams, toQueryString, type CatalogueParams } from "@/lib/catalogue/params";
import { FiltersForm, type FilterChangeKind, type FilterOptions } from "./FiltersForm";

const SLIDER_DELAY_MS = 400;

type FiltersSidebarProps = FilterOptions & { pathname: string; params: CatalogueParams };

/** Desktop filters panel: every change goes straight into the URL (slider changes after a short pause). */
export function FiltersSidebar({ pathname, params, ...options }: FiltersSidebarProps) {
  const router = useRouter();
  const [value, setValue] = useState(params);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // When the URL changes (back button, chips, sheet), show what the URL says.
  const appliedKey = toQueryString(params);
  const [syncedKey, setSyncedKey] = useState(appliedKey);
  if (appliedKey !== syncedKey) {
    setSyncedKey(appliedKey);
    setValue(params);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  function apply(next: CatalogueParams) {
    clearTimeout(timer.current);
    if (toQueryString(next) !== appliedKey) router.push(catalogueHref(pathname, next), { scroll: false });
  }

  function handleChange(next: CatalogueParams, kind: FilterChangeKind) {
    setValue(next);
    clearTimeout(timer.current);
    if (kind === "slider") timer.current = setTimeout(() => apply(next), SLIDER_DELAY_MS);
    else apply(next);
  }

  return (
    <div className="rounded-panel border border-line bg-card p-6 shadow-panel">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-ink">
          <Filter className="size-4" {...iconProps} />
          Filters
        </h2>
        <Link
          href={catalogueHref(pathname, clearedParams(params))}
          scroll={false}
          className="inline-flex min-h-11 items-center text-[0.8125rem] text-terracotta underline underline-offset-4 hover:text-brown"
        >
          Clear all<span className="sr-only"> filters</span>
        </Link>
      </div>
      <FiltersForm
        id="sidebar-filters"
        action={pathname}
        value={value}
        onChange={handleChange}
        onSubmit={() => apply(value)}
        {...options}
      />
    </div>
  );
}
