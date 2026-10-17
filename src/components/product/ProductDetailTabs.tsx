"use client";

import type { ReactNode } from "react";
import { useTabs } from "@/hooks/useTabs";
import { cn } from "@/lib/cn";

type ProductDetailTabsProps = {
  /** Accessible name for the tab list. */
  label: string;
  tabs: { key: string; label: string; panel: ReactNode }[];
};

/** Description / Specifications / Delivery & returns: underlined tabs (ARIA tabs pattern, see useTabs). */
export function ProductDetailTabs({ label, tabs }: ProductDetailTabsProps) {
  const { selected, tabProps, panelProps } = useTabs(tabs.map((tab) => tab.key));

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label={label}
        // Tighter under 640 px so all three tabs fit at 360 px; still scrolls if a label ever runs longer.
        className="flex gap-3 overflow-x-auto border-b border-line [scrollbar-width:none] sm:gap-7 [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            {...tabProps(index)}
            className={cn(
              "-mb-px min-h-11 shrink-0 border-b-2 text-xs whitespace-nowrap sm:text-[0.9375rem] transition-colors motion-reduce:transition-none",
              index === selected
                ? "border-brown font-semibold text-ink"
                : "border-transparent text-muted hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div key={tab.key} {...panelProps(index)}>
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
