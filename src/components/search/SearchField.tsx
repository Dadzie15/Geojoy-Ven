"use client";

import { Search } from "lucide-react";
import { useRef, useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { iconProps } from "@/components/ui/icon";
import { MAX_QUERY_LENGTH } from "@/lib/catalogue/params";

/**
 * The Search page's large search field, prefilled with the query. "Clear" empties it and keeps focus
 * in it. A plain GET form to /search, so it works without JavaScript. Give it key={query} so a new
 * search resets the field.
 */
export function SearchField({ query }: { query: string }) {
  const [value, setValue] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = "search-page-input";

  function clear() {
    setValue("");
    inputRef.current?.focus();
  }

  return (
    <form
      action="/search"
      role="search"
      aria-label="Search products"
      className="flex min-h-14 items-center gap-2 rounded-input border border-brown bg-field py-1.5 pr-1.5 pl-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brown"
    >
      <Search className="size-5 shrink-0 text-ink" {...iconProps} />
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        ref={inputRef}
        id={id}
        name="q"
        type="search"
        maxLength={MAX_QUERY_LENGTH}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search for products"
        // The field's own outline is on the form (focus-within); the browser's clear "x" is replaced by "Clear".
        className="min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-muted focus-visible:outline-none [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          className="inline-flex min-h-11 shrink-0 items-center rounded-input px-2 text-[0.8125rem] text-muted underline underline-offset-4 hover:text-ink"
        >
          Clear<span className="sr-only"> search</span>
        </button>
      )}
      <button type="submit" className={buttonClasses({ className: "shrink-0 px-4 text-[0.8125rem] sm:px-5" })}>
        Search
      </button>
    </form>
  );
}
