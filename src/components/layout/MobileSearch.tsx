"use client";

import { Search, X } from "lucide-react";
import { useRef, useState } from "react";
import { iconProps } from "@/components/ui/icon";
import { SearchForm } from "./SearchForm";

const PANEL_ID = "mobile-search";

/** Phone-only search icon that opens a full-width search row under the header. */
export function MobileSearch() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  const Icon = open ? X : Search;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? "Close search" : "Search"}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={() => setOpen((value) => !value)}
        className="grid size-11 place-items-center rounded-input text-ink md:hidden"
      >
        <Icon className="size-6" {...iconProps} />
      </button>
      {open && (
        <div
          id={PANEL_ID}
          onKeyDown={(event) => event.key === "Escape" && close()}
          className="absolute inset-x-0 top-full z-30 border-b border-line bg-background px-4 py-3 md:hidden"
        >
          <SearchForm id="mobile-search-input" autoFocus />
        </div>
      )}
    </>
  );
}
