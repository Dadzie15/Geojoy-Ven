"use client";

import { ChevronDown } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { iconProps } from "@/components/ui/icon";
import type { CatalogueParams } from "@/lib/catalogue/params";
import { PriceRangeField, type PriceBounds } from "./PriceRangeField";

export type TypeOption = { slug: string; name: string; count: number };

/** What a listing page offers to filter on. */
export type FilterOptions = {
  /** Child categories for the "Type" filter; empty hides the section. */
  types: TypeOption[];
  /** Price filter bounds in whole cedis; null hides the section. */
  priceBounds: PriceBounds | null;
};

export type FilterChangeKind = "toggle" | "slider" | "input";

type FiltersFormProps = FilterOptions & {
  /** Prefix for element ids, so the sidebar and the sheet can both be on the page. */
  id: string;
  /** The listing URL; the form is a plain GET form there, so it also works without JavaScript. */
  action: string;
  value: CatalogueParams;
  onChange: (next: CatalogueParams, kind: FilterChangeKind) => void;
  onSubmit: () => void;
};

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details open className="group border-t border-line py-3 first:border-t-0 first:pt-0">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-input font-heading text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          className="size-4 -rotate-90 transition-transform group-open:rotate-0 motion-reduce:transition-none"
          {...iconProps}
        />
      </summary>
      <fieldset className="mt-1">
        <legend className="sr-only">{title}</legend>
        {children}
      </fieldset>
    </details>
  );
}

/** Type, Price and Availability filters. Shared by the desktop sidebar and the phone bottom sheet. */
export function FiltersForm({ id, action, value, onChange, onSubmit, types, priceBounds }: FiltersFormProps) {
  function toggleType(slug: string, checked: boolean) {
    const next = checked ? [...value.types, slug] : value.types.filter((type) => type !== slug);
    onChange({ ...value, types: next }, "toggle");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form id={`${id}-form`} method="get" action={action} onSubmit={handleSubmit}>
      {types.length > 0 && (
        <FilterSection title="Type">
          {types.map((type) => (
            <Checkbox
              key={type.slug}
              id={`${id}-type-${type.slug}`}
              name="type"
              value={type.slug}
              checked={value.types.includes(type.slug)}
              onChange={(event) => toggleType(type.slug, event.target.checked)}
              label={
                <>
                  {type.name}
                  <span className="-ml-1 text-xs text-muted">
                    {type.count}
                    <span className="sr-only"> products</span>
                  </span>
                </>
              }
            />
          ))}
        </FilterSection>
      )}

      {priceBounds && (
        <FilterSection title="Price (GHS)">
          <PriceRangeField
            idPrefix={`${id}-price`}
            bounds={priceBounds}
            min={value.min}
            max={value.max}
            onChange={(min, max, source) => onChange({ ...value, min, max }, source)}
          />
        </FilterSection>
      )}

      <FilterSection title="Availability">
        <Checkbox
          id={`${id}-stock`}
          name="stock"
          value="1"
          label="In stock"
          checked={value.inStock}
          onChange={(event) => onChange({ ...value, inStock: event.target.checked }, "toggle")}
        />
        <Checkbox
          id={`${id}-sale`}
          name="sale"
          value="1"
          label="On sale"
          checked={value.onSale}
          onChange={(event) => onChange({ ...value, onSale: event.target.checked }, "toggle")}
        />
      </FilterSection>

      {value.sort !== "popular" && <input type="hidden" name="sort" value={value.sort} />}
      <noscript>
        <button type="submit" className={buttonClasses({ className: "mt-4 w-full" })}>
          Apply filters
        </button>
      </noscript>
    </form>
  );
}
