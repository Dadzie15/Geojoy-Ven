"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type ProductTabsProps = {
  /** The section heading, shown beside the tabs from 768 px. */
  heading: ReactNode;
  /** Accessible name for the tab list. */
  label: string;
  tabs: { key: string; label: string; panel: ReactNode }[];
};

/**
 * Tabs following the ARIA tabs pattern: one Tab stop, arrow keys / Home / End move
 * between tabs and select them, and each panel is labelled by its tab.
 */
export function ProductTabs({ heading, label, tabs }: ProductTabsProps) {
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  function select(index: number) {
    setSelected(index);
    tabRefs.current[index]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const last = tabs.length - 1;
    const next: Record<string, number> = {
      ArrowRight: selected === last ? 0 : selected + 1,
      ArrowLeft: selected === 0 ? last : selected - 1,
      Home: 0,
      End: last,
    };
    if (event.key in next) {
      event.preventDefault();
      select(next[event.key]);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-6">
        {heading}
        <div
          role="tablist"
          aria-label={label}
          className="-mx-2 flex min-w-0 overflow-x-auto [scrollbar-width:none] md:-mr-2 md:ml-0 [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.key}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.key}`}
              aria-selected={index === selected}
              aria-controls={`${baseId}-panel-${tab.key}`}
              tabIndex={index === selected ? 0 : -1}
              onClick={() => setSelected(index)}
              onKeyDown={onKeyDown}
              className={cn(
                "min-h-11 shrink-0 rounded-input px-2 font-heading text-[0.8125rem] font-medium whitespace-nowrap",
                index === selected ? "text-ink underline underline-offset-4" : "text-muted hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.key}
          role="tabpanel"
          id={`${baseId}-panel-${tab.key}`}
          aria-labelledby={`${baseId}-tab-${tab.key}`}
          hidden={index !== selected}
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
