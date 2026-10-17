"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";

/**
 * State and ARIA props for the tabs pattern: one Tab stop, arrow keys / Home / End move
 * between tabs and select them, and each panel is labelled by its tab.
 */
export function useTabs(keys: string[]) {
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  function select(index: number) {
    setSelected(index);
    tabRefs.current[index]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const last = keys.length - 1;
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

  function tabProps(index: number) {
    const key = keys[index];
    return {
      ref: (node: HTMLButtonElement | null) => {
        tabRefs.current[index] = node;
      },
      type: "button" as const,
      role: "tab",
      id: `${baseId}-tab-${key}`,
      "aria-selected": index === selected,
      "aria-controls": `${baseId}-panel-${key}`,
      tabIndex: index === selected ? 0 : -1,
      onClick: () => setSelected(index),
      onKeyDown,
    };
  }

  function panelProps(index: number) {
    const key = keys[index];
    return {
      role: "tabpanel",
      id: `${baseId}-panel-${key}`,
      "aria-labelledby": `${baseId}-tab-${key}`,
      hidden: index !== selected,
    };
  }

  return { selected, tabProps, panelProps };
}
