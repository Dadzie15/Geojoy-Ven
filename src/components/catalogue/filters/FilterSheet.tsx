"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { iconProps } from "@/components/ui/icon";
import { useModal } from "@/hooks/useModal";
import { cn } from "@/lib/cn";
import {
  catalogueHref,
  clearedParams,
  countActiveFilters,
  toQueryString,
  type CatalogueParams,
} from "@/lib/catalogue/params";
import { FiltersForm, type FilterOptions } from "./FiltersForm";

const COUNT_DELAY_MS = 300;

type FilterSheetProps = FilterOptions & {
  pathname: string;
  params: CatalogueParams;
  /** Products matching the applied filters. */
  total: number;
  /** Server action: products matching a query string such as "?type=kettles". */
  countAction: (query: string) => Promise<number>;
};

/** Phones and tablets: a "Filter (n)" button that opens the filters in a bottom sheet with "Show N products". */
export function FilterSheet({ pathname, params, total, countAction, ...options }: FilterSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(params);
  const [count, setCount] = useState(total);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const close = useCallback(() => setOpen(false), []);
  useModal({ open, onClose: close, containerRef: panelRef, returnFocusRef: triggerRef });

  const appliedKey = toQueryString(params);
  const draftKey = toQueryString(draft);
  const activeCount = countActiveFilters(params);

  // Live count for the draft. Only the latest request may update it.
  useEffect(() => {
    if (!open || draftKey === appliedKey) return;
    let current = true;
    const timer = setTimeout(async () => {
      const next = await countAction(draftKey);
      if (current) setCount(next);
    }, COUNT_DELAY_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [open, draftKey, appliedKey, countAction]);

  function openSheet() {
    setDraft(params);
    setCount(total);
    setOpen(true);
  }

  function apply() {
    setOpen(false);
    if (draftKey !== appliedKey) router.push(catalogueHref(pathname, draft), { scroll: false });
  }

  const shownCount = draftKey === appliedKey ? total : count;
  const formId = "sheet-filters";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openSheet}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={buttonClasses({ variant: "secondary", className: "px-4" })}
      >
        <SlidersHorizontal className="size-4" {...iconProps} />
        Filter{activeCount > 0 && ` (${activeCount})`}
        {activeCount > 0 && <span className="sr-only"> filters active</span>}
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50",
          open ? "visible" : "invisible transition-[visibility] duration-200 motion-reduce:transition-none",
        )}
      >
        <div
          aria-hidden="true"
          onClick={close}
          className={cn(
            "absolute inset-0 bg-ink/40 transition-opacity duration-200 motion-reduce:transition-none",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(
            "absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-panel bg-background shadow-panel transition-transform duration-200 motion-reduce:transition-none",
            open ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-line py-2 pr-2 pl-4">
            <h2 id={titleId} className="text-base font-bold text-ink">
              Filters
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close filters"
              className="grid size-11 place-items-center rounded-input text-ink"
            >
              <X className="size-6" {...iconProps} />
            </button>
          </div>
          <div className="overflow-y-auto px-4 py-4">
            <FiltersForm
              id={formId}
              action={pathname}
              value={draft}
              onChange={(next) => setDraft(next)}
              onSubmit={apply}
              {...options}
            />
          </div>
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-t border-line p-4">
            <Button variant="secondary" onClick={() => setDraft(clearedParams(draft))}>
              Clear all
            </Button>
            <Button type="submit" form={`${formId}-form`}>
              Show {shownCount} {shownCount === 1 ? "product" : "products"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
