"use client";

import type { ReactNode } from "react";
import { useTabs } from "@/hooks/useTabs";
import { cn } from "@/lib/cn";

type ProductTabsProps = {
  /** The section heading, shown beside the tabs from 768 px. */
  heading: ReactNode;
  /** Accessible name for the tab list. */
  label: string;
  tabs: { key: string; label: string; panel: ReactNode }[];
};

/** Tabs following the ARIA tabs pattern (see useTabs), with the heading beside them. */
export function ProductTabs({ heading, label, tabs }: ProductTabsProps) {
  const { selected, tabProps, panelProps } = useTabs(tabs.map((tab) => tab.key));

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
              {...tabProps(index)}
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
        <div key={tab.key} {...panelProps(index)}>
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
